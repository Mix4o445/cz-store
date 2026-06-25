import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useEnrichedCart } from '@/hooks/useEnrichedCart';
import { useLocalized } from '@/hooks/useLocalized';
import { formatPrice } from '@/utils/formatPrice';

export default function CartPage() {
  const { t } = useTranslation();
  const local = useLocalized();
  const { items, updateQty, removeItem } = useCartStore();
  const { items: enriched, subtotal, shipping, total } = useEnrichedCart();

  if (items.length === 0) {
    return (
      <section className="container-app py-24 text-center space-y-6">
        <ShoppingBag size={32} strokeWidth={1.4} className="mx-auto text-ink-muted" />
        <h1 className="font-display font-medium text-display-sm">{t('cart.empty')}</h1>
        <Link to="/shop" className="btn-primary inline-flex">{t('cart.empty_cta')}</Link>
      </section>
    );
  }

  return (
    <section className="container-app py-12 md:py-16 grid lg:grid-cols-[1fr_380px] gap-10">
      <div>
        <header className="mb-8 border-b border-line pb-6">
          <p className="eyebrow mb-3">{t('cart.title')}</p>
          <h1 className="font-display font-medium text-display-md">{t('cart.title')}.</h1>
        </header>
        <ul className="divide-y divide-line">
          {enriched.map((item) => (
            <li key={item.id} className="py-6 flex gap-5">
              <div className="w-24 h-28 bg-chrome shrink-0">
                {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <Link to={`/product/${item.slug}`} className="font-medium leading-snug hover:text-primary">
                    {local(item.name)}
                  </Link>
                  {item.variant?.capacity && (
                    <p className="text-[11px] uppercase tracking-wider-1 text-ink-muted mt-1">
                      {item.variant.capacity}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 mt-auto">
                  <div className="inline-flex items-center border border-line rounded-full">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-3 py-1.5 hover:bg-chrome rounded-full" aria-label="-">
                      <Minus size={13} />
                    </button>
                    <span className="px-3 text-sm num">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-3 py-1.5 hover:bg-chrome rounded-full" aria-label="+">
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="price">{formatPrice((item.price ?? 0) * item.qty)}</span>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-ink-muted hover:text-signal" aria-label={t('cart.remove')}>
                    <Trash2 size={15} strokeWidth={1.4} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="border-t border-line lg:border-t-0 lg:border-s lg:ps-10 pt-8 lg:pt-0 h-fit lg:sticky lg:top-24 space-y-5">
        <h2 className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('cart.summary')}</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">{t('cart.subtotal')}</dt>
            <dd className="price">{formatPrice(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">{t('cart.shipping')}</dt>
            <dd className="price">{shipping === 0 ? t('cart.free') : formatPrice(shipping)}</dd>
          </div>
          <div className="border-t border-line pt-3 flex justify-between font-display text-lg">
            <dt>{t('cart.total')}</dt>
            <dd className="price">{formatPrice(total + shipping)}</dd>
          </div>
        </dl>
        <Link to="/checkout" className="btn-primary w-full">{t('cart.checkout')}</Link>
        <Link to="/shop" className="btn-ghost w-full text-xs">{t('cart.continue')}</Link>
      </aside>
    </section>
  );
}
