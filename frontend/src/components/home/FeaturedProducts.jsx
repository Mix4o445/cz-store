import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import ProductGrid from '../product/ProductGrid';
import Reveal from '@/components/common/Reveal';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { getApiErrorMessage } from '@/hooks/useAuth';

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const { data: products = [], isLoading, isError, error, refetch } = useFeaturedProducts();

  return (
    <section className="section">
      <div className="container-app">
        <div className="grid md:grid-cols-12 gap-6 md:gap-8 mb-12 md:mb-16 items-end">
          <Reveal className="md:col-span-7">
            <p className="eyebrow mb-4">{t('home.featured_eyebrow')}</p>
            <h2 className="font-display font-medium text-display-md">
              {t('home.featured_title')}
            </h2>
            <p className="mt-4 text-base text-ink-muted max-w-md">{t('home.featured_sub')}</p>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-3 md:col-start-10 md:justify-self-end">
            <Link
              to="/shop"
              className="link-underline text-sm font-medium text-ink whitespace-nowrap"
            >
              {t('common.more')}
              <ArrowUpRight size={14} />
            </Link>
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

        {!isLoading && !isError && products.length === 0 && (
          <div className="border border-line p-12 text-center text-ink-muted text-sm">
            Aucun produit en vedette pour le moment.
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && <ProductGrid products={products} />}
      </div>
    </section>
  );
}
