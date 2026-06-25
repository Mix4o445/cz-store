import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Search, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import Logo from '../common/Logo';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { t } = useTranslation();
  const count = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    clsx(
      'relative text-sm font-medium tracking-wide py-1.5 px-1 transition-colors',
      isActive ? 'text-ink' : 'text-ink/60 hover:text-ink',
      isActive && 'after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:bg-ink'
    );

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled ? 'backdrop-blur-md bg-paper/80 border-b border-line' : 'bg-paper border-b border-transparent'
      )}
    >
      <div className="container-app flex h-16 md:h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center shrink-0">
          <Logo className="h-9 md:h-10" />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" end className={linkClass}>{t('nav.home')}</NavLink>
          <NavLink to="/shop" className={linkClass}>{t('nav.shop')}</NavLink>
          <NavLink to="/about" className={linkClass}>{t('nav.about')}</NavLink>
          <NavLink to="/contact" className={linkClass}>{t('nav.contact')}</NavLink>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            className="p-2 rounded-full text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors hidden sm:inline-flex"
            aria-label={t('nav.search')}
          >
            <Search size={18} strokeWidth={1.6} />
          </button>
          <Link
            to="/wishlist"
            className="p-2 rounded-full text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors hidden sm:inline-flex"
            aria-label={t('nav.wishlist')}
          >
            <Heart size={18} strokeWidth={1.6} />
          </Link>
          <Link
            to="/account"
            className="p-2 rounded-full text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors hidden sm:inline-flex"
            aria-label={t('nav.account')}
          >
            <User size={18} strokeWidth={1.6} />
          </Link>
          <Link
            to="/cart"
            className="relative p-2 rounded-full text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors"
            aria-label={t('nav.cart')}
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            {count > 0 && (
              <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-paper text-[10px] font-semibold flex items-center justify-center num">
                {count}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden md:inline-flex items-center gap-1.5 ms-2 px-3 py-1.5 text-[11px] uppercase tracking-wider-1 font-semibold text-paper bg-ink rounded-full hover:bg-primary transition-colors"
              aria-label={t('admin.title')}
            >
              <ShieldCheck size={13} strokeWidth={1.8} />
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
