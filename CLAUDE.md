# Project Rules - React Web Application

## Task Management (Quan trọng)

Khi user giao bất kỳ task nào cần thực hiện:
1. **Bắt đầu task** → Gọi `create_task` với title + priority phù hợp, rồi `update_task` status `in_progress`
2. **Hoàn thành** → `update_task` status `done`, ghi kết quả vào `notes`
3. **Gặp vấn đề / bị block** → `update_task` status `pending`, ghi lý do vào `notes`
4. **Khi user hỏi tiến độ** → Gọi `list_tasks` hoặc `task_summary` trước khi trả lời

Không cần hỏi user trước khi tạo/cập nhật task — làm tự động.

### Lưu context (quan trọng)

Sau mỗi lần làm việc trên một task — dù hoàn thành hay dừng giữa chừng — **bắt buộc** gọi `update_task` với:

- `context`: tóm tắt những gì đã làm, file nào đã sửa/tạo, approach kỹ thuật, quyết định quan trọng. Viết đủ chi tiết để Claude session mới đọc vào hiểu ngay mà không cần hỏi lại.
- `next_steps`: liệt kê cụ thể các bước còn lại cần làm (nếu task chưa xong)

**Format context nên theo:**
```
Files đã sửa: src/components/Foo.tsx (thêm props X), src/hooks/useBar.ts (mới)
Approach: dùng Zustand cho state, React Query cho data fetching
Quyết định: không dùng useEffect vì..., chọn pattern X vì...
Vấn đề gặp: lỗi Y khi Z, đã fix bằng cách...
```

**Khi user nói "tiếp tục task X" hoặc dùng `/task-resume`:**
→ Gọi `resume_task` để load context, đọc kỹ rồi tiếp tục — không hỏi lại những gì đã có trong context.

---

## Overview
Dự án giao diện web sử dụng React. Mọi code và convention phải tuân theo các rule bên dưới.

---

## 1. Tech Stack
- **Framework:** React 18+ với TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS (hoặc CSS Modules nếu cần scoped style)
- **State management:** Zustand (global state), React Query / TanStack Query (server state)
- **Routing:** React Router v6+
- **HTTP client:** Axios
- **Form:** React Hook Form + Zod (validation)
- **Linting:** ESLint + Prettier
- **Package manager:** pnpm

---

## 2. Project Structure

```
src/
├── assets/            # Hình ảnh, fonts, static files
├── components/        # Shared/reusable components
│   ├── ui/            # Primitive UI components (Button, Input, Modal...)
│   └── common/        # Business-level shared components
├── features/          # Feature-based modules
│   └── [feature]/
│       ├── components/    # Components riêng của feature
│       ├── hooks/         # Custom hooks riêng của feature
│       ├── services/      # API calls riêng của feature
│       ├── types/         # Types riêng của feature
│       └── index.ts       # Public API (barrel export)
├── hooks/             # Global custom hooks
├── layouts/           # Layout components (MainLayout, AuthLayout...)
├── pages/             # Route-level page components
├── services/          # Global API services & axios config
├── stores/            # Zustand stores
├── types/             # Global TypeScript types/interfaces
├── utils/             # Utility/helper functions
├── constants/         # Constants & enums
├── routes/            # Route definitions
├── styles/            # Global styles
├── App.tsx
└── main.tsx
```

---

## 3. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Component files | PascalCase | `UserCard.tsx` |
| Hook files | camelCase, prefix `use` | `useAuth.ts` |
| Utility files | camelCase | `formatDate.ts` |
| Type files | camelCase | `user.types.ts` |
| Service files | camelCase | `authService.ts` |
| Store files | camelCase | `authStore.ts` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| CSS/Tailwind class | kebab-case (nếu dùng CSS Modules) | `user-card` |
| Folders | kebab-case | `user-profile/` |
| Interfaces/Types | PascalCase, prefix `I` cho interface nếu cần | `IUser`, `UserResponse` |

---

## 4. Component Rules

### 4.1 General
- Dùng **functional components** + hooks. KHÔNG dùng class components.
- Mỗi file chỉ chứa **1 component được export**.
- Component phải có **TypeScript props interface** rõ ràng.
- Tách logic ra custom hooks khi component quá phức tạp (>150 dòng).

### 4.2 Component Template
```tsx
interface UserCardProps {
  name: string;
  avatar?: string;
  onClick?: () => void;
}

export const UserCard = ({ name, avatar, onClick }: UserCardProps) => {
  return (
    <div className="user-card" onClick={onClick}>
      {avatar && <img src={avatar} alt={name} />}
      <span>{name}</span>
    </div>
  );
};
```

### 4.3 Component Organization (trong 1 file)
Thứ tự khai báo trong component:
1. Props destructuring
2. Stores / context
3. State (useState)
4. Derived values (useMemo)
5. Side effects (useEffect)
6. Event handlers
7. Render helpers (nếu cần)
8. Return JSX

---

## 5. Hooks Rules

- Custom hooks PHẢI bắt đầu bằng `use`.
- Tách business logic khỏi component vào custom hooks.
- Không lạm dụng `useEffect` - ưu tiên derived state và event handlers.
- Dùng `useCallback` và `useMemo` chỉ khi thực sự cần (heavy computation hoặc reference equality).

---

## 6. State Management Rules

- **Local state:** `useState` / `useReducer` cho state chỉ dùng trong 1 component.
- **Shared state (2-3 components gần nhau):** Lift state up hoặc context.
- **Global state:** Zustand store - tách theo domain (authStore, cartStore...).
- **Server state:** TanStack Query - KHÔNG lưu server data vào Zustand.
- KHÔNG dùng prop drilling quá 3 levels - dùng context hoặc store.

---

## 7. API & Services Rules

- Tất cả API calls đặt trong thư mục `services/`.
- Dùng Axios instance với interceptors cho auth token và error handling.
- Response types phải được define rõ ràng bằng TypeScript.
- Dùng TanStack Query cho data fetching trong components.

```tsx
// services/userService.ts
export const userService = {
  getAll: () => api.get<UserResponse[]>('/users'),
  getById: (id: string) => api.get<UserResponse>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post<UserResponse>('/users', data),
};
```

---

## 8. Styling Rules

- Ưu tiên **Tailwind CSS utility classes**.
- Component-specific styles phức tạp dùng CSS Modules.
- KHÔNG dùng inline styles (trừ dynamic values).
- KHÔNG dùng `!important`.
- Responsive design: mobile-first approach.
- Breakpoints theo Tailwind defaults: `sm`, `md`, `lg`, `xl`, `2xl`.

---

## 9. TypeScript Rules

- **Strict mode** bật trong tsconfig.
- KHÔNG dùng `any` - dùng `unknown` nếu không biết type, rồi narrow down.
- Export types/interfaces để reuse, đặt trong `types/`.
- Dùng `type` cho unions/intersections, `interface` cho object shapes.
- Enum chỉ dùng `const enum` hoặc `as const` object.

---

## 10. Performance Rules

- Lazy load pages với `React.lazy()` + `Suspense`.
- Ảnh dùng lazy loading (`loading="lazy"`).
- Avoid unnecessary re-renders: dùng `React.memo` cho pure components nặng.
- List rendering PHẢI có `key` prop unique và stable (KHÔNG dùng index).
- Bundle splitting theo route.

---

## 11. Error Handling

- Dùng **Error Boundary** cho mỗi feature/page chính.
- API errors xử lý tập trung qua Axios interceptor.
- Hiển thị fallback UI thay vì crash.
- Log errors có ý nghĩa (không log sensitive data).

---

## 12. Git & Code Quality

- Branch naming: `feature/xxx`, `fix/xxx`, `refactor/xxx`
- Commit message tiếng Anh, ngắn gọn, bắt đầu bằng verb: `add`, `fix`, `update`, `refactor`, `remove`
- Mỗi PR chỉ giải quyết 1 vấn đề.
- Code review trước khi merge.

---

## 13. Những điều KHÔNG được làm

- KHÔNG commit `.env`, secrets, hay credentials.
- KHÔNG để `console.log` trong production code (dùng logger utility).
- KHÔNG import trực tiếp từ deep path của thư viện (dùng barrel exports).
- KHÔNG hardcode strings - dùng constants.
- KHÔNG tạo component God (quá nhiều responsibility) - tách nhỏ ra.
- KHÔNG ignore TypeScript errors bằng `@ts-ignore` (dùng `@ts-expect-error` nếu bắt buộc và ghi comment lý do).
