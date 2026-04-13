# Task Update

Cập nhật thông tin hoặc trạng thái của một task.

## Instructions

Đọc nội dung user cung cấp sau `/task-update`, xác định:
- `id`: UUID của task (user cung cấp hoặc tìm qua `list_tasks` nếu user nói tên task)
- Các trường cần cập nhật: `status`, `title`, `description`, `priority`, `notes`

Nếu user chỉ nói tên task (không có ID), gọi `list_tasks` trước để tìm ID tương ứng.

Gợi ý status từ ngữ cảnh:
- "bắt đầu làm" → `in_progress`
- "xong rồi" / "hoàn thành" / "done" → `done`
- "bỏ" / "hủy" → `cancelled`
- "chưa làm được" / "block" → `pending` + ghi lý do vào `notes`

## Output format

Hiển thị thông tin task sau khi cập nhật, làm nổi bật trường vừa thay đổi.
