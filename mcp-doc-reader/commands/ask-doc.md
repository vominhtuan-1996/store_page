# Ask Document

Tìm kiếm nội dung trong file .docx bằng câu hỏi hoặc từ khóa.

## Input
- `$ARGUMENTS` - Đường dẫn file và câu hỏi, cách nhau bởi `|` (VD: `/Users/tuanvm37/docs/guide.docx | cách cài đặt`)

## Instructions

1. Parse `$ARGUMENTS`:
   - Phần trước `|` là `file_path` (trim khoảng trắng)
   - Phần sau `|` là `question` (trim khoảng trắng)
   - Nếu không có `|`, hỏi user câu hỏi cần tìm

2. Gọi MCP tool `mcp__doc-reader__ask_doc` với:
   - `file_path` = đường dẫn file
   - `question` = câu hỏi/từ khóa

3. Hiển thị các đoạn nội dung liên quan nhất được tìm thấy
