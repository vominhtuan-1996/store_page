# Add Form Component

Tạo form component với React Hook Form + Zod validation.

## Input
- `$ARGUMENTS` - Tên form và các fields (VD: `LoginForm email:string password:string` hoặc `ProductForm`)

## Instructions

1. Parse `$ARGUMENTS`:
   - Tên form (PascalCase)
   - Danh sách fields và types (nếu có)

2. Tạo Zod schema:

```ts
import { z } from 'zod';

export const [formName]Schema = z.object({
  // fields với validation rules
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export type [FormName]FormData = z.infer<typeof [formName]Schema>;
```

3. Tạo form component:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { [formName]Schema, type [FormName]FormData } from './[formName].schema';

interface [FormName]Props {
  onSubmit: (data: [FormName]FormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<[FormName]FormData>;
}

export const [FormName] = ({ onSubmit, isLoading, defaultValues }: [FormName]Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<[FormName]FormData>({
    resolver: zodResolver([formName]Schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Field Name
        </label>
        <input
          {...register('fieldName')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.fieldName && (
          <p className="mt-1 text-sm text-red-600">{errors.fieldName.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Đang xử lý...' : 'Submit'}
      </button>
    </form>
  );
};
```

4. Quy tắc:
   - Validation logic PHẢI ở Zod schema (không validate trong component)
   - Schema và types tách file riêng: `[formName].schema.ts`
   - Form component chỉ lo render và UX
   - Error messages hiển thị inline dưới mỗi field
   - Hỗ trợ loading state
   - Hỗ trợ defaultValues cho edit mode

5. Sau khi tạo, liệt kê files và hướng dẫn sử dụng.
