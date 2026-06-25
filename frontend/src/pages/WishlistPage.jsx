import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlistStore } from '@/store/wishlistStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatPrice } from '@/utils/formatPrice';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { t } = useTranslation();
  const local = useLocalized();
  const { items, toggle } = useWishlistStore();

  if (items.length === 0) {
    return (
      <section className="container-app py-24 text-center space-y-5">
        <Heart size={32} strokeWidth={1.4} className="mx-auto text-ink-muted" />
        <h1 className="font-display font-medium text-display-sm">{t('nav.wishlist')}</h1>
        <p className="text-ink-muted text-sm">{t('wishlist.empty')}</p>
        <Link to="/shop" className="btn-primary inline-flex">{t('nav.shop')}</Link>
      </section>
    );
  }

  return (
    <section className="container-app py-12 md:py-16">
      <header className="mb-10 border-b border-line pb-6">
        <p className="eyebrow mb-3">{t('wishlist.eyebrow')}</p>
        <h1 className="font-display font-medium text-display-md">{t('nav.wishlist')}.</h1>
      </header>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
        {items.map((p) => (
          <li key={p.id} className="group">
            <Link to={`/product/${p.slug}`} className="block aspect-[4/5] bg-chrome overflow-hidden">
              {p.image && (
                <img src={p.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              )}
            </Link>
            <div className="pt-4 flex items-start justify-between gap-3">
              <span className="font-medium text-sm leading-snug">{local(p.name)}</span>
              <div className="text-end shrink-0">
                <span className="price text-sm">{formatPrice(p.price)}</span>
                <button onClick={() => toggle(p)} className="block text-[11px] text-ink-muted hover:text-signal mt-1" aria-label={t('wishlist.remove')}>
                  {t('wishlist.remove')}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
