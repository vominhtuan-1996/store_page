# PMS MCP API Server

MCP Server cho phép Claude Code gọi trực tiếp các API của hệ thống PMS (Publication Management System) thông qua Postman collection.

---

## Yêu cầu

- **Node.js:** >= 18
- **IDE:** VS Code với extension Claude Code (hoặc Claude Code CLI)

---

## Cài đặt

### Bước 1: Install dependencies

```bash
cd pms_mcp_api
npm install
```

### Bước 2: Cấu hình `.mcp.json`

Tạo file `.mcp.json` ở **thư mục gốc** của project (cùng cấp với `package.json`, `src/`):

```json
{
  "mcpServers": {
    "pms-api": {
      "command": "node",
      "args": ["<đường-dẫn-tuyệt-đối>/pms_mcp_api/server.js"],
      "env": {
        "PMS_BASE_URL": "https://apis-stag.fpt.vn",
        "PMS_AUTH_TOKEN": ""
      }
    }
  }
}
```

> **Lưu ý:** Thay `<đường-dẫn-tuyệt-đối>` bằng đường dẫn thực tế trên máy bạn.
> Ví dụ: `/Users/username/store_page/pms_mcp_api/server.js`

### Bước 3: Reload VS Code

Nhấn `Cmd + Shift + P` (Mac) hoặc `Ctrl + Shift + P` (Windows/Linux) → chọn **Developer: Reload Window** để MCP server được khởi động.

---

## Cách sử dụng

### Login

Gọi lệnh login trong Claude Code chat:

```
call api loginInternal với userName = huynq125@fpt.com, password = ISCSP_SU12_123
```

Sau khi login thành công, **token sẽ tự động được cập nhật** vào `PMS_AUTH_TOKEN` trong `.mcp.json`. Không cần copy/paste token thủ công.

### Gọi API khác

Sau khi đã login, bạn có thể gọi bất kỳ API nào trong Postman collection. Ví dụ:

```
lấy danh sách phiếu
lấy danh sách ấn phẩm
tạo phiếu mới với ...
```

### Liệt kê tất cả API

```
list all PMS APIs
```

---

## Cấu trúc thư mục

```
pms_mcp_api/
├── server.js            # MCP Server chính - đăng ký tools, xử lý API calls
├── postmanParser.js     # Parse Postman collection thành API definitions
├── PMS.postman.json     # Postman collection chứa tất cả API endpoints
├── package.json         # Dependencies: @modelcontextprotocol/sdk, node-fetch
└── README.md            # File này
```

---

## Kiến trúc hoạt động

```
Claude Code  ──MCP Protocol──>  server.js  ──HTTP──>  PMS API (apis-stag.fpt.vn)
                                    │
                                    ├── Đọc PMS.postman.json → tự động tạo tools
                                    ├── Gắn Bearer token vào mỗi request
                                    └── Login thành công → tự ghi token vào .mcp.json
```

1. `postmanParser.js` đọc file `PMS.postman.json` và parse thành danh sách API definitions.
2. `server.js` đăng ký mỗi API thành một MCP tool với tên, params, body schema tương ứng.
3. Khi Claude Code gọi tool, `server.js` gửi HTTP request tới PMS API với token xác thực.
4. Với các API login (`login_*`), nếu response thành công (`code === 0`), token mới sẽ được tự động ghi vào `.mcp.json`.

---

## Thêm API mới

1. Export collection mới từ Postman (Collection v2.1 format).
2. Thay thế file `PMS.postman.json`.
3. Reload VS Code để MCP server đọc lại collection.

---

## Troubleshooting

| Vấn đề | Giải pháp |
|---|---|
| MCP server không khởi động | Kiểm tra đường dẫn `args` trong `.mcp.json` có đúng không |
| Lỗi `401 Unauthorized` | Token hết hạn → gọi lại lệnh login |
| Không thấy tools trong Claude Code | Reload VS Code window (`Cmd + Shift + P` → Reload Window) |
| Lỗi `npm install` | Đảm bảo Node.js >= 18, chạy `npm install` trong thư mục `pms_mcp_api/` |
