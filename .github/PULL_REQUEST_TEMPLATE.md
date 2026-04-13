<!-- 
📝 TIÊU ĐỀ MR:
Hãy sử dụng định dạng Conventional Commits: 
<type>(<scope>): <subject>
VD: feat(auth): add google login
VD: fix(api): prevent null pointer exception
Thêm dấu "!" hoặc "BREAKING CHANGE" vào commit/title nếu có thay đổi phá vỡ.
Thêm tiền tố [AI] nếu code có sự trợ giúp của AI.
-->

## 🎯 Thay đổi gì? (What changed?)
- Thêm chức năng ...
- Sửa lỗi ...
- Đổi cách hoạt động của ...

## 🎫 Ticket
- Báo cáo lỗi / Yêu cầu tính năng: `#123` (hoặc chèn link Jira/Trello/GitHub issue)

## 🧪 Các bước để Test (Steps to test)
1. Môi trường cần thiết: [QAS / Local / ...]
2. Chạy ứng dụng và mở trang `...`
3. Thực hiện thao tác: `...`
4. Kết quả mong đợi: `...`

## ⚠️ Giải thích bổ sung (Tùy chọn)
- Nếu thay đổi vượt quá **400 LOC**, hãy giải thích lý do tại đây.
- Nêu rõ các thay đổi **Breaking Changes** nếu có:
  - Component / API bị ảnh hưởng:
  - Migrate plan:

## 🤖 AI Disclosure
- [ ] Không sử dụng AI trực tiếp để viết logic code trong đoạn này.
- [ ] Đã sử dụng AI sinh ra mã nguồn. Tôi (Author) đã chủ động kiểm chứng kỹ luồng chạy, các hàm API được gọi và cam kết hoàn toàn hiểu nó.

---
## ✅ Checklist (Tác giả phải đánh dấu đầy đủ trước khi Review)

### Code & Security
- [ ] Code không chứa các câu lệnh debug (`console.log`, `debugger`, `print`). Không có `TODO` không gắn với ticket nào.
- [ ] Code tuyệt đối không hardcode mật khẩu, tokens, api_key.
- [ ] Inputs từ phía client đã được validate kỹ càng. Tránh sử dụng raw SQL không phân tích thông số (hạn chế SQL Injection).
- [ ] Không in ra nhật ký (logger) thông tin thẻ tín dụng, username, passwords.

### Testing & CI/CD
- [ ] CI/CD pipeline đã PASS màu xanh trên PR/MR này.
- [ ] Đã thêm Unit Tests hợp lệ cho business logic mới, đảm bảo độ bao phủ (coverage) không tụt giảm quá 5%.
- [ ] (Nếu sửa bug) Đã có regression test để bug này không bị tái phát dưới dạng khác.

---
### Dành cho Người Review (Reviewers)
Vui lòng sử dụng các prefix sau khi muốn comment:
- **Blocker (P0)**: Phải fix trước khi Merge (Lỗi bảo mật, logic hỏng cơ bản).
- **Required (P1)**: Bắt buộc sửa chữa, bổ sung nhưng có thể thảo luận.
- **Nit (P2)**: Lỗi thẩm mỹ, lặt vặt (Không Block).
- **Suggestion (P2)**: Gợi ý để code gọn nhẹ hoặc dễ dọc hơn.
- **Q**: Hỏi thông tin.
- **FYI / Praise**: Biết thêm thông tin hoặc Lời khen mảng code đẹp.
