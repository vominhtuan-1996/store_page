# MCP Doc Reader - Hướng dẫn sử dụng

`mcp-doc-reader` là một MCP server cho phép Claude đọc và tìm kiếm nội dung trong file `.docx` (Microsoft Word) trực tiếp qua hội thoại.

---

## Cài đặt & Khởi động

Server được cấu hình sẵn trong `.mcp.json`:

```json
"doc-reader": {
  "command": "node",
  "args": ["/Users/tuanvm37/store_page/mcp-doc-reader/server.js"]
}
```

Server tự động khởi động khi Claude Code chạy. Không cần thao tác thêm.

---

## Các công cụ (Tools)

### 1. `read_doc` — Đọc toàn bộ nội dung file

Đọc và trả về toàn bộ nội dung text từ một file `.docx`.

**Tham số:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `file_path` | string | Có | Đường dẫn tuyệt đối đến file `.docx` |

**Ví dụ sử dụng:**

> Yêu cầu Claude:
> ```
> Đọc file /Users/tuanvm37/Documents/bao-cao.docx
> ```

Claude sẽ gọi `read_doc` với `file_path = "/Users/tuanvm37/Documents/bao-cao.docx"` và trả về toàn bộ nội dung.

**Khi nào dùng:**
- Muốn xem toàn bộ nội dung tài liệu
- File ngắn (< 10 trang)
- Cần Claude tóm tắt toàn bộ nội dung

---

### 2. `ask_doc` — Hỏi đáp về nội dung file

Tìm kiếm trong file `.docx` và trả về các đoạn văn bản liên quan nhất đến câu hỏi.

**Cách hoạt động:**
1. Đọc toàn bộ file
2. Chia nhỏ thành các đoạn (~500 ký tự mỗi đoạn)
3. Tính điểm liên quan của từng đoạn với câu hỏi (keyword matching)
4. Trả về **3 đoạn** có điểm cao nhất

**Tham số:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `file_path` | string | Có | Đường dẫn tuyệt đối đến file `.docx` |
| `question` | string | Có | Câu hỏi hoặc từ khóa cần tìm |

**Ví dụ sử dụng:**

> Yêu cầu Claude:
> ```
> Trong file /Users/tuanvm37/Documents/hop-dong.docx, điều khoản thanh toán là gì?
> ```

Claude sẽ gọi `ask_doc` với:
- `file_path = "/Users/tuanvm37/Documents/hop-dong.docx"`
- `question = "điều khoản thanh toán"`

**Khi nào dùng:**
- File dài, không cần đọc toàn bộ
- Cần tìm thông tin cụ thể trong tài liệu
- Tìm kiếm theo từ khóa, chủ đề

---

## Ví dụ thực tế

### Tóm tắt tài liệu
```
Tóm tắt nội dung file /Users/tuanvm37/Desktop/ke-hoach-2024.docx
```

### Tìm thông tin cụ thể
```
Trong file /Users/tuanvm37/Desktop/quy-trinh.docx, quy trình phê duyệt gồm những bước nào?
```

### So sánh hai tài liệu
```
So sánh nội dung của:
- /Users/tuanvm37/docs/v1.docx
- /Users/tuanvm37/docs/v2.docx
```

### Trích xuất dữ liệu
```
Lấy tất cả các số liệu (số tiền, ngày tháng) trong file /Users/tuanvm37/Desktop/bao-cao-tai-chinh.docx
```

---

## Lưu ý

- Chỉ hỗ trợ file `.docx` (Microsoft Word 2007+). File `.doc` cũ không được hỗ trợ.
- `file_path` phải là **đường dẫn tuyệt đối** (bắt đầu bằng `/`).
- `ask_doc` dùng keyword matching đơn giản — nên dùng từ khóa rõ ràng, không cần viết thành câu hỏi đầy đủ.
- File rất lớn (>100 trang) có thể chậm khi dùng `read_doc`, nên ưu tiên dùng `ask_doc`.

---

## Cấu trúc server

```
mcp-doc-reader/
├── server.js          # MCP server entry point (2 tools: read_doc, ask_doc)
├── docReader.js       # Parse .docx → plain text (dùng mammoth)
├── utils/
│   ├── chunk.js       # Chia text thành đoạn 500 ký tự
│   └── search.js      # Tìm kiếm keyword, trả về top 3 đoạn liên quan
└── GUIDE.md           # File này
```
