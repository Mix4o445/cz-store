import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import Reveal from '@/components/common/Reveal';
import { useProductList } from '@/hooks/useProducts';
import { getApiErrorMessage } from '@/hooks/useAuth';

export default function PopularProducts() {
  const { t } = useTranslation();
  // Popular = best-rated products. Cap the preview at 6 on the home page.
  const { data, isLoading, isError, error, refetch } = useProductList({
    sort: '-rating',
    limit: 6,
  });
  const products = (data?.items ?? []).slice(0, 6);

  const trackRef = useRef(null);

  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll by roughly one card width (first child) including the gap.
    const card = el.querySelector('[data-slide]');
    const amount = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section className="section">
      <div className="container-app">
        <div className="grid md:grid-cols-12 gap-6 md:gap-8 mb-10 md:mb-14 items-end">
          <Reveal className="md:col-span-7">
            <p className="eyebrow mb-4">{t('home.popular_eyebrow')}</p>
            <h2 className="font-display font-medium text-display-md">{t('home.popular_title')}</h2>
            <p className="mt-4 text-base text-ink-muted max-w-md">{t('home.popular_sub')}</p>
          </Reveal>

          <Reveal delay={0.15} className="md:col-span-4 md:col-start-9 md:justify-self-end flex items-center gap-3">
            {/* Slider controls (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label={t('common.back')}
                className="grid place-items-center w-10 h-10 rounded-full border border-line text-ink hover:border-ink transition-colors"
              >
                <ChevronLeft size={16} className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label={t('common.more')}
                className="grid place-items-center w-10 h-10 rounded-full border border-line text-ink hover:border-ink transition-colors"
              >
                <ChevronRight size={16} className="rtl:rotate-180" />
              </button>
            </div>
          </Reveal>
        </div>

        {isLoading && (
          <div className="grid place-items-center py-16 text-ink-muted">
            <Loader2 size={26} className="animate-spin" />
          </div>
        )}

        {isError && (
          <div className="border border-line p-8 text-center text-sm">
            <p className="text-signal mb-3">{getApiErrorMessage(error, t('common.error'))}</p>
            <button onClick={() => refetch()} className="btn-outline">
              {t('common.retry')}
            </button>
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <>
            <div
              ref={trackRef}
              className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-2"
            >
              {products.map((p) => (
                <div
                  key={p._id ?? p.slug}
                  data-slide
                  className="snap-start shrink-0 w-[70%] sm:w-[45%] md:w-[31%] lg:w-[23.5%]"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 border border-ink/20 rounded-full px-6 py-3 text-sm font-medium text-ink hover:border-ink hover:bg-ink hover:text-paper transition-colors"
              >
                {t('home.popular_more')}
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
