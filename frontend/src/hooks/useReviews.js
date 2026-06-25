import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/api/reviews.api';

export function useProductReviews(productId) {
  return useQuery({
    queryKey: ['reviews', productId],
    enabled: !!productId,
    queryFn: async () => {
      const res = await reviewsApi.listForProduct(productId);
      return res.data ?? { reviews: [], mine: null };
    },
  });
}

export function useSubmitReview(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => reviewsApi.upsert(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteReview(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => reviewsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
