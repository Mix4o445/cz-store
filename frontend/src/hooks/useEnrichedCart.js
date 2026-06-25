import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/store/cartStore';
import { productsApi } from '@/api/products.api';

/**
 * Returns the cart items enriched with the latest server-side price + delivery
 * fee. Falls back to the stored values when the network query is still loading
 * or the product was deleted. This keeps the cart preview consistent with what
 * the backend will compute at order time.
 */
export function useEnrichedCart() {
  const items = useCartStore((s) => s.items);
  const ids = useMemo(
    () => [...new Set(items.map((i) => i.productId).filter(Boolean))],
    [items]
  );
  const idsKey = ids.slice().sort().join(',');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'by-ids', idsKey],
    enabled: ids.length > 0,
    queryFn: async () => {
      const res = await productsApi.byIds(idsKey);
      return res.data ?? [];
    },
    staleTime: 30_000,
  });

  const enriched = useMemo(() => {
    if (!products.length) return items;
    return items.map((item) => {
      const fresh = products.find((p) => p._id === item.productId);
      if (!fresh) return item;
      const variant = item.variant?._id
        ? fresh.variants?.find((v) => v._id === item.variant._id)
        : null;
      return {
        ...item,
        price: variant?.price ?? fresh.price ?? item.price,
        deliveryFee: fresh.deliveryFee ?? 0,
        stock: variant?.stock ?? fresh.stock,
        // Keep the latest image too, in case admin updates product photos
        image: fresh.images?.[0] ?? item.image,
      };
    });
  }, [items, products]);

  const subtotal = enriched.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  const shipping = enriched.reduce(
    (s, i) => s + (i.deliveryFee ?? 0) * i.qty,
    0
  );
  const total = subtotal + shipping;

  return { items: enriched, subtotal, shipping, total, isLoading };
}
