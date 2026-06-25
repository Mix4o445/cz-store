import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders.api';
import { useAuthStore } from '@/store/authStore';

export function useMyOrders() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['orders', 'mine'],
    enabled: !!token,
    queryFn: async () => {
      const res = await ordersApi.mine();
      return res.data ?? [];
    },
  });
}

export function useOrder(id) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['orders', 'one', id],
    enabled: !!token && !!id,
    queryFn: async () => {
      const res = await ordersApi.byId(id);
      return res.data;
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await ordersApi.create(payload);
      return res.data; // returns the created order document
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders', 'mine'] });
    },
  });
}
