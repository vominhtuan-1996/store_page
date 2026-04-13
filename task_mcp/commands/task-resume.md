# Task Resume

Load lại context của một task để tiếp tục công việc từ phiên làm việc trước.

## Instructions

Đọc ID hoặc tên task từ arguments:
- Nếu có ID → gọi `resume_task` trực tiếp
- Nếu có tên → gọi `list_tasks` để tìm task, sau đó gọi `resume_task`

Sau khi `resume_task` trả về context:
1. Đọc kỹ phần **Context** (những gì đã làm)
2. Đọc phần **Next Steps** (việc cần làm tiếp)
3. Tự động tiếp tục công việc — **không hỏi lại** những gì đã có trong context
4. Nếu context trống → hỏi user muốn làm gì với task này

Khi hoàn thành hoặc dừng lại, luôn `update_task` để lưu context mới nhất.

## Output format

Hiển thị tóm tắt context đã load, sau đó bắt đầu làm việc ngay.

## Example

`/task-resume c4c23c03-bafb-4f96-a626-ec4e13fa5832`
`/task-resume fix bug API login`
