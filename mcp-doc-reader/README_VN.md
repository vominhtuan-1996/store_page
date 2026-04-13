# mcp-doc-reader

MCP Server giúp Claude đọc và tìm kiếm nội dung trong file `.docx` trực tiếp trên máy của bạn.

---

## Yêu cầu

- **Node.js >= 18** — tải tại [nodejs.org](https://nodejs.org)
- **Claude Desktop** hoặc **Claude Code (CLI)**

---

## Cài đặt (dành cho thành viên team)

### Bước 1 — Giải nén

Giải nén file `mcp-doc-reader-vX.X.X.zip` vào thư mục tùy chọn, ví dụ:

```
~/tools/mcp-doc-reader/
```

### Bước 2 — Chạy script cài đặt

**Mac / Linux:**
```bash
bash ~/tools/mcp-doc-reader/install.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\tools\mcp-doc-reader\install.ps1"
```

Script sẽ tự động:
- Kiểm tra Node.js
- Cài dependencies (`npm install`)
- In ra đoạn config cần thêm
- Hỏi có muốn tự động thêm vào **Claude Desktop** không

### Bước 3 — Cài slash commands (Claude Code)

Script sẽ hỏi đường dẫn project, sau đó tự copy 2 file vào `.claude/commands/`:

```
<project>/.claude/commands/read-doc.md
<project>/.claude/commands/ask-doc.md
```

Hoặc copy thủ công từ thư mục `commands/` trong package.

### Bước 4 — Thêm config (nếu chưa tự động)

**Claude Code** — thêm vào `.mcp.json` trong project:

```json
{
  "mcpServers": {
    "doc-reader": {
      "command": "node",
      "args": ["/đường/dẫn/tới/mcp-doc-reader/server.js"]
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

## Sử dụng

### Slash commands (Claude Code)

```
/read-doc /Users/username/docs/guide.docx
/ask-doc /Users/username/docs/guide.docx | quy trình bảo hành
```

### Tool trực tiếp — `read_doc` — Đọc toàn bộ file

```
Đọc file /Users/username/Documents/hop_dong.docx và tóm tắt nội dung chính
```

### Tool `ask_doc` — Tìm kiếm trong file

```
Trong file /Users/username/Docs/huong_dan.docx, quy trình bảo hành được mô tả như thế nào?
```

| Khi nào dùng `read_doc` | Khi nào dùng `ask_doc` |
|---|---|
| File nhỏ, cần toàn bộ nội dung | File lớn, chỉ cần 1 phần |
| Tóm tắt toàn bộ tài liệu | Tìm kiếm thông tin cụ thể |

---

## Lưu ý

- Chỉ hỗ trợ định dạng `.docx`
- Phải dùng **đường dẫn tuyệt đối** đến file
- File `.docx` nằm trên máy của bạn, không upload lên đâu cả — hoàn toàn offline
