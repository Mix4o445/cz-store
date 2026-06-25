import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Loader2, Users, Package, ShoppingCart, Tags as TagsIcon, Layers3, Wallet, ArrowUpRight } from 'lucide-react';
import { useDashboard } from '@/hooks/useAdmin';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatPrice';

const STATUS_TONES = {
  pending: 'bg-line text-ink-muted',
  confirmed: 'bg-primary/10 text-primary',
  shipped: 'bg-accent/15 text-ink',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-signal/10 text-signal',
};

function Stat({ icon: Icon, label, value, to }) {
  return (
    <Link
      to={to}
      className="group border border-line p-5 hover:border-ink transition-colors flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <Icon size={18} strokeWidth={1.5} className="text-ink-muted" />
        <ArrowUpRight size={14} className="text-ink-muted group-hover:text-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <div>
        <p className="num text-3xl font-display font-medium">{value}</p>
        <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted mt-1">{label}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid place-items-center py-16 text-ink-muted">
        <Loader2 size={26} className="animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center text-sm py-12">
        <p className="text-signal mb-3">{getApiErrorMessage(error, t('common.error'))}</p>
        <button onClick={() => refetch()} className="btn-outline">{t('common.retry')}</button>
      </div>
    );
  }

  const { counts = {}, revenue = 0, recentOrders = [], lowStock = [] } = data ?? {};
  const fmt = (date) =>
    date
      ? new Intl.DateTimeFormat('fr-MA', {
          day: 'numeric',
          month: 'short',
        }).format(new Date(date))
      : '';

  return (
    <div className="space-y-12">
      <header>
        <h2 className="font-display text-2xl md:text-3xl font-medium">{t('admin.dashboard.title')}</h2>
        <p className="text-ink-muted text-sm mt-1">{t('admin.dashboard.sub')}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-line">
        <div className="bg-paper">
          <Stat icon={Wallet} label={t('admin.dashboard.revenue')} value={formatPrice(revenue)} to="orders" />
        </div>
        <div className="bg-paper">
          <Stat icon={ShoppingCart} label={t('admin.dashboard.orders')} value={counts.orders ?? 0} to="orders" />
        </div>
        <div className="bg-paper">
          <Stat icon={Users} label={t('admin.dashboard.users')} value={counts.users ?? 0} to="users" />
        </div>
        <div className="bg-paper">
          <Stat icon={Package} label={t('admin.dashboard.products')} value={counts.products ?? 0} to="products" />
        </div>
        <div className="bg-paper">
          <Stat icon={TagsIcon} label={t('admin.dashboard.brands')} value={counts.brands ?? 0} to="brands" />
        </div>
        <div className="bg-paper">
          <Stat icon={Layers3} label={t('admin.dashboard.categories')} value={counts.categories ?? 0} to="categories" />
        </div>
      </div>

      <section>
        <h3 className="font-display text-lg font-medium mb-4">{t('admin.dashboard.recent_orders')}</h3>
        {recentOrders.length === 0 ? (
          <div className="border border-line p-8 text-center text-sm text-ink-muted">
            {t('account.orders.empty')}
          </div>
        ) : (
          <ul className="border-y border-line divide-y divide-line">
            {recentOrders.map((o) => (
              <li key={o._id} className="py-4 grid grid-cols-2 md:grid-cols-5 items-center gap-3 text-sm">
                <p className="num text-[11px] text-ink-muted uppercase tracking-wider-1">
                  #{o._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-ink-muted truncate">{o.user?.name ?? 'Invité'}</p>
                <p className="text-ink-muted text-xs">{fmt(o.createdAt)}</p>
                <span className={`tag w-fit ${STATUS_TONES[o.status] ?? 'bg-line text-ink-muted'}`}>
                  {t(`account.orders.status.${o.status}`)}
                </span>
                <p className="price justify-self-end">{formatPrice(o.total)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-display text-lg font-medium mb-4">{t('admin.dashboard.low_stock')}</h3>
        {lowStock.length === 0 ? (
          <p className="text-ink-muted text-sm border border-line p-6 text-center">
            {t('admin.dashboard.no_low_stock')}
          </p>
        ) : (
          <ul className="border-y border-line divide-y divide-line">
            {lowStock.map((p) => (
              <li key={p._id} className="py-3 flex items-center justify-between text-sm">
                <Link to="products" className="link-underline">
                  {p.name?.fr ?? p.slug}
                </Link>
                <span className={`num text-xs ${p.stock === 0 ? 'text-signal' : 'text-ink-muted'}`}>
                  {p.stock} en stock
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
