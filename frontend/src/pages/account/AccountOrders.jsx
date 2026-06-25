import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Package, ArrowUpRight } from 'lucide-react';import { useMyOrders } from '@/hooks/useOrders';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatPrice';
import SectionHeader from './SectionHeader';

const STATUS_TONES = {
  pending: 'bg-line text-ink-muted',
  confirmed: 'bg-primary/10 text-primary',
  shipped: 'bg-accent/15 text-ink',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-signal/10 text-signal',
};

export default function AccountOrders() {
  const { t } = useTranslation();
  const { data: orders = [], isLoading, isError, error, refetch } = useMyOrders();

  const fmt = (date) =>
    date
      ? new Intl.DateTimeFormat('fr-MA', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(date))
      : '';

  return (
    <div>
      <SectionHeader title={t('account.orders.title')} sub={t('account.orders.sub')} />

      {isLoading && (
        <div className="grid place-items-center py-12 text-ink-muted">
          <Loader2 size={22} className="animate-spin" />
        </div>
      )}

      {isError && (
        <div className="border border-line p-6 text-center text-sm">
          <p className="text-signal mb-3">{getApiErrorMessage(error, t('common.error'))}</p>
          <button onClick={() => refetch()} className="btn-outline text-sm">
            {t('common.retry')}
          </button>
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="border border-line p-12 text-center">
          <Package size={28} strokeWidth={1.4} className="mx-auto text-ink-muted mb-3" />
          <p className="text-ink-muted text-sm">{t('account.orders.empty')}</p>
          <Link to="/shop" className="btn-outline mt-4 inline-flex">
            {t('common.explore')}
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <ul className="border-y border-line divide-y divide-line">
          {orders.map((order) => {
            const itemsCount = order.items?.length ?? 0;
            return (
              <li key={order._id}>
                <Link
                  to={`/orders/${order._id}`}
                  className="py-5 grid grid-cols-2 md:grid-cols-5 items-center gap-4 text-sm hover:bg-chrome -mx-3 md:mx-0 px-3 md:px-0 transition-colors"
                >
                  <div className="col-span-2 md:col-span-1">
                    <p className="num text-[11px] text-ink-muted uppercase tracking-wider-1">
                      #{order._id?.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-ink-muted text-xs mt-0.5">{fmt(order.createdAt)}</p>
                  </div>
                  <p className="text-ink-muted">
                    {t('account.orders.items_other', { count: itemsCount })}
                  </p>
                  <span
                    className={`tag w-fit ${STATUS_TONES[order.status] ?? 'bg-line text-ink-muted'}`}
                  >
                    {t(`account.orders.status.${order.status}`)}
                  </span>
                  <p className="price">{formatPrice(order.total)}</p>
                  <span className="text-ink-muted text-xs inline-flex items-center gap-1 justify-self-end">
                    {t('account.orders.view')} <ArrowUpRight size={12} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
