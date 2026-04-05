# Create Page

Tạo một page component mới kèm route config.

## Input
- `$ARGUMENTS` - Tên page (VD: `Home`, `ProductDetail`, `Login`)

## Instructions

1. Parse `$ARGUMENTS` lấy tên page (PascalCase).

2. Tạo file page trong `src/pages/`:
   - File: `src/pages/[PageName]Page.tsx`

3. Template page:

```tsx
const [PageName]Page = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">[PageName]</h1>
      {/* TODO: Implement page content */}
    </div>
  );
};

export default [PageName]Page;
```

4. Cập nhật route config:
   - Mở file `src/routes/index.tsx` (hoặc file route chính)
   - Thêm lazy import: `const [PageName]Page = lazy(() => import('@/pages/[PageName]Page'));`
   - Thêm route entry vào router config
   - Wrap bằng `Suspense` nếu chưa có

5. Quy tắc:
   - Page component dùng default export (để hỗ trợ lazy loading)
   - Tên file luôn có suffix `Page` (VD: `HomePage.tsx`)
   - Mỗi page nên được wrap trong layout phù hợp

6. Sau khi tạo, thông báo file đã tạo và route path.
