# Task Create

Tạo task mới và lưu vào Supabase qua task-manager MCP.

## Instructions

Đọc nội dung user cung cấp sau lệnh `/task-create`, phân tích và gọi `create_task` với:

### Các trường bắt buộc
- `title`: tiêu đề ngắn gọn, rõ ràng
- `description`: mô tả chi tiết nếu user cung cấp thêm thông tin
- `priority`: suy luận từ ngữ cảnh — mặc định `normal`, dùng `high` nếu có từ "gấp/urgent/quan trọng/critical", `low` nếu có "khi rảnh/sau này/low"

### Auto-fill user (luôn điền)
- `user` = `tuanvm37` — đây là username mặc định của người dùng hiện tại, luôn truyền vào khi tạo task, không hỏi lại.

### Auto-infer tool (suy luận từ context)
Phân tích nội dung task + các file đang được đề cập trong conversation để suy ra `tool`:

| Dấu hiệu trong context | tool |
|---|---|
| `WorkflowBuilder`, `executeWorkflow`, `NodeConfigPanel`, `DataBrowser`, `interpolate`, `workflow` | `workflow-builder` |
| `AIAgent`, `agentService`, `toolRegistry`, `runAgent`, `groq` | `ai-agent` |
| `task-create`, `task-update`, `task-mcp`, `TaskManager`, `task-manager` | `task-mcp` |
| `TelegramSender`, `telegram`, `send_telegram` | `telegram` |
| `StorageManager`, `storage`, `upload`, `fileKey` | `storage` |
| `deploy.yml`, `github-pages`, `gitpage`, `.nojekyll`, `vite.config` | `deploy` |
| `supabase`, `workflowService`, `database` | `supabase` |
| `.env`, `env.example`, `secrets`, `API key` | `config` |
| Không xác định rõ | bỏ trống hoặc `general` |

Nếu task liên quan nhiều feature → chọn feature **chính** nhất.

### Sau khi tạo
Tự động `update_task` status → `in_progress` nếu user muốn bắt đầu ngay.

## Output format

Hiển thị thông tin task vừa tạo: ID, title, priority, status, user, tool, thời gian tạo.
