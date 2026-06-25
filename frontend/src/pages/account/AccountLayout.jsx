import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, User, MapPin, Package, Lock, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

const NAV = [
  { to: '.', icon: LayoutGrid, key: 'overview', end: true },
  { to: 'profile', icon: User, key: 'profile' },
  { to: 'addresses', icon: MapPin, key: 'addresses' },
  { to: 'orders', icon: Package, key: 'orders' },
  { to: 'security', icon: Lock, key: 'security' },
  { to: 'preferences', icon: Settings, key: 'preferences' },
];

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('account.greeting_morning');
  if (h < 18) return t('account.greeting_afternoon');
  return t('account.greeting_evening');
}

export default function AccountLayout() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();

  if (!user) {
    return (
      <section className="container-app py-24 max-w-md text-center space-y-5">
        <p className="eyebrow justify-center">Compte</p>
        <h1 className="font-display font-medium text-display-sm">{t('nav.account')}</h1>
        <p className="text-ink-muted text-sm">{t('auth.no_account')}</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link to="/login" className="btn-primary">{t('auth.login')}</Link>
          <Link to="/register" className="btn-outline">{t('auth.register')}</Link>
        </div>
      </section>
    );
  }

  const onLogout = () => {
    logout.mutate(undefined, { onSettled: () => navigate('/', { replace: true }) });
  };

  const firstName = user.name?.split(' ')[0] ?? '';

  return (
    <section className="container-app py-12 md:py-16">
      <header className="border-b border-line pb-8 mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">{t('nav.account')}</p>
          <h1 className="font-display font-medium text-display-md">
            {getGreeting(t)}, {firstName}.
          </h1>
          <p className="text-ink-muted text-sm mt-2">{user.email}</p>
        </div>
        <button onClick={onLogout} className="btn-outline self-start md:self-auto">
          <LogOut size={14} strokeWidth={1.6} />
          {t('auth.logout')}
        </button>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
        {/* Mobile horizontal tab strip */}
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
                        : 'border-line text-ink-muted hover:text-ink hover:border-ink/40'
                    )
                  }
                >
                  <Icon size={14} strokeWidth={1.6} />
                  {t(`account.nav.${key}`)}
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
                  {t(`account.nav.${key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
