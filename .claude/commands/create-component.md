# Create React Component

Tạo một React component mới theo đúng convention của dự án.

## Input
- `$ARGUMENTS` - Tên component và đường dẫn (VD: `UserCard features/user` hoặc `Button ui`)

## Instructions

1. Parse `$ARGUMENTS`:
   - Phần đầu tiên là tên component (PascalCase)
   - Phần sau là đường dẫn đích trong `src/components/` hoặc `src/features/`

2. Tạo file component với cấu trúc sau:
   - File component: `[ComponentName].tsx`
   - File barrel export: `index.ts` (nếu chưa có thì tạo, nếu có thì thêm export)

3. Template component:

```tsx
interface [ComponentName]Props {
  // TODO: Define props
}

export const [ComponentName] = ({}: [ComponentName]Props) => {
  return (
    <div>
      {/* TODO: Implement */}
    </div>
  );
};
```

4. Quy tắc:
   - Dùng named export (KHÔNG default export)
   - Props interface đặt ngay trên component
   - Dùng functional component + arrow function
   - Dùng Tailwind CSS cho styling
   - Nếu đường dẫn chứa `features/`, tạo trong `src/features/[feature]/components/`
   - Nếu đường dẫn chứa `ui`, tạo trong `src/components/ui/`
   - Nếu đường dẫn chứa `common`, tạo trong `src/components/common/`

5. Sau khi tạo xong, thông báo đường dẫn file đã tạo.
