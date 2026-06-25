import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Banknote, Building2, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useEnrichedCart } from '@/hooks/useEnrichedCart';
import { useAddresses } from '@/hooks/useUser';
import { useCreateOrder } from '@/hooks/useOrders';
import { useLocalized } from '@/hooks/useLocalized';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatPrice';

const inputCls =
  'mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink';

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{label}</span>
      <div>{children}</div>
      {hint && <span className="block mt-1 text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}

function PaymentOption({ id, value, current, onChange, icon: Icon, title, sub, children }) {
  const active = current === value;
  return (
    <label
      htmlFor={id}
      className={clsx(
        'block border p-5 cursor-pointer transition-colors',
        active ? 'border-ink bg-ink/5' : 'border-line hover:border-ink/40'
      )}
    >
      <div className="flex items-start gap-4">
        <input
          id={id}
          type="radio"
          name="payment"
          value={value}
          checked={active}
          onChange={() => onChange(value)}
          className="mt-1.5 accent-ink w-4 h-4"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon size={18} strokeWidth={1.6} className="text-ink-muted" />
            <p className="font-medium">{title}</p>
          </div>
          <p className="text-sm text-ink-muted mt-1 leading-relaxed">{sub}</p>
          {active && children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </label>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const local = useLocalized();
  const user = useAuthStore((s) => s.user);
  const { items, clearCart } = useCartStore();
  const { items: enriched, subtotal, shipping: shippingCost, total } = useEnrichedCart();
  const { data: addresses = [] } = useAddresses();
  const createOrder = useCreateOrder();

  const [shipping, setShipping] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    address: '',
    city: '',
    wilaya: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const onChange = (e) => setShipping((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Auto-select default address on first load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (def) {
        setSelectedAddressId(def._id);
        setShipping((f) => ({
          ...f,
          name: def.name || f.name,
          phone: def.phone || f.phone,
          address: def.address || '',
          city: def.city || '',
          wilaya: def.wilaya || '',
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.length]);

  const pickAddress = (id) => {
    setSelectedAddressId(id);
    if (!id) return;
    const addr = addresses.find((a) => a._id === id);
    if (!addr) return;
    setShipping((f) => ({
      ...f,
      name: addr.name || f.name,
      phone: addr.phone || f.phone,
      address: addr.address || '',
      city: addr.city || '',
      wilaya: addr.wilaya || '',
    }));
  };

  const totalQty = useMemo(() => enriched.reduce((s, i) => s + i.qty, 0), [enriched]);

  if (items.length === 0) {
    return (
      <section className="container-app py-24 text-center space-y-5 max-w-md">
        <h1 className="font-display font-medium text-display-sm">{t('checkout.empty_cart')}</h1>
        <Link to="/shop" className="btn-primary inline-flex">
          {t('checkout.browse_shop')}
        </Link>
      </section>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();

    // Old cart entries (added before the variants update) may not carry a
    // `productId` field. Derive it from `id` as a fallback ("baseId::variantKey").
    const payloadItems = items
      .map((i) => {
        const productId =
          i.productId ||
          (typeof i.id === 'string' ? i.id.split('::')[0] : null);
        if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) return null;
        return {
          product: productId,
          qty: i.qty,
          ...(i.variant?._id ? { variantId: i.variant._id } : {}),
        };
      })
      .filter(Boolean);

    if (payloadItems.length === 0) {
      window.alert(t('checkout.cart_invalid'));
      clearCart();
      return;
    }

    createOrder.mutate(
      {
        items: payloadItems,
        shipping,
        payment: { method: paymentMethod },
        notes,
      },
      {
        onSuccess: (order) => {
          clearCart();
          navigate(`/orders/${order._id}`, { replace: true });
        },
      }
    );
  };

  return (
    <section className="container-app py-12 md:py-16">
      <header className="mb-10 border-b border-line pb-6">
        <p className="eyebrow mb-3">{t('checkout.eyebrow')}</p>
        <h1 className="font-display font-medium text-display-md">{t('checkout.title')}</h1>
      </header>

      <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-16">
        {/* Form */}
        <div className="space-y-12">
          {/* Shipping */}
          <section>
            <h2 className="font-display text-xl font-medium mb-5">{t('checkout.step_shipping')}</h2>

            {addresses.length > 0 && (
              <div className="mb-6">
                <Field label={t('checkout.use_saved_address')}>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => pickAddress(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">{t('checkout.manual_address')}</option>
                    {addresses.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.label ? `${a.label} · ` : ''}
                        {a.address}, {a.city}
                        {a.isDefault ? ` (${t('checkout.address_default')})` : ''}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label={t('checkout.form_name')}>
                <input
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  value={shipping.name}
                  onChange={onChange}
                  className={inputCls}
                />
              </Field>
              <Field label={t('checkout.form_phone')}>
                <input
                  name="phone"
                  type="tel"
                  required
                  minLength={6}
                  value={shipping.phone}
                  onChange={onChange}
                  className={inputCls}
                />
              </Field>
              <Field label={t('checkout.form_email')}>
                <input
                  name="email"
                  type="email"
                  value={shipping.email}
                  onChange={onChange}
                  className={inputCls}
                />
              </Field>
              <Field label={t('checkout.form_city')}>
                <input
                  name="city"
                  type="text"
                  required
                  minLength={2}
                  value={shipping.city}
                  onChange={onChange}
                  className={inputCls}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t('checkout.form_address')}>
                  <input
                    name="address"
                    type="text"
                    required
                    minLength={3}
                    value={shipping.address}
                    onChange={onChange}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label={t('checkout.form_wilaya')}>
                <input
                  name="wilaya"
                  type="text"
                  value={shipping.wilaya}
                  onChange={onChange}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label={t('checkout.form_notes')}>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('checkout.form_notes_placeholder')}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-display text-xl font-medium mb-5">{t('payment.title')}</h2>
            <div className="space-y-3">
              <PaymentOption
                id="pm-cod"
                value="cod"
                current={paymentMethod}
                onChange={setPaymentMethod}
                icon={Banknote}
                title={t('payment.cod_title')}
                sub={t('payment.cod_sub')}
              />
              <PaymentOption
                id="pm-bank"
                value="bank_transfer"
                current={paymentMethod}
                onChange={setPaymentMethod}
                icon={Building2}
                title={t('payment.bank_title')}
                sub={t('payment.bank_sub')}
              >
                <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 text-sm pt-3 border-t border-line">
                  <dt className="text-ink-muted">{t('payment.bank_holder')}</dt>
                  <dd className="font-medium">{t('payment.bank_holder_value')}</dd>
                  <dt className="text-ink-muted">{t('payment.bank_iban')}</dt>
                  <dd className="num font-medium">{t('payment.bank_iban_value')}</dd>
                  <dt className="text-ink-muted">{t('payment.bank_swift')}</dt>
                  <dd className="num font-medium">{t('payment.bank_swift_value')}</dd>
                </dl>
              </PaymentOption>
            </div>
          </section>

          {createOrder.isError && (
            <p className="text-sm text-signal border-s-2 border-signal ps-3">
              {getApiErrorMessage(createOrder.error)}
            </p>
          )}

          <div className="lg:hidden">
            <button
              type="submit"
              disabled={createOrder.isPending}
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              {createOrder.isPending && <Loader2 size={14} className="animate-spin" />}
              {t('checkout.submit')}
            </button>
          </div>
        </div>

        {/* Summary aside */}
        <aside className="border-t border-line lg:border-t-0 lg:border-s lg:ps-10 pt-8 lg:pt-0 h-fit lg:sticky lg:top-24 space-y-5">
          <h2 className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
            {t('cart.summary')}
          </h2>
          <ul className="divide-y divide-line">
            {enriched.map((item) => (
              <li key={item.id} className="py-3 flex items-start gap-3">
                <div className="w-12 h-14 bg-chrome shrink-0">
                  {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <p className="font-medium leading-snug truncate">{local(item.name)}</p>
                  {item.variant?.capacity && (
                    <p className="text-[11px] uppercase tracking-wider-1 text-ink-muted mt-0.5">
                      {item.variant.capacity}
                    </p>
                  )}
                  <p className="text-[11px] text-ink-muted mt-1">× {item.qty}</p>
                </div>
                <span className="price text-sm whitespace-nowrap">
                  {formatPrice((item.price ?? 0) * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-3 text-sm border-t border-line pt-4">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t('cart.subtotal')}</dt>
              <dd className="price">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t('cart.shipping')}</dt>
              <dd className="text-ink">{t('cart.shipping_negotiate')}</dd>
            </div>
            <div className="border-t border-line pt-3 flex justify-between font-display text-lg">
              <dt>{t('cart.total')}</dt>
              <dd className="price">{formatPrice(subtotal)}</dd>
            </div>
          </dl>

          <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
            {t('checkout.items_count', { count: totalQty })}
          </p>

          <button
            type="submit"
            disabled={createOrder.isPending}
            className="btn-primary w-full hidden lg:inline-flex items-center justify-center gap-2"
          >
            {createOrder.isPending && <Loader2 size={14} className="animate-spin" />}
            {t('checkout.submit')}
          </button>
        </aside>
      </form>
    </section>
  );
}
