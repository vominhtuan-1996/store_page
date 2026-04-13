# Task List

Xem danh sách tasks từ Supabase, có thể filter theo status hoặc priority.

## Instructions

Gọi `list_tasks` với tham số được suy luận từ lệnh user:

| User nói | Tham số |
|----------|---------|
| (không có gì) | không filter — hiển thị tất cả trừ cancelled |
| "pending" / "chờ" | `status: pending` |
| "đang làm" / "in progress" | `status: in_progress` |
| "xong" / "done" | `status: done` |
| "tất cả" / "all" | `status: all` |
| "high" / "gấp" | `priority: high` |

## Output format

Hiển thị tasks nhóm theo status, mỗi task gồm: icon priority, title, ID rút gọn (8 ký tự đầu), thời gian tạo.
