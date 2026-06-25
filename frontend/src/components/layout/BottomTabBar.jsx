import { NavLink } from 'react-router-dom';
import { Home, Heart, Search, ShoppingBag, User } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';

export default function BottomTabBar() {
  const { t } = useTranslation();
  const count = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));

  const tabs = [
    { to: '/', icon: Home, label: t('nav.home'), end: true },
    { to: '/shop', icon: Search, label: t('nav.shop') },
    { to: '/cart', icon: ShoppingBag, label: t('nav.cart'), badge: count },
    { to: '/wishlist', icon: Heart, label: t('nav.wishlist') },
    { to: '/account', icon: User, label: t('nav.account') },
  ];

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, icon: Icon, label, end, badge }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'relative flex flex-col items-center justify-center gap-1 py-3',
                  isActive ? 'text-ink' : 'text-ink/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon size={20} strokeWidth={isActive ? 1.8 : 1.4} />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -end-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-paper text-[10px] font-semibold flex items-center justify-center num">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider-1 font-medium leading-none">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
