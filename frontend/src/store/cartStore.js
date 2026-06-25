import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      /**
       * Add a product (or one of its variants) to the cart.
       * @param {object} product
       * @param {number} qty
       * @param {object|null} variant - one entry from product.variants
       */
      addItem: (product, qty = 1, variant = null) =>
        set((state) => {
          const baseId = product._id ?? product.id ?? product.slug;
          const variantKey = variant?._id ?? variant?.idx ?? null;
          const id = variantKey != null ? `${baseId}::${variantKey}` : baseId;

          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id,
                productId: baseId,
                slug: product.slug,
                name: product.name,
                price: variant?.price ?? product.price,
                deliveryFee: product.deliveryFee ?? 0,
                image: product.images?.[0] ?? product.image,
                variant: variant
                  ? {
                      _id: variant._id ?? null,
                      idx: variant.idx ?? null,
                      capacity: variant.capacity,
                    }
                  : null,
                qty,
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
            .filter((i) => i.qty > 0),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      getShipping: () =>
        get().items.reduce((s, i) => s + (i.deliveryFee ?? 0) * i.qty, 0),
      getCount: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: 'coolzone-cart' }
  )
);
