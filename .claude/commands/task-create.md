# Task Create

Tạo task mới và lưu vào Supabase qua task-manager MCP.

## Instructions

Đọc nội dung user cung cấp sau lệnh `/task-create`, phân tích và gọi `create_task` với:
- `title`: tiêu đề ngắn gọn, rõ ràng
- `description`: mô tả chi tiết nếu user cung cấp thêm thông tin
- `priority`: suy luận từ ngữ cảnh — mặc định `normal`, dùng `high` nếu có từ "gấp/urgent/quan trọng/critical", `low` nếu có "khi rảnh/sau này/low"

Sau khi tạo xong, tự động `update_task` status → `in_progress` nếu user muốn bắt đầu ngay.

## Output format

Hiển thị thông tin task vừa tạo: ID, title, priority, status, thời gian tạo.
