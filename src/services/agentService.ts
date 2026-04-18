import Groq from 'groq-sdk';
import { toolDeclarations, toolHandlers } from '../utils/toolRegistry';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface WorkflowSummary {
  id: string;
  name: string;
  description?: string | null;
}

function buildSystemPrompt(workflows: WorkflowSummary[]): string {
  const wfSection = workflows.length > 0
    ? workflows.map(w => `  - [${w.id}] "${w.name}"${w.description ? ` — ${w.description}` : ''}`).join('\n')
    : '  (chưa có workflow nào)';

  return `Bạn là PMS Assistant — chuyên gia quản lý POSM FPT. Trả lời tiếng Việt, dùng tools để thực thi tác vụ.

## WORKFLOWS ĐÃ LƯU
${wfSection}
→ Khi user nhắc tên hoặc mục đích của workflow ở trên: gọi run_workflow(workflow_id) ngay lập tức, không hỏi lại.
→ Nếu không chắc workflow nào phù hợp: gọi list_workflows trước để xem danh sách mới nhất.

## PMS API — CÁCH DÙNG PHỔ BIẾN
Dùng call_pms_api(tool_name, query_params?, body?) để gọi bất kỳ API nào.

LOGIN:
  call_pms_api("login_login_token", body:{userName}) → token tự lưu, dùng được cho các bước sau

DANH SÁCH PHIẾU:
  call_pms_api("managerticket_ds_phieu", query:{unitId, typePubId, status, UsedDateFrom, UsedDateTo, start:1, end:20})
  → UsedDateFrom/To format: yyyy/MM

TÌM MÃ HÀNG (POSM):
  call_pms_api("createticket_tim_kiem_ma_hang", query:{search, BranchId, MonthDeploy, Quarter, start:1, end:20})

TỒN KHO:
  call_pms_api("createticket_lay_so_luong_kha_dung", query:{BranchId, SupplyId, Quarter, MonthDeploy})
  call_pms_api("createticket_v3_lay_so_luong_kha_dung_v3", query:{BranchId, SupplyCode, CampaignId, monthDeploy})

CHIẾN DỊCH:
  call_pms_api("createticket_v3_danh_sach_chien_dich", query:{branchId})

MASTER DATA (không cần param):
  createticket_posmtype, createticket_posmstatus, createticket_manageunit,
  createticket_danh_sach_loai_trien_khai, createticket_province,
  publicationcategory_lay_danh_sach_loai_an_pham, premission_getpremission

MASTER DATA (có param):
  createticket_district(query:{locationId}), createticket_streets(query:{districtId,wardId}),
  createticket_list_users(query:{start,end,search}), createticket_getbranchfromuserid(query:{userId}),
  publicationcategory_lay_danh_sach_an_pham(query:{posmType,status,start,end,search})

TẠO PHIẾU v3 (3 bước):
  1. createticket_v3_check_trien_khai(body:{supplyCode,usedDate,usedMonth,locationId,districtId})
  2. createticket_v3_tao_phieu(body:{unitId,person,usedDate,branchId,usedMonths,infoPub,contactName,contactPhone,locationId,districtId,wardId,streetId,numHouse,lat,lng})
  3. createticket_v3_comfirm_phieu(body:{id, ...fields})

STORAGE: storage_get_image(query:{fileKey}), storage_upload_anh(POST)
OTHER: createticket_get_dia_chi(query:{latlng}), profile_sop, createticket_danh_sach_phieu_su_dung_chi_phi(query:{branchId,start,end})

Nếu không chắc tool_name: dùng search_pms_apis(query) để tìm trước.

## QUY TẮC
- Date: yyyy/MM · Pagination mặc định: start=1, end=20
- 401 → yêu cầu đăng nhập (login_login_token) trước
- Thiếu param bắt buộc → hỏi user, không tự đoán
- Kết quả nhiều item → tóm tắt số lượng + 3–5 ví dụ tiêu biểu
- Luôn ưu tiên workflow có sẵn thay vì gọi từng API riêng lẻ`;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentStep {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'answer';
  text?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: unknown;
  isError?: boolean;
}

export interface AgentRunResult {
  steps: AgentStep[];
  finalAnswer: string;
}

export const runAgent = async (
  userMessage: string,
  history: ChatMessage[],
  onStep: (step: AgentStep) => void,
  workflows: WorkflowSummary[] = [],
): Promise<AgentRunResult> => {
  const steps: AgentStep[] = [];
  const systemPrompt = buildSystemPrompt(workflows);

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content } as Groq.Chat.ChatCompletionMessageParam)),
    { role: 'user', content: userMessage },
  ];

  const MAX_ITERATIONS = 10;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      tools: toolDeclarations as Groq.Chat.ChatCompletionTool[],
      tool_choice: 'auto',
      max_tokens: 4096,
    });

    const choice = response.choices[0];
    const assistantMsg = choice.message;
    const toolCalls = assistantMsg.tool_calls;

    if (assistantMsg.content) {
      const isFinal = !toolCalls || toolCalls.length === 0;
      const step: AgentStep = { type: isFinal ? 'answer' : 'thinking', text: assistantMsg.content };
      steps.push(step);
      onStep(step);
    }

    if (!toolCalls || toolCalls.length === 0) {
      return { steps, finalAnswer: assistantMsg.content || '' };
    }

    messages.push(assistantMsg);

    for (const call of toolCalls) {
      const fnName = call.function.name;
      let fnArgs: Record<string, unknown> = {};
      try { fnArgs = JSON.parse(call.function.arguments || '{}'); } catch { /* ignore */ }

      const callStep: AgentStep = { type: 'tool_call', toolName: fnName, toolInput: fnArgs };
      steps.push(callStep);
      onStep(callStep);

      try {
        const handler = toolHandlers[fnName];
        if (!handler) throw new Error(`Tool "${fnName}" không tồn tại`);
        const toolResult = await handler(fnArgs);

        const resultStep: AgentStep = { type: 'tool_result', toolName: fnName, toolResult };
        steps.push(resultStep);
        onStep(resultStep);

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(toolResult),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const errStep: AgentStep = { type: 'tool_result', toolName: fnName, toolResult: msg, isError: true };
        steps.push(errStep);
        onStep(errStep);

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: `Error: ${msg}`,
        });
      }
    }
  }

  return { steps, finalAnswer: 'Đã đạt giới hạn vòng lặp.' };
};
