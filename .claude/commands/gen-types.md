# Generate TypeScript Types

Tạo TypeScript types/interfaces từ mô tả hoặc JSON data.

## Input
- `$ARGUMENTS` - Mô tả entity hoặc JSON sample data

## Instructions

1. Parse `$ARGUMENTS`:
   - Nếu là JSON → infer types từ data
   - Nếu là mô tả text → tạo types theo mô tả

2. Tạo file types trong `src/types/` hoặc `src/features/[feature]/types/`

3. Quy tắc TypeScript:
   - Dùng `interface` cho object shapes
   - Dùng `type` cho unions, intersections, utility types
   - Mọi field phải có type cụ thể (KHÔNG dùng `any`)
   - Optional fields dùng `?`
   - Array dùng `Type[]` (không dùng `Array<Type>`)
   - Date fields dùng `string` (ISO format) hoặc `Date`
   - ID fields dùng `string`

4. Tạo các variant types:

```ts
// Base entity
export interface [Entity] {
  id: string;
  // ... fields
  createdAt: string;
  updatedAt: string;
}

// Create DTO (omit auto-generated fields)
export type Create[Entity]Dto = Omit<[Entity], 'id' | 'createdAt' | 'updatedAt'>;

// Update DTO (partial, omit auto-generated fields)
export type Update[Entity]Dto = Partial<Create[Entity]Dto>;

// List response
export interface [Entity]ListResponse {
  data: [Entity][];
  total: number;
  page: number;
  limit: number;
}

// Filter params
export interface [Entity]FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof [Entity];
  sortOrder?: 'asc' | 'desc';
}
```

5. Sau khi tạo, liệt kê tất cả types đã generate.
