# Create Zustand Store

Tạo một Zustand store mới.

## Input
- `$ARGUMENTS` - Tên store/domain (VD: `auth`, `cart`, `ui`, `theme`)

## Instructions

1. Parse `$ARGUMENTS` lấy tên store (camelCase).

2. Tạo file: `src/stores/[name]Store.ts`

3. Template store:

```ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface [Name]State {
  // TODO: Define state
}

interface [Name]Actions {
  // TODO: Define actions
  reset: () => void;
}

type [Name]Store = [Name]State & [Name]Actions;

const initialState: [Name]State = {
  // TODO: Initial values
};

export const use[Name]Store = create<[Name]Store>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // TODO: Implement actions

      reset: () => set(initialState),
    }),
    { name: '[name]-store' }
  )
);
```

4. Quy tắc:
   - Tách State interface và Actions interface riêng
   - Luôn có `reset` action
   - Dùng `devtools` middleware (bỏ trong production)
   - Chỉ dùng `persist` middleware khi cần lưu localStorage (auth, theme, cart)
   - KHÔNG lưu server data vào store - dùng TanStack Query
   - Export selectors nếu cần derived state

5. Nếu cần persist, wrap thêm middleware:

```ts
export const use[Name]Store = create<[Name]Store>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        reset: () => set(initialState),
      }),
      { name: '[name]-storage' }
    ),
    { name: '[name]-store' }
  )
);
```

6. Sau khi tạo, thông báo đường dẫn file.
