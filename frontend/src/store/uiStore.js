import { create } from 'zustand';

export const useUIStore = create((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  toggleCart: (v) => set((s) => ({ cartOpen: typeof v === 'boolean' ? v : !s.cartOpen })),
  toggleSearch: (v) => set((s) => ({ searchOpen: typeof v === 'boolean' ? v : !s.searchOpen })),
  toggleMobileMenu: (v) => set((s) => ({ mobileMenuOpen: typeof v === 'boolean' ? v : !s.mobileMenuOpen })),
}));
