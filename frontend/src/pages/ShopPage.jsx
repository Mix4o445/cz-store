import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import { useProductList } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { useLocalized } from '@/hooks/useLocalized';
import { getApiErrorMessage } from '@/hooks/useAuth';

const SORT_MAP = {
  new: '-createdAt',
  'price-asc': 'price',
  'price-desc': '-price',
  rating: '-rating',
};

// Build a compact page list with ellipses, e.g. [1, '…', 4, 5, 6, '…', 12]
function getPageRange(current, total) {
  const delta = 1;
  const range = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('…');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('…');
  if (total > 1) range.push(total);

  return range;
}

export default function ShopPage() {
  const { t } = useTranslation();
  const local = useLocalized();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('new');
  const [page, setPage] = useState(1);

  const brand = params.get('brand') ?? '';
  const category = params.get('category') ?? '';
  const promo = params.get('promo') ?? '';
  const featured = params.get('featured') ?? '';

  const PAGE_SIZE = 24;

  // Reset to first page whenever filters or sort change.
  useEffect(() => {
    setPage(1);
  }, [brand, category, promo, featured, sort]);

  const queryParams = {
    sort: SORT_MAP[sort] ?? '-createdAt',
    ...(brand && { brand }),
    ...(category && { category }),
    ...(promo && { promo }),
    ...(featured && { featured }),
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, error, refetch } = useProductList(queryParams);
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goToPage = (next) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    if (clamped === page) return;
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filterBtn = (active, label, onClick) => (
    <button
      onClick={onClick}
      className={`text-start transition-colors ${active ? 'text-ink font-medium' : 'text-ink/60 hover:text-ink'}`}
    >
      {label}
    </button>
  );

  const showSidebar = categories.length > 0 || brands.length > 0;

  return (
    <section className="container-app py-12 md:py-16">
      <header className="mb-10 grid md:grid-cols-12 gap-6 items-end border-b border-line pb-8">
        <div className="md:col-span-7">
          <p className="eyebrow mb-3">{t('shop.eyebrow')}</p>
          <h1 className="font-display font-medium text-display-md">{t('shop.title')}</h1>
          <p className="text-sm text-ink-muted mt-3">
            {isLoading ? t('common.loading') : t('shop.count', { count: total })}
          </p>
        </div>
        <div className="md:col-span-3 md:col-start-10 md:justify-self-end">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border-b border-ink/20 px-1 py-2 text-sm focus:border-ink outline-none"
          >
            <option value="new">{t('shop.sort_new')}</option>
            <option value="price-asc">{t('shop.sort_price_asc')}</option>
            <option value="price-desc">{t('shop.sort_price_desc')}</option>
            <option value="rating">{t('shop.sort_rating')}</option>
          </select>
        </div>
      </header>

      <div className={`grid gap-12 ${showSidebar ? 'lg:grid-cols-[220px_1fr]' : ''}`}>
        {showSidebar && (
          <aside className="hidden lg:block h-fit sticky top-24 space-y-8">
            {categories.length > 0 && (
              <div>
                <h3 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-4">
                  {t('shop.filter_categories')}
                </h3>
                <ul className="space-y-1.5 text-sm">
                  <li>{filterBtn(!category, t('shop.filter_all'), () => updateParam('category', ''))}</li>
                  {categories.map((c) => (
                    <li key={c._id}>
                      {filterBtn(category === c.slug, local(c.name), () =>
                        updateParam('category', c.slug)
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {brands.length > 0 && (
              <div>
                <h3 className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-4">
                  {t('shop.filter_brands')}
                </h3>
                <ul className="space-y-1.5 text-sm">
                  <li>{filterBtn(!brand, t('shop.filter_all'), () => updateParam('brand', ''))}</li>
                  {brands.map((b) => (
                    <li key={b._id}>
                      {filterBtn(brand === b.name, b.name, () => updateParam('brand', b.name))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}

        <div>
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
            <div className="border border-line p-12 text-center text-ink-muted">
              <p className="text-base">{t('shop.empty_title')}</p>
              <p className="text-sm mt-1">{t('shop.empty_hint')}</p>
            </div>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <>
              <ProductGrid products={products} />

              {totalPages > 1 && (
                <nav
                  aria-label="pagination"
                  className="mt-14 flex items-center justify-center gap-1.5"
                >
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    aria-label={t('shop.page_prev')}
                    className="grid place-items-center w-10 h-10 rounded-full border border-line text-ink hover:border-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} className="rtl:rotate-180" />
                  </button>

                  {getPageRange(page, totalPages).map((p, i) =>
                    p === '…' ? (
                      <span
                        key={`gap-${i}`}
                        className="grid place-items-center w-10 h-10 text-ink-muted text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        aria-current={p === page ? 'page' : undefined}
                        className={`grid place-items-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-ink text-paper'
                            : 'text-ink/70 hover:bg-chrome'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    aria-label={t('shop.page_next')}
                    className="grid place-items-center w-10 h-10 rounded-full border border-line text-ink hover:border-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} className="rtl:rotate-180" />
                  </button>
                </nav>
              )}

              {totalPages > 1 && (
                <p className="mt-4 text-center text-xs text-ink-muted">
                  {t('shop.page_info', { page, pages: totalPages })}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
