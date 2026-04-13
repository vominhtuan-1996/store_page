# Check MR Compliance

Kiểm tra nội dung Merge Request, Commit Message và Code Review dựa theo tiêu chuẩn MR Compliance Guide v1.4.

## Instructions

Khi người dùng yêu cầu review MR hoặc kiểm tra mã nguồn trước khi tạo MR, hãy áp dụng các nguyên tắc sau:

### 1. Commit Message & Description (A. Structure & Description)
- Kiểm tra tiêu đề MR và commit có tuân thủ **Conventional Commits** (`feat`, `fix`, `refactor`, `docs`, v.v.).
- Nếu có **Breaking Change**: yêu cầu có dấu `!` và/hoặc `BREAKING CHANGE` footer.
- **Description** MR phải đầy đủ các phần: Thay đổi gì, Ticket, Steps to test, Checklist, AI Disclosure (kể cả khi không dùng AI).
- Size MR quá 400 LOC cần phải phân chia nhỏ hoặc có lý do.
- Đảm bảo commit chứa **prefix `[AI]`** nếu mã được sinh bởi AI.

### 2. Code & Security (B. Code & Security)
- **BLOCKER:** Phải loại bỏ hoàn toàn các debug statements (`console.log()`, `print()`, `debugger`) và `TODO` không gắn ticket.
- **BLOCKER:** Tuyệt đối không chứa hardcoded secrets, API key, password, connection string.
- **BLOCKER:** Phải có input validation đầy đủ; tránh lọt lỗi hổng SQL Injection (sử dụng ORM/parameterized query).
- **BLOCKER:** Dữ liệu nhạy cảm (email, password, token, card number) không được ghi vào logs.
- Đánh giá mã do AI tạo nếu có: xác minh logic đúng luồng, không hallucinate APIs.

### 3. Testing & CI/CD (C. Testing & CI/CD)
- Yêu cầu pipeline CI/CD trạng thái PASS.
- Đảm bảo code business logic mới có unit tests đi kèm. Cảnh báo nếu Coverage sụt giảm >5%.
- Với bug fix MR: cần có regression tests để đảm bảo bug không tái xuất hiện.

### 4. Format Feedback của Reviewer (D. Comment Convention)
Gắn mác mức độ quan trọng cho mỗi lời bình duyệt:
- `Blocker:` (P0) Bắt buộc fix để merge.
- `Required:` (P1) Cần fix.
- `Nit:` (P2) Lỗi nhỏ hoặc vặt, không block merge.
- `Suggestion:` (P2) Gợi ý cách làm tốt hơn.
- `Q:` Câu hỏi làm rõ vấn đề.
- `FYI:` / `Praise:` Cung cấp thông tin / Khen ngợi code viết tốt.

## Output format
- Trả về danh sách Check MR Compliance Checklist dưới dạng bảng hoặc danh sách tổng hợp.
- Chia theo các danh mục: **Structure & Description**, **Code & Security**, **Testing/CI**.
- Đánh dấu trạng thái: ✅ (Tốt), 🟡 (Cần chú ý - Required), 🔴 (Vi phạm nghiêm trọng - Blocker).
- Đưa ra lời khuyên sửa đổi cho mỗi vi phạm.
