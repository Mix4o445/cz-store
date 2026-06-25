import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';

export function useUpdateProfile() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await usersApi.updateProfile(payload);
      return res.data;
    },
    onSuccess: (user) => {
      setAuth({ user, token });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await authApi.changePassword(payload);
      return res.data;
    },
  });
}

export function useAddresses() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['user', 'addresses'],
    enabled: !!token,
    queryFn: async () => {
      const res = await usersApi.listAddresses();
      return res.data ?? [];
    },
  });
}

export function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await usersApi.addAddress(payload);
      return res.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['user', 'addresses'], data);
    },
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const res = await usersApi.updateAddress(id, payload);
      return res.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['user', 'addresses'], data);
    },
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await usersApi.deleteAddress(id);
      return res.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['user', 'addresses'], data);
    },
  });
}
