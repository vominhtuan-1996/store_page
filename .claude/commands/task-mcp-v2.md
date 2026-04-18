# Task MCP v2

Hệ thống quản lý task tích hợp Supabase. Gọi lệnh phù hợp dựa trên ý định user.

## Routing

Đọc nội dung sau `/task-mcp-v2` và tự động chọn hành động:

| Ý định | Hành động |
|---|---|
| Tạo / giao task mới | → chạy logic của `/task-create` |
| Cập nhật / đổi status / ghi chú | → chạy logic của `/task-update` |
| Xem danh sách task | → chạy logic của `/task-list` |
| Đánh dấu hoàn thành | → chạy logic của `/task-done` |
| Tiếp tục task đang làm | → chạy logic của `/task-resume` |
| Xem tổng quan tiến độ | → chạy logic của `/task-summary` |
| Xoá task | → chạy logic của `/task-delete` |

## Quy tắc chung (áp dụng cho mọi hành động)

### Auto-fill user
- `user` = `tuanvm37` — luôn điền tự động, không hỏi.

### Auto-infer tool
Phân tích context (files đang mở, nội dung task, conversation) để suy ra feature đang làm việc:

| Dấu hiệu | tool |
|---|---|
| `WorkflowBuilder`, `executeWorkflow`, `NodeConfigPanel`, `DataBrowser`, `interpolate` | `workflow-builder` |
| `AIAgent`, `agentService`, `toolRegistry`, `runAgent`, `groq` | `ai-agent` |
| `task-create`, `task-update`, `TaskManager`, `task-manager` | `task-mcp` |
| `TelegramSender`, `telegram`, `send_telegram` | `telegram` |
| `StorageManager`, `storage`, `upload` | `storage` |
| `deploy.yml`, `github-pages`, `.nojekyll`, `vite.config` | `deploy` |
| `supabase`, `workflowService`, `database` | `supabase` |
| `.env`, `secrets`, `API key` | `config` |

### Priority inference
- Mặc định: `normal`
- `high`: gấp / urgent / critical / quan trọng
- `low`: khi rảnh / sau này / low priority

### Context & next_steps
Sau mỗi task hoàn thành hoặc dừng: gọi `update_task` với `context` (đã làm gì, file nào) và `next_steps` (còn gì cần làm).

## Ví dụ

```
/task-mcp-v2 fix lỗi build gitpage
→ create_task(title="Fix lỗi build GitHub Pages", user="tuanvm37", tool="deploy", priority="high")

/task-mcp-v2 xem task đang làm
→ list_tasks(status="in_progress", user="tuanvm37")

/task-mcp-v2 xong task workflow builder
→ update_task(id=..., status="done")
```
