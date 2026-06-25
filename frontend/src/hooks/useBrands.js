import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from '@/api/brands.api';

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await brandsApi.list();
      return res.data ?? [];
    },
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => brandsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => brandsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => brandsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }),
  });
}
