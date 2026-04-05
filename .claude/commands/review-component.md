# Review React Component

Review một component và đưa ra feedback theo convention của dự án.

## Input
- `$ARGUMENTS` - Đường dẫn file component cần review (VD: `src/components/ui/Button.tsx`)

## Instructions

1. Đọc file component từ `$ARGUMENTS`.

2. Kiểm tra theo các tiêu chí sau:

### Structure & Convention
- [ ] Dùng functional component (không class component)
- [ ] Named export (không default export, trừ page component)
- [ ] Props interface được define rõ ràng
- [ ] Tên component PascalCase, khớp với tên file
- [ ] Thứ tự code đúng convention (props → stores → state → memo → effects → handlers → render)

### TypeScript
- [ ] Không dùng `any`
- [ ] Props có type đầy đủ
- [ ] Event handlers có type chính xác
- [ ] Không dùng `@ts-ignore`

### Performance
- [ ] Không tạo object/array/function mới trong render mà không memo
- [ ] Key prop trong list rendering ổn định (không dùng index)
- [ ] useCallback/useMemo dùng đúng chỗ (không thừa, không thiếu)
- [ ] Không có unnecessary re-renders

### Hooks
- [ ] useEffect có dependency array đúng
- [ ] Không lạm dụng useEffect cho derived state
- [ ] Custom hooks tách riêng khi logic phức tạp
- [ ] Cleanup function trong useEffect khi cần

### Styling
- [ ] Dùng Tailwind CSS hoặc CSS Modules
- [ ] Không inline styles (trừ dynamic values)
- [ ] Responsive design
- [ ] Không `!important`

### Accessibility
- [ ] Semantic HTML tags
- [ ] Alt text cho images
- [ ] ARIA labels khi cần
- [ ] Keyboard navigation support

### Error Handling
- [ ] Xử lý loading/error states
- [ ] Null/undefined checks
- [ ] Error boundaries cho critical sections

3. Output format:
   - Liệt kê các vấn đề tìm được, kèm severity (🔴 Critical, 🟡 Warning, 🔵 Info)
   - Gợi ý fix cho mỗi vấn đề
   - Tổng kết điểm mạnh của component
   - Score tổng: A/B/C/D/F

4. Nếu tìm thấy vấn đề Critical, hỏi user có muốn auto-fix không.
