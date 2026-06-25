import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products.api';

// Backend wraps responses in { success, message, data }. Hooks unwrap `.data`.

export function useProductList(params = {}) {
  return useQuery({
    queryKey: ['products', 'list', params],
    queryFn: async () => {
      const res = await productsApi.list(params);
      return res.data ?? { items: [], total: 0, page: 1, limit: 24 };
    },
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await productsApi.featured();
      return res.data ?? [];
    },
  });
}

export function useProductBySlug(slug) {
  return useQuery({
    queryKey: ['products', 'slug', slug],
    queryFn: async () => {
      const res = await productsApi.bySlug(slug);
      return res.data;
    },
    enabled: !!slug,
  });
}
