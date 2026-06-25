import { NavLink, Outlet, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  Tags as TagsIcon,
  Layers3,
  ShoppingCart,
  Users,
  ArrowLeft,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { to: '.', icon: LayoutDashboard, key: 'dashboard', end: true },
  { to: 'products', icon: Package, key: 'products' },
  { to: 'categories', icon: Layers3, key: 'categories' },
  { to: 'brands', icon: TagsIcon, key: 'brands' },
  { to: 'orders', icon: ShoppingCart, key: 'orders' },
  { to: 'users', icon: Users, key: 'users' },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (user.role !== 'admin') {
    return (
      <section className="container-app py-24 max-w-md text-center space-y-5">
        <p className="eyebrow justify-center">403</p>
        <h1 className="font-display font-medium text-display-sm">Accès refusé</h1>
        <p className="text-ink-muted text-sm">
          Cette section est réservée aux administrateurs.
        </p>
        <Link to="/" className="btn-primary inline-flex">{t('notfound.back')}</Link>
      </section>
    );
  }

  return (
    <section className="bg-chrome min-h-[calc(100vh-5rem)]">
      <div className="container-app py-10 md:py-12">
        <header className="flex items-center justify-between border-b border-line pb-6 mb-8">
          <div>
            <p className="eyebrow mb-2">{t('admin.title')}</p>
            <h1 className="font-display font-medium text-2xl md:text-3xl">CoolZone Admin.</h1>
          </div>
          <Link to="/" className="btn-ghost text-xs uppercase tracking-wider-1 inline-flex items-center gap-2">
            <ArrowLeft size={14} strokeWidth={1.6} />
            {t('admin.nav.back')}
          </Link>
        </header>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8 lg:gap-12">
          {/* Mobile horizontal tabs */}
          <nav className="lg:hidden -mx-5 sm:-mx-8 px-5 sm:px-8 overflow-x-auto no-scrollbar">
            <ul className="flex gap-2 min-w-max pb-1">
              {NAV.map(({ to, icon: Icon, key, end }) => (
                <li key={key}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      clsx(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border',
                        isActive
                          ? 'bg-ink text-paper border-ink'
                          : 'bg-paper border-line text-ink-muted hover:text-ink hover:border-ink/40'
                      )
                    }
                  >
                    <Icon size={14} strokeWidth={1.6} />
                    {t(`admin.nav.${key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 h-fit">
            <ul className="space-y-1">
              {NAV.map(({ to, icon: Icon, key, end }) => (
                <li key={key}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-ink text-paper'
                          : 'text-ink-muted hover:text-ink hover:bg-ink/5'
                      )
                    }
                  >
                    <Icon size={15} strokeWidth={1.6} />
                    {t(`admin.nav.${key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-w-0 bg-paper border border-line p-6 md:p-10">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}
