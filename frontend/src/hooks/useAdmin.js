import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { categoriesApi } from '@/api/categories.api';
import { productsApi } from '@/api/products.api';
import { ordersApi } from '@/api/orders.api';
import { useAuthStore } from '@/store/authStore';

const isAdmin = (s) => s.user?.role === 'admin';

export function useIsAdmin() {
  return useAuthStore(isAdmin);
}

/* Dashboard */
export function useDashboard() {
  const enabled = useIsAdmin();
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    enabled,
    queryFn: async () => {
      const res = await adminApi.dashboard();
      return res.data;
    },
  });
}

/* Users */
export function useAdminUsers(q = '') {
  const enabled = useIsAdmin();
  return useQuery({
    queryKey: ['admin', 'users', q],
    enabled,
    queryFn: async () => {
      const res = await adminApi.listUsers({ q, limit: 100 });
      return res.data ?? [];
    },
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => adminApi.setUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

/* Orders */
export function useAdminOrders(status = '') {
  const enabled = useIsAdmin();
  return useQuery({
    queryKey: ['admin', 'orders', status],
    enabled,
    queryFn: async () => {
      const res = await adminApi.listAllOrders({ status, limit: 200 });
      return res.data ?? [];
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

/* Categories CRUD */
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => categoriesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}
export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => categoriesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => categoriesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

/* Products CRUD */
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => productsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}
export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => productsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

/* Tags */
export function useTags() {
  return useQuery({
    queryKey: ['products', 'tags'],
    queryFn: async () => {
      const res = await productsApi.tags();
      return res.data ?? [];
    },
  });
}
