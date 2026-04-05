# Create Feature Module

Tạo một feature module hoàn chỉnh với đầy đủ cấu trúc thư mục.

## Input
- `$ARGUMENTS` - Tên feature (VD: `auth`, `product`, `cart`, `checkout`)

## Instructions

1. Parse `$ARGUMENTS` lấy tên feature (kebab-case cho folder, PascalCase cho components).

2. Tạo cấu trúc thư mục:

```
src/features/[feature-name]/
├── components/
│   └── .gitkeep
├── hooks/
│   └── .gitkeep
├── services/
│   └── [feature]Service.ts
├── types/
│   └── [feature].types.ts
└── index.ts
```

3. File `types/[feature].types.ts`:

```ts
export interface [Feature] {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: Define fields
}

export interface Create[Feature]Dto {
  // TODO: Define create payload
}

export interface Update[Feature]Dto {
  // TODO: Define update payload
}

export interface [Feature]FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  // TODO: Define filter params
}
```

4. File `services/[feature]Service.ts`:
   - Import từ `@/services/api`
   - CRUD operations cho feature
   - Type-safe với types đã define

5. File `index.ts` (barrel export):

```ts
// Components
// export { ComponentName } from './components/ComponentName';

// Hooks
// export { useHookName } from './hooks/useHookName';

// Services
export { [feature]Service } from './services/[feature]Service';

// Types
export type { [Feature], Create[Feature]Dto, Update[Feature]Dto } from './types/[feature].types';
```

6. Sau khi tạo, liệt kê tất cả file/folder đã tạo và hướng dẫn next steps.
