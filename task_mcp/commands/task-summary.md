# Task Summary

Thống kê tổng quan toàn bộ tasks theo trạng thái và độ ưu tiên.

## Instructions

Gọi `task_summary` để lấy số liệu tổng hợp, sau đó gọi thêm `list_tasks` với `status: in_progress` để liệt kê các task đang làm dở.

## Output format

Hiển thị:
1. Bảng thống kê: số lượng theo từng status + priority
2. Danh sách tasks đang `in_progress` (nếu có)
3. Cảnh báo nếu có task `high` priority đang `pending` quá lâu (tạo > 3 ngày mà chưa in_progress)
