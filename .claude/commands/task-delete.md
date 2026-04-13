# Task Delete

Xóa vĩnh viễn một task khỏi Supabase.

## Instructions

Đọc ID hoặc tên task sau `/task-delete`:
- Nếu có ID → xác nhận với user trước khi gọi `delete_task`
- Nếu có tên → gọi `list_tasks` để tìm và hiển thị task, hỏi xác nhận trước khi xóa

> Lưu ý: nên dùng `/task-update` với `status: cancelled` thay vì xóa để giữ lịch sử.
> Chỉ xóa khi user xác nhận rõ ràng muốn xóa vĩnh viễn.

## Output format

Xác nhận đã xóa task kèm title và ID.
