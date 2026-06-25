import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Loader2, ShieldCheck, Truck, Wifi, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useProductBySlug } from '@/hooks/useProducts';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { useLocalized } from '@/hooks/useLocalized';
import { formatPrice } from '@/utils/formatPrice';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import RatingStars from '@/components/common/RatingStars';
import Badge from '@/components/common/Badge';
import ProductReviews from '@/components/product/ProductReviews';

function ProductPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-ink-muted/30">
      <svg viewBox="0 0 80 80" className="w-24 h-24" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <circle cx="40" cy="40" r="28" />
          <circle cx="40" cy="40" r="14" />
          <path d="M40 12v56M12 40h56" strokeDasharray="2 4" />
        </g>
      </svg>
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const local = useLocalized();
  const { data: product, isLoading, isError, error, refetch } = useProductBySlug(slug);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const onWishlistClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search, gated: true } });
      return;
    }
    toggleWish(product);
  };

  const variants = useMemo(() => product?.variants ?? [], [product]);
  const [variantIdx, setVariantIdx] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [activeModel, setActiveModel] = useState('');

  // Distinct variant models (e.g. "On/Off", "Inverter"), in first-seen order.
  const models = useMemo(() => {
    const seen = [];
    for (const v of variants) {
      const m = v.model || '';
      if (!seen.includes(m)) seen.push(m);
    }
    return seen;
  }, [variants]);
  const showModelTabs = models.length > 1;

  // Reset variant selection when product changes
  useEffect(() => {
    setVariantIdx(0);
    setActiveImage(0);
    setActiveModel(variants[0]?.model || '');
  }, [product?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectModel = (m) => {
    setActiveModel(m);
    const firstIdx = variants.findIndex((v) => (v.model || '') === m);
    if (firstIdx >= 0) setVariantIdx(firstIdx);
  };

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
        <button onClick={() => refetch()} className="btn-outline">{t('common.retry')}</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-app py-24 text-center space-y-4">
        <h1 className="font-display text-display-sm">{t('product.not_found')}</h1>
        <Link to="/shop" className="btn-primary">{t('nav.shop')}</Link>
      </div>
    );
  }

  const name = local(product.name);
  const hasVariants = variants.length > 0;
  const images = (product.images ?? []).filter(Boolean);
  const hasGallery = images.length > 1;
  const mainImage = images[activeImage] ?? images[0];
  const currentVariant = hasVariants ? variants[variantIdx] : null;
  const displayPrice = currentVariant?.price ?? product.price;
  const displayPriceOld = currentVariant?.priceOld ?? product.priceOld;
  const displayStock = currentVariant?.stock ?? product.stock;

  const onAddToCart = () => {
    if (hasVariants && currentVariant) {
      addItem(product, 1, { ...currentVariant, idx: variantIdx });
    } else {
      addItem(product);
    }
  };

  return (
    <>
      <section className="container-app py-12 md:py-16 grid md:grid-cols-2 gap-10 md:gap-16">
        <div className="md:sticky md:top-24 h-fit space-y-4">
          <div className="relative bg-gradient-to-b from-white to-chrome aspect-[4/5] overflow-hidden rounded-xl ring-1 ring-line">
            {product.isPromo && (
              <span className="absolute top-4 start-4 z-10 tag bg-ink text-paper">
                {t('product.promo')}
              </span>
            )}
            {mainImage ? (
              <img
                src={mainImage}
                alt={name}
                className="w-full h-full object-contain p-6 md:p-10 mix-blend-multiply"
              />
            ) : (
              <ProductPlaceholder />
            )}
          </div>

          {hasGallery && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`${name} ${i + 1}`}
                  aria-current={i === activeImage}
                  className={clsx(
                    'relative aspect-square overflow-hidden rounded-lg bg-gradient-to-b from-white to-chrome ring-1 transition-all',
                    i === activeImage
                      ? 'ring-2 ring-ink'
                      : 'ring-line hover:ring-ink/40'
                  )}
                >
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="w-full h-full object-contain p-2 mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            {product.brand && (
              <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{product.brand}</span>
            )}
          </div>

          <h1 className="font-display font-medium text-display-sm md:text-display-md">{name}</h1>

          <a
            href="#reviews"
            className="inline-flex items-center gap-3 group"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <RatingStars value={product.rating ?? 0} />
            <span className="text-xs text-ink-muted group-hover:text-ink transition-colors">
              {t('reviews.count', { count: product.numReviews ?? 0 })}
            </span>
          </a>

        <div className="flex items-baseline gap-3">
          <span className="price text-3xl md:text-4xl">{formatPrice(displayPrice)}</span>
          {displayPriceOld && (
            <span className="text-ink-muted line-through">{formatPrice(displayPriceOld)}</span>
          )}
        </div>

        <p className="text-sm">
          <Badge tone={displayStock > 0 ? 'soft' : 'signal'}>
            {displayStock > 0 ? t('product.in_stock') : t('product.out_of_stock')}
          </Badge>
        </p>

        {/* Capacity / variant selector */}
        {hasVariants && (
          <div className="space-y-4 pt-2">
            {/* Model tabs (e.g. On/Off vs Inverter) */}
            {showModelTabs && (
              <div className="inline-flex flex-wrap gap-1 rounded-full border border-line p-1">
                {models.map((m) => (
                  <button
                    key={m || 'standard'}
                    type="button"
                    onClick={() => selectModel(m)}
                    className={clsx(
                      'px-5 py-2 rounded-full text-sm font-medium transition-colors',
                      activeModel === m
                        ? 'bg-ink text-paper'
                        : 'text-ink/60 hover:text-ink'
                    )}
                  >
                    {m || t('product.standard')}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
                {t('product.capacity_label')}
              </p>
              <p className="text-[11px] text-ink-muted">
                {[currentVariant?.capacity, currentVariant?.model].filter(Boolean).join(' · ')}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {variants
                .map((v, i) => ({ v, i }))
                .filter(({ v }) => (v.model || '') === activeModel)
                .map(({ v, i }) => {
                  const active = i === variantIdx;
                  const out = (v.stock ?? 0) <= 0;
                  return (
                    <button
                      key={v._id ?? i}
                      type="button"
                      onClick={() => setVariantIdx(i)}
                      className={clsx(
                        'group relative px-4 py-2.5 border text-sm font-medium transition-all text-center',
                        active
                          ? 'border-ink bg-ink text-paper'
                          : 'border-line text-ink hover:border-ink/40',
                        out && 'opacity-50'
                      )}
                    >
                      <span className="block">{v.capacity}</span>
                      <span
                        className={clsx(
                          'block text-[10px] mt-0.5 num',
                          active ? 'text-paper/70' : 'text-ink-muted'
                        )}
                      >
                        {formatPrice(v.price)}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {product.description && local(product.description) && (
          <p className="text-base text-ink-muted leading-relaxed">{local(product.description)}</p>
        )}

        <ul className="grid grid-cols-2 gap-y-4 gap-x-6 pt-2 text-sm border-t border-line pt-6">
          {product.specs?.capacity && !hasVariants && (
            <li className="flex items-center gap-3">
              <Zap size={16} strokeWidth={1.4} className="text-ink-muted" />
              <span className="num">{product.specs.capacity}</span>
            </li>
          )}
          {product.specs?.energyClass && (
            <li className="flex items-center gap-3">
              <span className="num font-bold text-ink">{product.specs.energyClass}</span>
              <span className="text-ink-muted text-xs uppercase tracking-wider-1">{t('product.energy_class')}</span>
            </li>
          )}
          {product.specs?.coverage && (
            <li className="flex items-center gap-3 text-ink-muted">
              <span className="num text-ink">{product.specs.coverage}</span>
              <span className="text-xs uppercase tracking-wider-1">{t('product.coverage')}</span>
            </li>
          )}
          {product.specs?.warranty && (
            <li className="flex items-center gap-3">
              <ShieldCheck size={16} strokeWidth={1.4} className="text-ink-muted" />
              <span>{product.specs.warranty}</span>
            </li>
          )}
          {product.specs?.wifi && (
            <li className="flex items-center gap-3">
              <Wifi size={16} strokeWidth={1.4} className="text-ink-muted" />
              <span>Wi-Fi</span>
            </li>
          )}
          {product.specs?.inverter && (
            <li className="flex items-center gap-3">
              <span className="text-ink-muted text-xs uppercase tracking-wider-1">{t('product.inverter')}</span>
            </li>
          )}
        </ul>

        <div className="flex flex-wrap gap-3 pt-4">
          <button
            onClick={onAddToCart}
            className="btn-primary flex-1"
            disabled={displayStock <= 0}
          >
            {t('product.add_to_cart')}
          </button>
            <button
              onClick={onWishlistClick}
              className="btn-outline w-12 px-0"
              aria-label={t('product.add_to_wishlist')}
            >
              <Heart size={16} strokeWidth={1.5} />
            </button>
        </div>

          <ul className="pt-4 space-y-2 text-xs uppercase tracking-wider-1 text-ink-muted border-t border-line pt-6">
            <li className="flex items-center gap-2"><Truck size={13} strokeWidth={1.4} /> {t('product.delivery_hint')}</li>
            <li className="flex items-center gap-2"><ShieldCheck size={13} strokeWidth={1.4} /> {t('product.warranty_hint')}</li>
          </ul>
        </div>
      </section>

      <ProductReviews productId={product._id} />
    </>
  );
}
