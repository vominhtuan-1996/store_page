# Read Document

Đọc toàn bộ nội dung file .docx và trả về dạng plain text.

## Input
- `$ARGUMENTS` - Đường dẫn tuyệt đối tới file .docx (VD: `/Users/tuanvm37/docs/guide.docx`)

## Instructions

1. Gọi MCP tool `mcp__doc-reader__read_doc` với `file_path` = `$ARGUMENTS`
2. Hiển thị nội dung trả về cho user
3. Thông báo tổng số ký tự đã đọc được
