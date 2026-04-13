# task-mcp

MCP Server quản lý tasks cho Claude, lưu trữ trên Supabase.

---

## Yêu cầu

- **Node.js >= 18** — tải tại [nodejs.org](https://nodejs.org)
- **Supabase account** — tạo tại [supabase.com](https://supabase.com) (free tier đủ dùng)
- **Claude Desktop** hoặc **Claude Code (CLI)**

---

## Cài đặt (dành cho thành viên team)

### Bước 1 — Tạo bảng Supabase

Vào **Supabase Dashboard → SQL Editor**, chạy toàn bộ nội dung file `schema.sql`.

### Bước 2 — Giải nén

Giải nén `task-mcp-vX.X.X.zip` vào thư mục tùy chọn, ví dụ:

```
~/tools/task_mcp/
```

### Bước 3 — Chạy script cài đặt

**Mac / Linux:**
```bash
bash ~/tools/task_mcp/install.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\tools\task_mcp\install.ps1"
```

Script sẽ tự động:
- Kiểm tra Node.js
- Cài dependencies (`npm install`)
- Hỏi Supabase URL + Service Role Key → ghi vào `.env`
- In ra config snippet
- Hỏi có muốn tự động thêm vào Claude Desktop không
- Hỏi đường dẫn project để copy 7 slash commands

### Bước 4 — Cấu hình .env thủ công (nếu cần)

Tạo file `.env` trong thư mục **cha** của `task_mcp/`:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Bước 5 — Thêm config (nếu chưa tự động)

**Claude Code** — thêm vào `.mcp.json`:

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "node",
      "args": ["/đường/dẫn/tới/task_mcp/server.js"]
    }
  }
}
```

**Claude Desktop** — thêm vào `claude_desktop_config.json`:

| Hệ điều hành | Đường dẫn file config |
|---|---|
| Mac | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

Sau đó **restart Claude Desktop**.

---

## Slash Commands

| Command | Mô tả |
|---|---|
| `/task-create <mô tả>` | Tạo task mới |
| `/task-list` | Xem danh sách tasks |
| `/task-done <id hoặc tên>` | Đánh dấu hoàn thành |
| `/task-update <id hoặc tên>` | Cập nhật task |
| `/task-resume <id hoặc tên>` | Load context, tiếp tục task |
| `/task-summary` | Thống kê tổng quan |
| `/task-delete <id hoặc tên>` | Xóa task |

---

## Lưu ý

- `SUPABASE_SERVICE_ROLE_KEY` là key **secret** — không commit vào git
- File `.env` phải nằm trong thư mục **cha** của `task_mcp/` (do server đọc `../. env`)
- Dữ liệu tasks được lưu hoàn toàn trên Supabase của bạn
