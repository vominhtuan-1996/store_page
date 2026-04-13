# telegram-mcp

MCP Server gửi tin nhắn & ảnh đến Telegram qua bot.

---

## Yêu cầu

- **Node.js >= 18** — tải tại [nodejs.org](https://nodejs.org)
- **Telegram Bot Token** — tạo qua [@BotFather](https://t.me/botfather) trên Telegram
- **Chat ID** — ID của group/channel/cá nhân nhận thông báo
- **Claude Desktop** hoặc **Claude Code (CLI)**

---

## Cài đặt (dành cho thành viên team)

### Bước 1 — Giải nén

Giải nén `telegram-mcp-vX.X.X.zip` vào thư mục tùy chọn, ví dụ:

```
~/tools/telegram_mcp/
```

### Bước 2 — Chạy script cài đặt

**Mac / Linux:**
```bash
bash ~/tools/telegram_mcp/install.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\tools\telegram_mcp\install.ps1"
```

Script sẽ tự động:
- Kiểm tra Node.js
- Cài dependencies (`npm install`)
- Hỏi Bot Token + Chat ID → ghi vào `.env`
- In ra config snippet
- Hỏi có muốn tự động thêm vào Claude Desktop không
- Hỏi đường dẫn project để copy 2 slash commands

### Bước 3 — Cấu hình .env thủ công (nếu cần)

Tạo file `.env` trong thư mục **cha** của `telegram_mcp/`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC-your-token
TELEGRAM_CHAT_ID=-1001234567890
```

### Bước 4 — Thêm config (nếu chưa tự động)

**Claude Code** — thêm vào `.mcp.json`:

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["/đường/dẫn/tới/telegram_mcp/server.js"]
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
| `/telegram-notify <nội dung>` | Gửi tin nhắn văn bản đến Telegram |
| `/telegram-photo <url> [caption]` | Gửi ảnh từ URL đến Telegram |

---

## Lưu ý

- `TELEGRAM_BOT_TOKEN` là key **secret** — không commit vào git
- File `.env` phải nằm trong thư mục **cha** của `telegram_mcp/` (do server đọc `../.env`)
- Bot phải được add vào group/channel và có quyền gửi tin
- Dùng [@userinfobot](https://t.me/userinfobot) để lấy Chat ID cá nhân
