import { supabase } from '../services/supabase';
import { parsePostmanCollection } from './postmanParser';
import type { ApiDefinition } from '../types/api';
import { workflowService } from '../features/workflow/workflowService';
import { executeWorkflow } from '../features/workflow/executeWorkflow';

const BASE_URL = import.meta.env.BASE_URL;
const PMS_BASE_URLS: Record<string, string> = {
  staging: 'https://apis-stag.fpt.vn',
  production: 'https://apis.fpt.vn',
};

let _cachedApis: ApiDefinition[] | null = null;
async function loadApis(): Promise<ApiDefinition[]> {
  if (_cachedApis) return _cachedApis;
  const res = await fetch(`${BASE_URL}PMS.postman.json`);
  const data = await res.json();
  _cachedApis = parsePostmanCollection(data);
  return _cachedApis;
}

function resolveUrl(rawUrl: string, env = 'staging'): string {
  const base = PMS_BASE_URLS[env] || PMS_BASE_URLS.staging;
  return rawUrl
    .replace(/\{\{baseUrl\}\}/g, base)
    .replace(/https:\/\/apis-stag\.fpt\.vn/g, base);
}

export interface ToolDeclaration {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const toolDeclarations: ToolDeclaration[] = [
  // --- Tasks ---
  {
    type: 'function',
    function: {
      name: 'list_tasks',
      description: 'Lấy danh sách các nhiệm vụ (tasks) hiện có. Có thể lọc theo trạng thái, user hoặc tool.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Lọc theo trạng thái',
            enum: ['pending', 'in_progress', 'done', 'cancelled'],
          },
          user: { type: 'string', description: 'Lọc theo tên người thực hiện' },
          tool: { type: 'string', description: 'Lọc theo feature/tool (vd: workflow, ai-agent)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Tạo một nhiệm vụ mới.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Tiêu đề nhiệm vụ' },
          description: { type: 'string', description: 'Mô tả chi tiết' },
          priority: { type: 'string', enum: ['low', 'normal', 'high'], description: 'Độ ưu tiên' },
          user: { type: 'string', description: 'Người thực hiện task' },
          tool: { type: 'string', description: 'Feature/tool liên quan (vd: workflow, ai-agent, pms-api)' },
        },
        required: ['title'],
      },
    },
  },
  // --- Storage ---
  {
    type: 'function',
    function: {
      name: 'list_storage_files',
      description: 'Liệt kê danh sách file trong một bucket storage.',
      parameters: {
        type: 'object',
        properties: {
          bucket_name: { type: 'string', description: 'Tên bucket (ví dụ: "files")' },
        },
        required: ['bucket_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_file_url',
      description: 'Lấy link tải (signed URL) cho một file cụ thể.',
      parameters: {
        type: 'object',
        properties: {
          bucket_name: { type: 'string', description: 'Tên bucket' },
          file_path: { type: 'string', description: 'Đường dẫn/tên file' },
        },
        required: ['bucket_name', 'file_path'],
      },
    },
  },
  // --- Telegram ---
  {
    type: 'function',
    function: {
      name: 'send_telegram_message',
      description: 'Gửi tin nhắn thông báo qua Telegram.',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Nội dung tin nhắn' },
        },
        required: ['text'],
      },
    },
  },
  // --- PMS Auth ---
  {
    type: 'function',
    function: {
      name: 'login_pms',
      description: 'Đăng nhập PMS để lấy auth token. Lưu token vào localStorage để dùng cho các API tiếp theo.',
      parameters: {
        type: 'object',
        properties: {
          userName: { type: 'string', description: 'Tên đăng nhập' },
          password: { type: 'string', description: 'Mật khẩu (chỉ cần cho loginInternal)' },
          useInternal: { type: 'boolean', description: 'true = dùng loginInternal (cần password), false = login token thường' },
        },
        required: ['userName'],
      },
    },
  },
  // --- PMS API Explorer ---
  {
    type: 'function',
    function: {
      name: 'search_pms_apis',
      description: 'Tìm kiếm các API endpoint trong PMS Postman collection theo từ khóa tên hoặc URL.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Từ khóa tìm kiếm (tên API, URL, hoặc folder)' },
          method: { type: 'string', description: 'Lọc theo HTTP method (GET, POST, PUT, DELETE)', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'call_pms_api',
      description: 'Gọi một PMS API endpoint. Cần có auth token trong localStorage (pms_auth_token). Dùng search_pms_apis trước để tìm toolName.',
      parameters: {
        type: 'object',
        properties: {
          tool_name: { type: 'string', description: 'toolName của API (lấy từ search_pms_apis)' },
          environment: { type: 'string', description: 'Môi trường', enum: ['staging', 'production'], },
          query_params: { type: 'object', description: 'Query parameters dạng key-value (tuỳ chọn)' },
          body: { type: 'object', description: 'Request body cho POST/PUT (tuỳ chọn)' },
        },
        required: ['tool_name'],
      },
    },
  },
  // --- Workflows ---
  {
    type: 'function',
    function: {
      name: 'list_workflows',
      description: 'Lấy danh sách các workflow đã lưu của người dùng.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_workflow',
      description: 'Chạy một workflow đã lưu theo ID. Workflow sẽ thực thi các API nodes theo thứ tự và trả về kết quả từng bước.',
      parameters: {
        type: 'object',
        properties: {
          workflow_id: { type: 'string', description: 'ID của workflow cần chạy (lấy từ list_workflows)' },
        },
        required: ['workflow_id'],
      },
    },
  },
];

export const toolHandlers: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  list_tasks: async ({ status, user, tool }) => {
    let query = supabase.from('tasks').select('id,title,status,priority,user,tool,updated_at').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status as string);
    if (user) query = query.eq('user', user as string);
    if (tool) query = query.eq('tool', tool as string);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },
  create_task: async ({ title, description, priority, user, tool }) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, description, priority: priority || 'normal', status: 'pending', user: user || null, tool: tool || null })
      .select();
    if (error) throw new Error(error.message);
    return data[0];
  },
  list_storage_files: async ({ bucket_name }) => {
    const { data, error } = await supabase.storage.from(bucket_name as string).list();
    if (error) throw new Error(error.message);
    return data;
  },
  get_file_url: async ({ bucket_name, file_path }) => {
    const { data, error } = await supabase.storage
      .from(bucket_name as string)
      .createSignedUrl(file_path as string, 3600);
    if (error) throw new Error(error.message);
    return { signedUrl: data.signedUrl };
  },
  send_telegram_message: async ({ text }) => {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) throw new Error('VITE_TELEGRAM_BOT_TOKEN hoặc VITE_TELEGRAM_CHAT_ID chưa được cấu hình');
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.description || 'Telegram error');
    return { message_id: json.result?.message_id, ok: true };
  },
  login_pms: async ({ userName, password, useInternal }) => {
    const base = 'https://apis-stag.fpt.vn';
    const endpoint = useInternal
      ? `${base}/pms/api/m/v1/users/loginInternal`
      : `${base}/pms/api/m/v1/users/login`;
    const body: Record<string, string> = { userName: userName as string };
    if (useInternal && password) body.password = password as string;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const token = data?.data?.token || data?.token || data?.accessToken;
    if (!token) throw new Error('Đăng nhập thất bại: ' + JSON.stringify(data));
    localStorage.setItem('pms_auth_token', token);
    return { success: true, message: 'Đăng nhập thành công, token đã lưu.' };
  },
  search_pms_apis: async ({ query, method }) => {
    const apis = await loadApis();
    const q = (query as string).toLowerCase();
    const results = apis.filter(api => {
      const matchQuery =
        api.displayName.toLowerCase().includes(q) ||
        api.url.toLowerCase().includes(q) ||
        api.folder.toLowerCase().includes(q) ||
        api.toolName.toLowerCase().includes(q);
      const matchMethod = !method || api.method === method;
      return matchQuery && matchMethod;
    }).slice(0, 10);
    return results.map(api => ({
      toolName: api.toolName,
      displayName: api.displayName,
      method: api.method,
      url: api.url,
      folder: api.folder,
      queryParams: api.queryParams.map(p => p.key),
      hasBody: !!api.bodySchema,
      bodyFields: api.bodySchema ? Object.keys(api.bodySchema) : [],
    }));
  },
  call_pms_api: async ({ tool_name, environment, query_params, body }) => {
    const apis = await loadApis();
    const api = apis.find(a => a.toolName === tool_name);
    if (!api) throw new Error(`Không tìm thấy API với toolName="${tool_name}". Dùng search_pms_apis để tìm.`);

    const token = localStorage.getItem('pms_auth_token');
    if (!token) throw new Error('Chưa có PMS auth token. Vào API Explorer để đăng nhập trước.');

    let url = resolveUrl(api.url, (environment as string) || 'staging');

    if (query_params && typeof query_params === 'object') {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query_params as Record<string, string>)) {
        if (v !== undefined && v !== null) params.set(k, String(v));
      }
      const qs = params.toString();
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const fetchOptions: RequestInit = { method: api.method, headers };
    if (body && ['POST', 'PUT', 'PATCH'].includes(api.method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOptions);
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    return { status: res.status, ok: res.ok, data };
  },
  list_workflows: async () => {
    const workflows = await workflowService.list();
    return workflows.map(wf => ({ id: wf.id, name: wf.name, description: wf.description, updated_at: wf.updated_at }));
  },
  run_workflow: async ({ workflow_id }) => {
    const result = await executeWorkflow(workflow_id as string);
    const summary = result.steps.map(s => ({
      node: s.nodeLabel,
      status: s.status,
      ...(s.status === 'error' ? { error: s.error } : {}),
      ...(s.durationMs !== undefined ? { ms: s.durationMs } : {}),
    }));
    return {
      workflow: result.workflowName,
      steps: summary,
      finalOutput: result.finalOutput,
      tokenSaved: result.tokenSaved,
    };
  },
};
