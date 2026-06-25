import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatPrice } from '@/utils/formatPrice';

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const local = useLocalized();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const liked = useWishlistStore((s) => s.has(product._id ?? product.slug));

  const name = local(product.name);
  const img = product.images?.[0] || product.image;
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const displayPrice = hasVariants
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;

  const onWishlistClick = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search, gated: true } });
      return;
    }
    toggleWish(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[4/5] bg-gradient-to-b from-white to-chrome overflow-hidden rounded-lg ring-1 ring-line/60 group-hover:ring-ink/15 group-hover:shadow-lg transition-all duration-300"
      >
        {img ? (
          <img
            src={img}
            alt={name}
            loading="lazy"
            className="h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-muted/30">
            <svg viewBox="0 0 80 80" className="w-16 h-16" aria-hidden="true">
              <g stroke="currentColor" strokeWidth="1" fill="none">
                <circle cx="40" cy="40" r="28" />
                <circle cx="40" cy="40" r="14" />
                <path d="M40 12v56M12 40h56" strokeDasharray="2 4" />
              </g>
            </svg>
          </div>
        )}

        {/* Top tags */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {product.isPromo && (
            <span className="tag bg-ink text-paper">Promo</span>
          )}
          {product.isFeatured && !product.isPromo && (
            <span className="tag bg-paper text-ink shadow-line">Sélection</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={onWishlistClick}
          aria-label="wishlist"
          className="absolute top-3 end-3 grid place-items-center w-9 h-9 rounded-full bg-paper/90 backdrop-blur text-ink hover:bg-paper transition-colors"
        >
          <Heart size={15} strokeWidth={1.5} className={liked ? 'fill-ink' : ''} />
        </button>

        {/* Quick add - reveals on hover (desktop). For products with variants,
            send the user to the product page so they can pick a capacity. */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden md:block">
          {hasVariants ? (
            <Link
              to={`/product/${product.slug}`}
              className="block w-full text-center bg-ink text-paper text-xs uppercase tracking-wider-1 font-medium py-3 rounded-full hover:bg-primary transition-colors"
            >
              {t('product.select_capacity')}
            </Link>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
              className="w-full bg-ink text-paper text-xs uppercase tracking-wider-1 font-medium py-3 rounded-full hover:bg-primary transition-colors"
            >
              {t('product.add_to_cart')}
            </button>
          )}
        </div>
      </Link>

      <div className="pt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {product.brand && (
            <span className="text-[10px] uppercase tracking-wider-2 text-ink-muted">
              {product.brand}
            </span>
          )}
          <Link
            to={`/product/${product.slug}`}
            className="block font-medium text-sm leading-snug mt-0.5 truncate hover:text-primary"
          >
            {name}
          </Link>
        </div>
        <div className="text-end shrink-0">
          {hasVariants ? (
            <>
              <span className="block text-[10px] uppercase tracking-wider-1 text-ink-muted leading-none mb-0.5">
                {t('product.from')}
              </span>
              <span className="price text-sm">{formatPrice(displayPrice)}</span>
            </>
          ) : (
            <>
              <span className="price text-sm">{formatPrice(displayPrice)}</span>
              {product.priceOld && (
                <span className="block text-[11px] text-ink-muted line-through">
                  {formatPrice(product.priceOld)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
