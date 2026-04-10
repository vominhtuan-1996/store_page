# Figma MCP Server

Đây là một Model Context Protocol (MCP) server cho phép các AI agent tương tác trực tiếp với API của Figma để đọc file, lấy dữ liệu node, xuất hình ảnh, quản lý comment và điều hướng project/team.

## 1. Cấu hình

Để sử dụng server này, bạn cần có **Figma Personal Access Token**.

### Cách 1: Sử dụng file `.env` (Khuyến nghị)
Copy file mẫu `.env.example` thành `.env` và điền token của bạn:
```bash
cp .env.example .env
```
Nội dung file `.env`:
```env
FIGMA_ACCESS_TOKEN=your_token_here
```
*Lưu ý: File `.env` chứa token cá nhân và đã được cấu hình trong `.gitignore` để không bị push lên Git.*

### Cách 2: Cấu hình qua MCP Setting
Nếu bạn sử dụng phần mềm hỗ trợ MCP (như Claude Desktop), bạn có thể thêm vào cấu hình (với đường dẫn tuyệt đối chính xác):
```json
"figma-api": {
  "command": "node",
  "args": ["/Users/tuanios_su12/store_page/figma_mcp_api/server.js"],
  "env": {
    "FIGMA_ACCESS_TOKEN": "your_token_here"
  }
}
```

## 2. Cách chạy

Cài đặt dependencies:
```bash
npm install
```

Khởi chạy server (chế độ stdio):
```bash
node server.js
```

## 3. Danh sách các công cụ (Tools)

### Quản lý File & Nội dung
- `get_file`: Lấy toàn bộ cấu trúc JSON của một file Figma.
- `get_nodes`: Lấy dữ liệu của các node cụ thể (các layer, frame...) trong file.
- `get_images`: Xuất hình ảnh từ các node (hỗ trợ PNG, JPG, SVG, PDF).
- `get_file_versions`: Xem lịch sử các phiên bản của file.

### Thư viện & Phong cách
- `get_file_components`: Liệt kê các component được định nghĩa trong file.
- `get_file_styles`: Liệt kê các style (màu sắc, chữ...) trong file.

### Trao đổi & Phản hồi
- `get_comments`: Lấy danh sách các bình luận trong file.
- `post_comment`: Gửi bình luận mới vào một file Figma tại vị trí cụ thể.

### Điều hướng Team & Project
- `get_me`: Kiểm tra thông tin tài khoản đang kết nối.
- `get_team_projects`: Liệt kê các project trong một Team.
- `get_project_files`: Liệt kê các file trong một Project.

## 4. Kiểm tra & Script phân tích
Các script này sử dụng cấu hình từ file `.env` đã thiết lập ở bước 1.

### Kiểm tra kết nối
- `node test_me.js`: Kiểm tra thông tin tài khoản Figma.
- `node test_list_projects.js`: Liệt kê các project trong team mẫu.

### Lấy dữ liệu mẫu
- `node test_fetch_file.js`: Lấy thông tin cấu trúc cơ bản của file.
- `node test_fetch_nodes.js`: Lấy chi tiết các node cụ thể.
- `node test_export_images.js`: Xuất URL hình ảnh từ các node.
- `node test_fetch_assets.js`: Liệt kê component và style.

### Phân tích sâu (Analysis)
- `node analyze_notification.js`: Phân tích cấu trúc node của màn hình Notification.
- `node analyze_scan_qrcode.js`: Phân tích cấu trúc node của màn hình Scan QR Code.

## 5. Ví dụ sử dụng cho AI

Khi yêu cầu AI, bạn có thể nói:
"Hãy liệt kê tất cả các project trong team ID 123456789."
-> AI sẽ gọi tool `get_team_projects({ team_id: "123456789" })`.

"Lấy style màu sắc từ file key `abcdef123456`."
-> AI sẽ gọi tool `get_file_styles({ file_key: "abcdef123456" })`.

"Gửi bình luận 'Kiểm tra lại màu sắc ở layer này' vào file `key123` tại node `0:1`."
-> AI sẽ gọi tool `post_comment({ file_key: "key123", message: "...", client_meta: { node_id: "0:1" } })`.
