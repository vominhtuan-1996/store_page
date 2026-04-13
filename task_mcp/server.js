#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const server = new McpServer({
  name: 'task-manager',
  version: '2.0.0',
});

// ─── create_task ──────────────────────────────────────────────────────────────
server.registerTool(
  'create_task',
  {
    description: 'Tạo task mới được giao cho Claude. Dùng khi user giao việc cần theo dõi tiến độ.',
    inputSchema: z.object({
      title:       z.string().describe('Tiêu đề ngắn gọn của task'),
      description: z.string().optional().describe('Mô tả chi tiết nội dung cần làm'),
      priority:    z.enum(['low', 'normal', 'high']).optional().describe('Độ ưu tiên. Mặc định: normal'),
    }),
  },
  async ({ title, description, priority = 'normal' }) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, description, priority, status: 'pending' })
      .select()
      .single();

    if (error) return { content: [{ type: 'text', text: `Lỗi: ${error.message}` }], isError: true };

    return {
      content: [{ type: 'text', text: `✅ Đã tạo task:\n\n${formatTask(data)}` }],
    };
  }
);

// ─── list_tasks ───────────────────────────────────────────────────────────────
server.registerTool(
  'list_tasks',
  {
    description: 'Xem danh sách tất cả tasks. Có thể filter theo status hoặc priority.',
    inputSchema: z.object({
      status:   z.enum(['pending', 'in_progress', 'done', 'cancelled', 'all']).optional()
                  .describe('Lọc theo trạng thái. Mặc định: all (trừ cancelled)'),
      priority: z.enum(['low', 'normal', 'high']).optional().describe('Lọc theo độ ưu tiên'),
    }),
  },
  async ({ status, priority }) => {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else if (!status) {
      query = query.neq('status', 'cancelled');
    }

    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;

    if (error) return { content: [{ type: 'text', text: `Lỗi: ${error.message}` }], isError: true };
    if (!data.length) return { content: [{ type: 'text', text: 'Không có task nào.' }] };

    const grouped = groupByStatus(data);
    const lines = [];
    for (const [st, items] of Object.entries(grouped)) {
      lines.push(`\n── ${statusLabel(st)} (${items.length}) ──`);
      items.forEach(t => lines.push(formatTask(t)));
    }

    return {
      content: [{ type: 'text', text: `📋 Danh sách tasks (${data.length}):\n${lines.join('\n')}` }],
    };
  }
);

// ─── update_task ──────────────────────────────────────────────────────────────
server.registerTool(
  'update_task',
  {
    description: 'Cập nhật task. Dùng để báo cáo tiến độ, lưu context làm việc, ghi next steps.',
    inputSchema: z.object({
      id:          z.string().describe('UUID của task cần cập nhật'),
      status:      z.enum(['pending', 'in_progress', 'done', 'cancelled']).optional()
                     .describe('Trạng thái mới'),
      title:       z.string().optional().describe('Tiêu đề mới'),
      description: z.string().optional().describe('Mô tả mới'),
      priority:    z.enum(['low', 'normal', 'high']).optional().describe('Độ ưu tiên mới'),
      notes:       z.string().optional().describe('Ghi chú kết quả hoặc vấn đề gặp phải'),
      context:     z.string().optional().describe('Context kỹ thuật: files đã sửa, approach, quyết định quan trọng — để Claude session sau đọc lại tiếp tục'),
      next_steps:  z.string().optional().describe('Các bước cần làm tiếp theo khi resume task'),
    }),
  },
  async ({ id, ...updates }) => {
    const patch = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    if (!Object.keys(patch).length) {
      return { content: [{ type: 'text', text: 'Không có trường nào được cập nhật.' }], isError: true };
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) return { content: [{ type: 'text', text: `Lỗi: ${error.message}` }], isError: true };

    return {
      content: [{ type: 'text', text: `✅ Đã cập nhật task:\n\n${formatTask(data, true)}` }],
    };
  }
);

// ─── get_task ─────────────────────────────────────────────────────────────────
server.registerTool(
  'get_task',
  {
    description: 'Xem chi tiết một task theo ID, bao gồm context và next_steps để resume công việc.',
    inputSchema: z.object({
      id: z.string().describe('UUID của task'),
    }),
  },
  async ({ id }) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { content: [{ type: 'text', text: `Lỗi: ${error.message}` }], isError: true };

    return {
      content: [{ type: 'text', text: formatTask(data, true) }],
    };
  }
);

// ─── resume_task ──────────────────────────────────────────────────────────────
server.registerTool(
  'resume_task',
  {
    description: 'Load context của task để tiếp tục làm việc. Trả về toàn bộ context, next_steps, notes để Claude hiểu ngay cần làm gì.',
    inputSchema: z.object({
      id: z.string().describe('UUID của task cần resume'),
    }),
  },
  async ({ id }) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { content: [{ type: 'text', text: `Lỗi: ${error.message}` }], isError: true };

    const lines = [
      `🔄 RESUME TASK`,
      ``,
      `📌 ${data.title}`,
      `   ID       : ${data.id}`,
      `   Status   : ${statusLabel(data.status)}`,
      `   Priority : ${priorityLabel(data.priority)}`,
      `   Tạo      : ${new Date(data.created_at).toLocaleString('vi-VN')}`,
      `   Cập nhật : ${new Date(data.updated_at).toLocaleString('vi-VN')}`,
    ];

    if (data.description) {
      lines.push(``, `📋 Mô tả:`, `   ${data.description}`);
    }

    if (data.context) {
      lines.push(``, `🧠 Context (những gì đã làm):`, ...data.context.split('\n').map(l => `   ${l}`));
    } else {
      lines.push(``, `🧠 Context: (chưa có — task chưa được bắt đầu)`);
    }

    if (data.next_steps) {
      lines.push(``, `👉 Next Steps:`, ...data.next_steps.split('\n').map(l => `   ${l}`));
    }

    if (data.notes) {
      lines.push(``, `📝 Notes:`, ...data.notes.split('\n').map(l => `   ${l}`));
    }

    lines.push(``, `─────────────────────────────────────────`);
    lines.push(`Claude: đọc context trên và tiếp tục xử lý task này.`);

    // Tự động set status in_progress nếu đang pending
    if (data.status === 'pending') {
      await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', id);
      lines.push(`✅ Đã cập nhật status → in_progress`);
    }

    return {
      content: [{ type: 'text', text: lines.join('\n') }],
    };
  }
);

// ─── delete_task ──────────────────────────────────────────────────────────────
server.registerTool(
  'delete_task',
  {
    description: 'Xóa vĩnh viễn một task. Thường nên dùng update_task với status=cancelled thay thế.',
    inputSchema: z.object({
      id: z.string().describe('UUID của task cần xóa'),
    }),
  },
  async ({ id }) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) return { content: [{ type: 'text', text: `Lỗi: ${error.message}` }], isError: true };
    return { content: [{ type: 'text', text: `🗑️ Đã xóa task ${id}` }] };
  }
);

// ─── task_summary ─────────────────────────────────────────────────────────────
server.registerTool(
  'task_summary',
  {
    description: 'Thống kê tổng quan số lượng task theo từng trạng thái.',
    inputSchema: z.object({}),
  },
  async () => {
    const { data, error } = await supabase.from('tasks').select('status, priority');
    if (error) return { content: [{ type: 'text', text: `Lỗi: ${error.message}` }], isError: true };

    const count = { pending: 0, in_progress: 0, done: 0, cancelled: 0 };
    const byPriority = { low: 0, normal: 0, high: 0 };
    data.forEach(t => {
      count[t.status] = (count[t.status] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });

    const active = count.pending + count.in_progress;
    const text = [
      `📊 Task Summary (tổng: ${data.length})`,
      ``,
      `Theo trạng thái:`,
      `  ⏳ Pending     : ${count.pending}`,
      `  🔄 In Progress : ${count.in_progress}`,
      `  ✅ Done        : ${count.done}`,
      `  ❌ Cancelled   : ${count.cancelled}`,
      ``,
      `Theo độ ưu tiên (active ${active} tasks):`,
      `  🔴 High   : ${byPriority.high}`,
      `  🟡 Normal : ${byPriority.normal}`,
      `  🟢 Low    : ${byPriority.low}`,
    ].join('\n');

    return { content: [{ type: 'text', text }] };
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusLabel(status) {
  return { pending: '⏳ Pending', in_progress: '🔄 In Progress', done: '✅ Done', cancelled: '❌ Cancelled' }[status] || status;
}

function priorityLabel(priority) {
  return { low: '🟢', normal: '🟡', high: '🔴' }[priority] || priority;
}

function formatTask(t, detail = false) {
  const lines = [
    `[${priorityLabel(t.priority)}] ${t.title}`,
    `  ID     : ${t.id}`,
    `  Status : ${statusLabel(t.status)}`,
    `  Tạo    : ${new Date(t.created_at).toLocaleString('vi-VN')}`,
  ];
  if (detail) {
    if (t.description) lines.push(`  Mô tả  : ${t.description}`);
    if (t.notes)       lines.push(`  Notes  : ${t.notes}`);
    if (t.context)     lines.push(`  Context: ${t.context.slice(0, 120)}${t.context.length > 120 ? '...' : ''}`);
    if (t.next_steps)  lines.push(`  Next   : ${t.next_steps}`);
    lines.push(`  Cập nhật: ${new Date(t.updated_at).toLocaleString('vi-VN')}`);
  }
  return lines.join('\n');
}

function groupByStatus(tasks) {
  const order = ['in_progress', 'pending', 'done', 'cancelled'];
  const groups = {};
  order.forEach(s => { groups[s] = []; });
  tasks.forEach(t => {
    if (!groups[t.status]) groups[t.status] = [];
    groups[t.status].push(t);
  });
  return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length > 0));
}

// ─── Start ────────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Task Manager MCP Server v2 running - 7 tools registered');
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
