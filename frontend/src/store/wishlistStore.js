import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const id = product._id ?? product.id ?? product.slug;
        const exists = get().items.some((i) => i.id === id);
        set({
          items: exists
            ? get().items.filter((i) => i.id !== id)
            : [...get().items, { id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0] }],
        });
      },
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'coolzone-wishlist' }
  )
);
