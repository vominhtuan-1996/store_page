# Setup React Project

Khởi tạo dự án React với đầy đủ config theo convention.

## Instructions

1. **Khởi tạo Vite + React + TypeScript:**

```bash
pnpm create vite . --template react-ts
pnpm install
```

2. **Cài đặt dependencies:**

```bash
# Routing
pnpm add react-router-dom

# State management
pnpm add zustand

# Server state
pnpm add @tanstack/react-query

# HTTP client
pnpm add axios

# Form
pnpm add react-hook-form zod @hookform/resolvers

# Styling
pnpm add -D tailwindcss @tailwindcss/vite
```

3. **Cài đặt dev dependencies:**

```bash
# Linting & Formatting
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Path aliases
pnpm add -D @types/node
```

4. **Tạo cấu trúc thư mục:**

```
src/
├── assets/
├── components/
│   ├── ui/
│   └── common/
├── features/
├── hooks/
├── layouts/
├── pages/
├── services/
├── stores/
├── types/
├── utils/
├── constants/
├── routes/
└── styles/
```

5. **Config files:**

- `tsconfig.json` - Thêm path alias `@/`
- `vite.config.ts` - Thêm resolve alias
- `tailwind.config.js` - Thêm Tailwind CSS config bằng @tailwindcss/vite
- `.prettierrc` - Config Prettier
- `.eslintrc.cjs` - Config ESLint
- `.env.example` - Template env variables

6. **Tạo base files:**

- `src/services/api.ts` - Axios instance với interceptors
- `src/routes/index.tsx` - Route config với lazy loading
- `src/layouts/MainLayout.tsx` - Layout chính
- `src/pages/HomePage.tsx` - Trang chủ mặc định
- `src/App.tsx` - App component với Router + QueryProvider
- `src/main.tsx` - Entry point

7. **Cập nhật `.gitignore`** cho Vite project.

8. Sau khi setup xong, chạy `pnpm dev` để verify mọi thứ hoạt động.

9. Thông báo cho user danh sách tất cả file đã tạo/sửa và hướng dẫn bắt đầu.
