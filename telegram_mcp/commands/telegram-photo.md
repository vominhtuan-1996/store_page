# Telegram Photo

Gửi ảnh đến Telegram qua URL.

## Instructions

Đọc argument sau `/telegram-photo` và gọi tool `send_telegram_photo` với:
- `photo_url`: URL công khai của ảnh (bắt buộc)
- `caption`: chú thích ảnh (tuỳ chọn, hỗ trợ Markdown)
- `chat_id`: để trống để dùng TELEGRAM_CHAT_ID trong `.env`

Nếu user chỉ cung cấp URL → gửi không có caption.
Nếu user cung cấp URL + mô tả → dùng mô tả làm caption.

## Output format

Xác nhận ảnh đã gửi kèm message_id.

## Example

`/telegram-photo https://example.com/screenshot.png`
`/telegram-photo https://example.com/ui.png UI màn hình login đã hoàn thành`
