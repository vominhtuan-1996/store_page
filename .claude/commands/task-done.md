# Task Done

Đánh dấu task hoàn thành và ghi lại kết quả.

## Instructions

Đọc nội dung sau `/task-done`:
- Nếu có ID → gọi `update_task` trực tiếp với `status: done`
- Nếu có tên task → gọi `list_tasks` để tìm ID, sau đó `update_task`
- Nếu user cung cấp kết quả/ghi chú → đưa vào `notes`
- Nếu không có ghi chú → tự động điền notes: "Hoàn thành lúc [thời gian hiện tại]"

## Output format

Xác nhận task đã done kèm ID và notes đã lưu.
