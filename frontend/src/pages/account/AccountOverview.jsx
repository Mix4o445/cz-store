import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Package, Heart, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAddresses } from '@/hooks/useUser';
import { useMyOrders } from '@/hooks/useOrders';
import { formatPrice } from '@/utils/formatPrice';
import SectionHeader from './SectionHeader';

function StatCard({ icon: Icon, label, value, to }) {
  return (
    <Link
      to={to}
      className="group border border-line p-5 hover:border-ink transition-colors flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <Icon size={18} strokeWidth={1.5} className="text-ink-muted" />
        <ArrowUpRight
          size={14}
          className="text-ink-muted group-hover:text-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
      <div>
        <p className="num text-3xl font-display font-medium">{value}</p>
        <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted mt-1">{label}</p>
      </div>
    </Link>
  );
}

const STATUS_TONES = {
  pending: 'bg-line text-ink-muted',
  confirmed: 'bg-primary/10 text-primary',
  shipped: 'bg-accent/15 text-ink',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-signal/10 text-signal',
};

export default function AccountOverview() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { data: addresses = [] } = useAddresses();
  const { data: orders = [] } = useMyOrders();

  const recent = orders.slice(0, 3);

  return (
    <div className="space-y-12">
      <SectionHeader title={t('account.overview.title')} sub={t('account.overview.sub')} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line">
        <div className="bg-paper">
          <StatCard icon={Package} label={t('account.overview.stats_orders')} value={orders.length} to="/account/orders" />
        </div>
        <div className="bg-paper">
          <StatCard icon={Heart} label={t('account.overview.stats_wishlist')} value={wishlistCount} to="/wishlist" />
        </div>
        <div className="bg-paper">
          <StatCard icon={MapPin} label={t('account.overview.stats_addresses')} value={addresses.length} to="/account/addresses" />
        </div>
      </div>

      {/* Recent orders */}
      <section>
        <header className="flex items-end justify-between mb-5">
          <h3 className="font-display text-lg font-medium">{t('account.overview.recent_orders')}</h3>
          {orders.length > 0 && (
            <Link to="/account/orders" className="link-underline text-sm text-ink-muted hover:text-ink">
              {t('common.more')}
            </Link>
          )}
        </header>

        {recent.length === 0 ? (
          <div className="border border-line p-8 text-center text-sm">
            <p className="text-ink-muted">{t('account.overview.no_orders')}</p>
            <Link to="/shop" className="btn-outline mt-4 inline-flex">
              {t('account.overview.shop_now')}
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {recent.map((order) => (
              <li key={order._id} className="py-4 flex items-center justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="num text-xs text-ink-muted">
                    #{order._id?.slice(-6).toUpperCase()}
                  </p>
                  <p className="font-medium truncate">
                    {order.items?.length ?? 0} {t('account.orders.items_other', { count: order.items?.length ?? 0 })}
                  </p>
                </div>
                <span
                  className={`tag ${STATUS_TONES[order.status] ?? 'bg-line text-ink-muted'}`}
                >
                  {t(`account.orders.status.${order.status}`)}
                </span>
                <span className="price text-sm shrink-0">{formatPrice(order.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!user?.phone && (
        <p className="text-xs text-ink-muted border-s-2 border-primary ps-3">
          {t('account.overview.complete_profile')}{' '}
          <Link to="/account/profile" className="link-underline text-ink">
            {t('account.profile.title')}
          </Link>
        </p>
      )}
    </div>
  );
}
