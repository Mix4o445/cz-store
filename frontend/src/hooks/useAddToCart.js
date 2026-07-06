import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

/**
 * Wraps the cart's `addItem` so any call automatically fires the "added to
 * cart" toast. Components that want a confirmation should use this instead of
 * reaching into the cart store directly.
 *
 * `contactOnly` products (the admin "Sur devis" toggle) can never be added
 * to the cart — instead, the caller is expected to render a WhatsApp
 * contact button. We guard here too so a stale UI, a deep link, or a
 * future call site can't slip a contactOnly product into the cart.
 */
export function useAddToCart() {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useUIStore((s) => s.showCartToast);

  return useCallback(
    (product, qty = 1, variant = null) => {
      if (product?.contactOnly) {
        // No-op. The UI should already be showing a WhatsApp CTA; this is
        // the belt-and-braces guard so the cart can never end up with a
        // price-less product.
        // eslint-disable-next-line no-console
        console.warn(
          `[cart] ${product.name?.fr ?? 'product'} is contactOnly — ignored addToCart.`
        );
        return { ok: false, reason: t('product.contact_only') };
      }

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

      return { ok: true };
    },
    [addItem, showToast, t]
  );
}
