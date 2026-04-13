# Telegram Notify

Gửi tin nhắn thông báo đến Telegram.

## Instructions

Đọc nội dung sau `/telegram-notify` và gọi tool `send_telegram_notification` với:
- `message`: nội dung tin nhắn (hỗ trợ Markdown)
- `parse_mode`: mặc định `Markdown`, đổi sang `HTML` nếu user chỉ định
- `chat_id`: để trống để dùng TELEGRAM_CHAT_ID trong `.env`

**Tự động format message theo ngữ cảnh:**
- Task done → `✅ *Task hoàn thành:* <title>`
- Lỗi/bug → `🔴 *Lỗi:* <mô tả>`
- Cảnh báo → `⚠️ *Cảnh báo:* <nội dung>`
- Thông báo thường → giữ nguyên nội dung user nhập

**Markdown hỗ trợ:**
- `*bold*` — in đậm
- `_italic_` — in nghiêng
- `` `code` `` — inline code
- ` ```block``` ` — code block

## Output format

Xác nhận tin nhắn đã gửi kèm message_id trả về từ Telegram.

## Example

`/telegram-notify Deploy production thành công lúc 14:30`
`/telegram-notify *Lỗi API:* timeout khi gọi /pms/orders`
`/telegram-notify build xong task login, cần review`
