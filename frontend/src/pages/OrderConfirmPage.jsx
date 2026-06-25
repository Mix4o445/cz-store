import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, Banknote, Building2 } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { useLocalized } from '@/hooks/useLocalized';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatPrice';

const STATUS_TONES = {
  pending: 'bg-line text-ink-muted',
  confirmed: 'bg-primary/10 text-primary',
  shipped: 'bg-accent/15 text-ink',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-signal/10 text-signal',
};

export default function OrderConfirmPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const local = useLocalized();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);

  if (isLoading) {
    return (
      <div className="container-app py-24 grid place-items-center text-ink-muted">
        <Loader2 size={26} className="animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="container-app py-24 text-center space-y-3">
        <p className="text-signal">{getApiErrorMessage(error, t('common.error'))}</p>
        <button onClick={() => refetch()} className="btn-outline">
          {t('common.retry')}
        </button>
      </div>
    );
  }
  if (!order) return null;

  const fmt = (date) =>
    new Intl.DateTimeFormat('fr-MA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));

  const isBank = order.payment?.method === 'bank_transfer';

  return (
    <section className="container-app py-12 md:py-16 max-w-4xl">
      <header className="mb-12 border-b border-line pb-8 flex flex-col items-start gap-4">
        <CheckCircle2 size={36} strokeWidth={1.4} className="text-emerald-600" />
        <p className="eyebrow">{t('order_confirm.eyebrow')}</p>
        <h1 className="font-display font-medium text-display-md">{t('order_confirm.title')}</h1>
        <p className="text-ink-muted text-base max-w-xl">{t('order_confirm.sub')}</p>
      </header>

      {/* Header strip with key facts */}
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line border border-line mb-10">
        <div className="bg-paper p-5">
          <dt className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
            {t('order_confirm.order_id')}
          </dt>
          <dd className="num font-medium mt-1">#{order._id.slice(-6).toUpperCase()}</dd>
        </div>
        <div className="bg-paper p-5">
          <dt className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
            {t('order_confirm.date')}
          </dt>
          <dd className="text-sm mt-1">{fmt(order.createdAt)}</dd>
        </div>
        <div className="bg-paper p-5">
          <dt className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
            {t('order_confirm.status')}
          </dt>
          <dd className="mt-1">
            <span className={`tag ${STATUS_TONES[order.status] ?? 'bg-line text-ink-muted'}`}>
              {t(`account.orders.status.${order.status}`)}
            </span>
          </dd>
        </div>
      </dl>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-16">
        {/* Items + payment instructions */}
        <div className="space-y-12">
          <section>
            <h2 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-4">
              {t('order_confirm.items')}
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {order.items.map((item, i) => (
                <li key={i} className="py-4 flex items-start gap-4">
                  <div className="w-14 h-16 bg-chrome shrink-0">
                    {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium leading-snug">{item.name}</p>
                    {item.variant && (
                      <p className="text-[11px] uppercase tracking-wider-1 text-ink-muted mt-0.5">
                        {item.variant}
                      </p>
                    )}
                    <p className="text-xs text-ink-muted mt-1">× {item.qty}</p>
                  </div>
                  <span className="price text-sm whitespace-nowrap">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-4">
              {t('order_confirm.next_steps')}
            </h2>
            <div className="border border-line p-6 space-y-4">
              <div className="flex items-start gap-3">
                {isBank ? (
                  <Building2 size={20} strokeWidth={1.5} className="text-ink shrink-0 mt-0.5" />
                ) : (
                  <Banknote size={20} strokeWidth={1.5} className="text-ink shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {isBank ? t('payment.bank_title') : t('payment.cod_title')}
                  </p>
                  <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                    {isBank ? t('order_confirm.bank_instructions') : t('order_confirm.cod_instructions')}
                  </p>
                </div>
              </div>

              {isBank && (
                <div className="border-t border-line pt-4">
                  <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-ink-muted">{t('payment.bank_holder')}</dt>
                    <dd className="font-medium">{t('payment.bank_holder_value')}</dd>
                    <dt className="text-ink-muted">{t('payment.bank_iban')}</dt>
                    <dd className="num font-medium">{t('payment.bank_iban_value')}</dd>
                    <dt className="text-ink-muted">{t('payment.bank_swift')}</dt>
                    <dd className="num font-medium">{t('payment.bank_swift_value')}</dd>
                    <dt className="text-ink-muted col-span-2 pt-2 text-xs leading-relaxed">
                      {t('payment.bank_proof')}
                    </dt>
                  </dl>
                </div>
              )}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link to="/" className="btn-outline">
              {t('order_confirm.back_home')}
            </Link>
            <Link to="/account/orders" className="btn-primary">
              {t('order_confirm.view_orders')}
            </Link>
          </div>
        </div>

        {/* Aside: shipping + total */}
        <aside className="space-y-8">
          <section>
            <h2 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-3">
              {t('order_confirm.shipping_to')}
            </h2>
            <div className="text-sm space-y-1 leading-relaxed">
              <p className="font-medium">{order.shipping?.name}</p>
              <p className="text-ink-muted">{order.shipping?.address}</p>
              <p className="text-ink-muted">
                {order.shipping?.city}
                {order.shipping?.wilaya ? ` · ${order.shipping.wilaya}` : ''}
              </p>
              <p className="text-ink-muted num">{order.shipping?.phone}</p>
            </div>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-3">
              {t('order_confirm.total')}
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t('cart.subtotal')}</dt>
                <dd className="price">{formatPrice(order.subtotal ?? 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t('cart.shipping')}</dt>
                <dd className="price">
                  {order.shipping_cost === 0 ? t('cart.free') : formatPrice(order.shipping_cost ?? 0)}
                </dd>
              </div>
              <div className="border-t border-line pt-3 flex justify-between font-display text-lg">
                <dt>{t('cart.total')}</dt>
                <dd className="price">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}
