import { useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

/**
 * Wraps the cart's `addItem` so any call automatically fires the "added to
 * cart" toast. Components that want a confirmation should use this instead of
 * reaching into the cart store directly.
 */
export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useUIStore((s) => s.showCartToast);

  return useCallback(
    (product, qty = 1, variant = null) => {
      addItem(product, qty, variant);

      const localName = product.name?.fr ?? product.name;
      const image = product.images?.[0] ?? product.image ?? null;
      const price = variant?.price ?? product.price ?? 0;
      const variantLabel = variant?.capacity
        ? `${product.brand ? `${product.brand} · ` : ''}${variant.capacity}`
        : null;

      showToast({
        name: localName,
        image,
        price,
        qty,
        variantLabel,
      });
    },
    [addItem, showToast]
  );
}
