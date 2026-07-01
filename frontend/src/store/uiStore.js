import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  cartOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  cartToast: null, // { id, name, image, price, qty } | null
  toggleCart: (v) => set((s) => ({ cartOpen: typeof v === 'boolean' ? v : !s.cartOpen })),
  toggleSearch: (v) => set((s) => ({ searchOpen: typeof v === 'boolean' ? v : !s.searchOpen })),
  toggleMobileMenu: (v) => set((s) => ({ mobileMenuOpen: typeof v === 'boolean' ? v : !s.mobileMenuOpen })),

  /** Show the "added to cart" toast. `id` keeps successive toasts from
   *  clobbering each other when the user spam-clicks. */
  showCartToast: (payload) => {
    if (!payload) return;
    set({ cartToast: { id: Date.now() + Math.random(), ...payload } });
  },
  hideCartToast: () => set({ cartToast: null }),
}));
