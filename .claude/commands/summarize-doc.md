# Summarize Document

Đọc file .docx và tóm tắt nội dung chính.

## Input
- `$ARGUMENTS` - Đường dẫn tuyệt đối tới file .docx (VD: `/Users/tuanvm37/docs/report.docx`)

## Instructions

1. Gọi MCP tool `mcp__doc-reader__read_doc` với `file_path` = `$ARGUMENTS`
2. Phân tích nội dung trả về và tạo bản tóm tắt:
   - Chủ đề chính của tài liệu
   - Các điểm quan trọng (bullet points)
   - Kết luận/đề xuất (nếu có)
3. Giữ bản tóm tắt ngắn gọn, dưới 300 từ
