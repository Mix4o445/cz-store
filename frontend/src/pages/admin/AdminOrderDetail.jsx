import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Banknote,
  Building2,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { useUpdateOrderStatus } from '@/hooks/useAdmin';
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

const PAYMENT_LABEL = {
  cod: 'Paiement à la livraison',
  bank_transfer: 'Virement bancaire',
  cmi: 'Carte bancaire (CMI)',
};
const PAYMENT_ICON = { cod: Banknote, bank_transfer: Building2, cmi: CreditCard };

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();

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
  if (!order) return null;

  const fmt = (date) =>
    new Intl.DateTimeFormat('fr-MA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));

  const PIcon = PAYMENT_ICON[order.payment?.method] ?? Banknote;

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-line pb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1 mb-3"
          >
            <ArrowLeft size={12} strokeWidth={1.6} /> {t('common.back')}
          </button>
          <p className="num text-[11px] uppercase tracking-wider-2 text-ink-muted">
            #{order._id.slice(-6).toUpperCase()}
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-medium mt-1">
            Commande #{order._id.slice(-6).toUpperCase()}
          </h2>
          <p className="text-ink-muted text-xs mt-1">{fmt(order.createdAt)}</p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2">
          <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
            {t('admin.orders.status')}
          </p>
          <select
            value={order.status}
            onChange={(e) =>
              updateStatus.mutate({ id: order._id, status: e.target.value })
            }
            className={`tag border-0 ${TONES[order.status]} cursor-pointer focus:outline-none`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`account.orders.status.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        {/* Items + payment */}
        <div className="space-y-10">
          <section>
            <h3 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-4">Produits</h3>
            <ul className="divide-y divide-line border-y border-line">
              {order.items.map((item, i) => (
                <li key={i} className="py-4 flex items-start gap-4">
                  <div className="w-16 h-20 bg-chrome shrink-0">
                    {item.image && (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product}`}
                      className="font-medium leading-snug hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="text-[11px] uppercase tracking-wider-1 text-ink-muted mt-0.5">
                        {item.variant}
                      </p>
                    )}
                    <p className="text-xs text-ink-muted mt-1 num">
                      × {item.qty} · {formatPrice(item.price)} / unité
                    </p>
                  </div>
                  <span className="price text-sm whitespace-nowrap">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-4">Paiement</h3>
            <div className="border border-line p-5 flex items-start gap-3">
              <PIcon size={20} strokeWidth={1.5} className="text-ink shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">
                  {PAYMENT_LABEL[order.payment?.method] ?? order.payment?.method}
                </p>
                <p className="text-xs text-ink-muted mt-1 uppercase tracking-wider-1">
                  Statut : {order.payment?.status ?? 'pending'}
                </p>
                {order.payment?.transactionId && (
                  <p className="text-xs text-ink-muted mt-1 num">
                    Transaction : {order.payment.transactionId}
                  </p>
                )}
              </div>
            </div>
          </section>

          {order.notes && (
            <section>
              <h3 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-4">Notes du client</h3>
              <p className="border-s-2 border-ink/20 ps-4 text-sm text-ink-muted leading-relaxed">
                {order.notes}
              </p>
            </section>
          )}
        </div>

        {/* Customer + shipping + totals */}
        <aside className="space-y-8">
          <section>
            <h3 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-3">Client</h3>
            <div className="text-sm space-y-2">
              <p className="flex items-center gap-2">
                <UserIcon size={14} strokeWidth={1.4} className="text-ink-muted" />
                <span className="font-medium">
                  {order.user?.name ?? order.shipping?.name ?? '—'}
                </span>
                {!order.user && (
                  <span className="text-[10px] uppercase tracking-wider-1 text-ink-muted">
                    invité
                  </span>
                )}
              </p>
              {(order.user?.email || order.shipping?.email) && (
                <p className="flex items-center gap-2 text-ink-muted">
                  <Mail size={14} strokeWidth={1.4} />
                  <a
                    href={`mailto:${order.user?.email ?? order.shipping?.email}`}
                    className="link-underline text-ink hover:text-primary"
                  >
                    {order.user?.email ?? order.shipping?.email}
                  </a>
                </p>
              )}
              {order.shipping?.phone && (
                <p className="flex items-center gap-2 text-ink-muted">
                  <Phone size={14} strokeWidth={1.4} />
                  <a
                    href={`tel:${order.shipping.phone}`}
                    className="link-underline num text-ink hover:text-primary"
                  >
                    {order.shipping.phone}
                  </a>
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-3">Livraison</h3>
            <div className="text-sm space-y-1 leading-relaxed">
              <p className="flex items-start gap-2">
                <MapPin size={14} strokeWidth={1.4} className="text-ink-muted mt-0.5" />
                <span>
                  {order.shipping?.address}
                  <br />
                  {order.shipping?.city}
                  {order.shipping?.wilaya ? ` · ${order.shipping.wilaya}` : ''}
                </span>
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-3">Total</h3>
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
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Remise</dt>
                  <dd className="price text-signal">- {formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="border-t border-line pt-3 flex justify-between font-display text-lg">
                <dt>{t('cart.total')}</dt>
                <dd className="price">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
