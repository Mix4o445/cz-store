import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';

/** Extracts a friendly message out of an axios error from our API envelope. */
export function getApiErrorMessage(error, fallback = 'Une erreur est survenue') {
  const data = error?.response?.data;
  let msg = data?.message || error?.message || fallback;

  // Surface zod-validated field errors so the user knows what failed.
  const fields = data?.details?.fieldErrors;
  if (fields && typeof fields === 'object') {
    const parts = Object.entries(fields)
      .filter(([, v]) => Array.isArray(v) && v.length > 0)
      .map(([k, v]) => `${k}: ${v.join(', ')}`);
    if (parts.length) msg = `${msg} — ${parts.join(' · ')}`;
  }
  return msg;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (credentials) => {
      const res = await authApi.login(credentials);
      return res.data; // { user, token }
    },
    onSuccess: (data) => {
      if (data?.user) setAuth({ user: data.user, token: data.token });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await authApi.register(payload);
      return res.data; // { user, token }
    },
    onSuccess: (data) => {
      if (data?.user) setAuth({ user: data.user, token: data.token });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useLogout() {
  const logoutLocal = useAuthStore((s) => s.logout);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout().catch(() => null),
    onSuccess: () => {
      logoutLocal();
      // Wishlist is per-user. Clear it so it doesn't bleed onto another user
      // signing in on the same device.
      useWishlistStore.getState().clear();
      qc.clear();
    },
  });
}

export function useMe() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await authApi.me();
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });
}
