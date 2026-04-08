import type { ApiDefinition } from '../types/api';

export interface SmartResponse {
  answer: string;
  relatedApis: ApiDefinition[];
  suggestedFlows?: {
    title: string;
    steps: ApiDefinition[];
  }[];
  inferredParams?: Record<string, string>;
  bestMatch?: ApiDefinition;
}

export const useSmartAssistant = (apis: ApiDefinition[]) => {
  const getSmartResponse = (query: string): SmartResponse => {
    if (!query.trim()) {
      return {
        answer: 'Chào bạn! Tôi có thể giúp bạn tìm kiếm và liên kết các API trong PMS. Hãy nhập nội dung cần tìm nhé.',
        relatedApis: [],
      };
    }

    const lowerQuery = query.toLowerCase();
    const inferredParams: Record<string, string> = {};

    // --- Intelligence Layer: Parse specific parameters ---
    
    // Detect Year
    const yearMatch = lowerQuery.match(/năm\s+(\d{4})/);
    const year = yearMatch ? yearMatch[1] : null;

    // Detect Quarter
    const quarterMatch = lowerQuery.match(/quí\s+([1-4])/);
    const quarter = quarterMatch ? quarterMatch[1] : null;

    // Ticket List (Ds Phiếu) Detection
    const isTicketListQuery = lowerQuery.includes('phiếu') || lowerQuery.includes('ticket');

    if (year && quarter) {
      if (isTicketListQuery) {
        // Mapping Quarter to Date Range for Ds Phiếu API (YYYY/MM format)
        const startMonth = (parseInt(quarter) - 1) * 3 + 1;
        const endMonth = startMonth + 2;
        inferredParams['UsedDateFrom'] = `${year}/${startMonth.toString().padStart(2, '0')}`;
        inferredParams['UsedDateTo'] = `${year}/${endMonth.toString().padStart(2, '0')}`;
      } else {
        inferredParams['usedMonth'] = `${year}/Q${quarter}`;
        inferredParams['monthDeploy'] = `${year}/${quarter.padStart(2, '0')}`;
      }
    } else if (year) {
      inferredParams['year'] = year;
    }

    // Detect Status / Action
    if (lowerQuery.includes('triển khai')) {
      inferredParams['status'] = 'deployed';
    }

    // --- Scoring Layer ---
    const scoredApis = apis.map(api => {
      let score = 0;
      const name = api.displayName.toLowerCase();
      const toolName = api.toolName.toLowerCase();
      const url = api.url.toLowerCase();
      const folder = api.folder.toLowerCase();

      // Keyword matching
      if (name.includes(lowerQuery) || toolName.includes(lowerQuery)) score += 10;
      if (url.includes(lowerQuery) || folder.includes(lowerQuery)) score += 5;

      // Semantic matching for "Phiếu" (Ticket/Slip)
      if (isTicketListQuery) {
        if (name.includes('phiếu') || name.includes('ticket')) score += 50;
        if (folder.includes('ticket') || folder.includes('manager')) score += 30;
        
        // HARD BOOST: Prioritize the GET publication endpoint (Ticket List)
        // explicitly check URL to distinguish from general publication lists
        if (url.endsWith('pmsmarketing/publication') && api.method === 'GET') {
          score += 200; // Force to the top
        }
      }

      // Semantic matching for "Ấn phẩm" (Publication)
      const isPublicationQuery = lowerQuery.includes('ấn phẩm') || lowerQuery.includes('publication');
      if (isPublicationQuery) {
        if (folder.includes('publication') || name.includes('ấn phẩm')) score += 20;
        if (url.includes('publication')) score += 15;
      }

      // Semantic matching for "Triển khai" (Deploy)
      const isDeployQuery = lowerQuery.includes('triển khai') || lowerQuery.includes('deploy');
      if (isDeployQuery) {
        if (name.includes('triển khai') || name.includes('deploy') || name.includes('exist')) score += 20;
        if (url.includes('confirmed') || url.includes('check')) score += 15;
      }

      // Reward matching multiple inferred params
      if (Object.keys(inferredParams).length > 0) {
        const hasMatchingParam = api.queryParams.some(p => 
          Object.keys(inferredParams).some(key => p.key.toLowerCase() === key.toLowerCase())
        );
        if (hasMatchingParam) score += 25;
      }

      return { api, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

    const relatedApis = scoredApis.slice(0, 5).map(item => item.api);

    // --- Answer Building ---
    let answer = '';
    if (relatedApis.length === 0) {
      answer = `Tôi không tìm thấy API nào liên quan trực tiếp đến "${query}". Bạn có thể thử với các từ khóa khác như "login", "ấn phẩm", hoặc "phiếu".`;
    } else {
      if (year && quarter) {
        const targetType = isTicketListQuery ? 'Danh sách phiếu' : 'Dữ liệu ấn phẩm';
        answer = `Tôi đã tìm thấy API phù hợp để lấy **${targetType}** cho **Quý ${quarter} năm ${year}**. Tôi đã tự động thiết lập các tham số thời gian phù hợp (ví dụ: UsedDateFrom/To) để bạn trích xuất dữ liệu chính xác nhất.`;
      } else {
        answer = `Dựa trên yêu cầu "${query}", tôi đã tìm thấy ${relatedApis.length} API có liên quan. Các API này giúp xử lý các tác vụ như: ${relatedApis.map(a => a.displayName).join(', ')}.`;
      }
    }

    // Suggested Flows
    const suggestedFlows: { title: string; steps: ApiDefinition[] }[] = [];
    
    // Auth Flow
    if (lowerQuery.includes('login') || lowerQuery.includes('xác thực')) {
      const loginApi = apis.find(a => a.toolName.includes('login') || a.url.includes('login'));
      const menuApi = apis.find(a => a.url.includes('menu'));
      if (loginApi && menuApi) {
        suggestedFlows.push({
          title: 'Quy trình Đăng nhập & Lấy Menu',
          steps: [loginApi, menuApi],
        });
      }
    }

    // Publication Flow
    if (lowerQuery.includes('ấn phẩm') || lowerQuery.includes('triển khai') || isTicketListQuery) {
      const listApi = apis.find(a => (a.displayName.includes('danh sách ấn phẩm') || a.displayName.includes('Ds Phiếu')) && a.method === 'GET');
      const checkApi = apis.find(a => a.displayName.includes('check triễn khai') || a.url.includes('checkExistV3'));
      if (listApi && checkApi) {
        suggestedFlows.push({
          title: 'Quy trình Quản lý Phiếu Ấn phẩm',
          steps: [listApi, checkApi],
        });
      }
    }

    return {
      answer,
      relatedApis,
      suggestedFlows: suggestedFlows.length > 0 ? suggestedFlows : undefined,
      inferredParams: Object.keys(inferredParams).length > 0 ? inferredParams : undefined,
      bestMatch: scoredApis.length > 0 ? scoredApis[0].api : undefined,
    };
  };

  return { getSmartResponse };
};
