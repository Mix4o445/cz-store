import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdmin';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatPrice';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const TONES = {
  pending: 'bg-line text-ink-muted',
  confirmed: 'bg-primary/10 text-primary',
  shipped: 'bg-accent/15 text-ink',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-signal/10 text-signal',
};

export default function AdminOrders() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const { data: orders = [], isLoading, isError, error, refetch } = useAdminOrders(filter);
  const updateStatus = useUpdateOrderStatus();

  const fmt = (date) =>
    date
      ? new Intl.DateTimeFormat('fr-MA', {
          day: 'numeric',
          month: 'short',
          year: '2-digit',
        }).format(new Date(date))
      : '';

  return (
    <div>
      <header className="flex items-end justify-between border-b border-line pb-5 mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-medium">{t('admin.orders.title')}</h2>
          <p className="text-ink-muted text-sm mt-1">{t('admin.orders.sub')}</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-transparent border-b border-ink/20 px-1 py-2 text-sm focus:border-ink outline-none"
        >
          <option value="">{t('admin.orders.filter_all')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`account.orders.status.${s}`)}
            </option>
          ))}
        </select>
      </header>

      {isLoading && (
        <div className="grid place-items-center py-12 text-ink-muted">
          <Loader2 size={26} className="animate-spin" />
        </div>
      )}

      {isError && (
        <div className="border border-line p-6 text-center text-sm">
          <p className="text-signal mb-3">{getApiErrorMessage(error, t('common.error'))}</p>
          <button onClick={() => refetch()} className="btn-outline">{t('common.retry')}</button>
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="border border-line p-12 text-center text-sm text-ink-muted">
          {t('admin.orders.empty')}
        </div>
      )}

      {orders.length > 0 && (
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
                <th className="text-start font-medium py-3 px-6 md:px-0">#</th>
                <th className="text-start font-medium py-3">{t('admin.orders.client')}</th>
                <th className="text-start font-medium py-3">{t('admin.orders.date')}</th>
                <th className="text-start font-medium py-3">{t('admin.orders.items')}</th>
                <th className="text-end font-medium py-3">{t('admin.orders.total')}</th>
                <th className="text-start font-medium py-3 ps-6 pe-6 md:pe-0">{t('admin.orders.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-y border-line">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-chrome transition-colors">
                  <td className="py-3 ps-6 md:ps-0 pe-3">
                    <Link to={`/admin/orders/${o._id}`} className="num text-[11px] text-ink-muted uppercase tracking-wider-1 hover:text-ink inline-flex items-center gap-1">
                      #{o._id.slice(-6).toUpperCase()}
                      <ArrowUpRight size={11} strokeWidth={1.6} />
                    </Link>
                  </td>
                  <td className="py-3 pe-3">
                    <Link to={`/admin/orders/${o._id}`} className="block">
                      <p className="font-medium truncate max-w-[200px]">{o.user?.name ?? o.shipping?.name ?? 'Invité'}</p>
                      <p className="text-[11px] text-ink-muted truncate max-w-[200px]">{o.user?.email ?? o.shipping?.phone}</p>
                    </Link>
                  </td>
                  <td className="py-3 pe-3 text-ink-muted whitespace-nowrap">{fmt(o.createdAt)}</td>
                  <td className="py-3 pe-3 num text-ink-muted">{o.items?.length ?? 0}</td>
                  <td className="py-3 pe-3 price text-end">{formatPrice(o.total)}</td>
                  <td className="py-3 ps-6 pe-6 md:pe-0">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus.mutate({ id: o._id, status: e.target.value })}
                      className={`tag border-0 ${TONES[o.status]} cursor-pointer focus:outline-none`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`account.orders.status.${s}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
