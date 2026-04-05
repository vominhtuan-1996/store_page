# Create API Service

Tạo một service module cho API calls.

## Input
- `$ARGUMENTS` - Tên resource/domain (VD: `user`, `product`, `order`)

## Instructions

1. Parse `$ARGUMENTS` lấy tên resource (camelCase).

2. Kiểm tra file `src/services/api.ts` (axios instance) đã tồn tại chưa. Nếu chưa, tạo:

```ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

3. Tạo file service: `src/services/[resource]Service.ts`

4. Template service:

```ts
import { api } from './api';

// Types
export interface [Resource] {
  id: string;
  // TODO: Define fields
}

export interface Create[Resource]Dto {
  // TODO: Define create payload
}

export interface Update[Resource]Dto {
  // TODO: Define update payload
}

// Service
export const [resource]Service = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<[Resource][]>('/[resources]', { params }),

  getById: (id: string) =>
    api.get<[Resource]>(`/[resources]/${id}`),

  create: (data: Create[Resource]Dto) =>
    api.post<[Resource]>('/[resources]', data),

  update: (id: string, data: Update[Resource]Dto) =>
    api.patch<[Resource]>(`/[resources]/${id}`, data),

  delete: (id: string) =>
    api.delete(`/[resources]/${id}`),
};
```

5. Tạo file query hook kèm theo (nếu dùng TanStack Query): `src/hooks/use[Resource]Query.ts`

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [resource]Service } from '@/services/[resource]Service';

const QUERY_KEY = '[resources]';

export const use[Resource]List = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => [resource]Service.getAll(params).then(res => res.data),
  });
};

export const use[Resource]Detail = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => [resource]Service.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreate[Resource] = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: [resource]Service.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
};
```

6. Sau khi tạo, liệt kê tất cả file đã tạo.
