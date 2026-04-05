# Create Custom Hook

Tạo một custom hook mới theo convention.

## Input
- `$ARGUMENTS` - Tên hook và scope (VD: `useAuth`, `useCart features/cart`, `useDebounce`)

## Instructions

1. Parse `$ARGUMENTS`:
   - Tên hook phải bắt đầu bằng `use` (tự động thêm nếu thiếu)
   - Nếu có scope `features/[name]`, tạo trong `src/features/[name]/hooks/`
   - Nếu không có scope, tạo trong `src/hooks/`

2. Tạo file hook: `[hookName].ts`

3. Template hook:

```ts
import { useState, useEffect, useCallback } from 'react';

/**
 * [Mô tả ngắn gọn hook]
 */
export const [hookName] = () => {
  // TODO: Implement hook logic

  return {
    // TODO: Return values
  };
};
```

4. Quy tắc:
   - File extension `.ts` (không phải `.tsx` trừ khi hook return JSX)
   - Named export
   - Return object (không return array, trừ khi hook đơn giản như useState)
   - Thêm JSDoc mô tả mục đích hook
   - Cập nhật barrel export `index.ts` nếu có

5. Sau khi tạo, thông báo đường dẫn file.
