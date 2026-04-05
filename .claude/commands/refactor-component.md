# Refactor Component

Refactor một component theo best practices của dự án.

## Input
- `$ARGUMENTS` - Đường dẫn file component cần refactor

## Instructions

1. Đọc file component từ `$ARGUMENTS`.

2. Phân tích và thực hiện các refactor sau (nếu cần):

### Tách logic
- Nếu component > 150 dòng → tách thành sub-components
- Nếu có business logic phức tạp → extract thành custom hook
- Nếu có data fetching inline → chuyển sang TanStack Query hook
- Nếu có state management phức tạp → cân nhắc Zustand store

### Clean up
- Loại bỏ `console.log`
- Thay `any` bằng proper types
- Sắp xếp lại thứ tự code theo convention
- Loại bỏ unused imports/variables
- Thay inline styles bằng Tailwind classes

### Optimize
- Wrap expensive computations bằng `useMemo`
- Wrap callbacks truyền xuống child bằng `useCallback`
- Thêm `React.memo` cho pure components nhận nhiều props
- Chuyển static data ra ngoài component

### Improve
- Thêm TypeScript types thiếu
- Thêm error/loading states nếu thiếu
- Cải thiện accessibility
- Đảm bảo responsive

3. Quy tắc refactor:
   - KHÔNG thay đổi behavior/functionality
   - KHÔNG thêm feature mới
   - Giữ nguyên public API (props interface)
   - Tạo file mới cho extracted hooks/components
   - Cập nhật imports ở các file liên quan

4. Sau khi refactor:
   - Liệt kê changes đã thực hiện
   - Giải thích lý do cho mỗi change
   - Liệt kê file mới tạo (nếu có)
