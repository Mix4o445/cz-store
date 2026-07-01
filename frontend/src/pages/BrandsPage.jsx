import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useBrands } from '@/hooks/useBrands';
import { useProductList } from '@/hooks/useProducts';
import Reveal from '@/components/common/Reveal';
import SEO, { absoluteUrl } from '@/components/common/SEO';

const BRAND_TINT = '#1d283a';

export default function BrandsPage() {
  const { t } = useTranslation();
  const { data: brands = [], isLoading } = useBrands();
  const { data: productsData } = useProductList({ limit: 1000 });

  const countsByBrand = useMemo(() => {
    const counts = {};
    for (const p of productsData?.items ?? []) {
      if (!p.brand) continue;
      counts[p.brand] = (counts[p.brand] ?? 0) + 1;
    }
    return counts;
  }, [productsData]);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Nos marques', item: absoluteUrl('/brands') },
    ],
  };

  return (
    <>
    <SEO
      title="Nos marques"
      description="CoolZone distribue les plus grandes marques de climatisation : Daikin, Gree, Midea, Carrier, CIAT, Ingelec, Samsung, LG, Mitsubishi. Garantie constructeur, livraison partout au Maroc."
      path="/brands"
      jsonLd={breadcrumbLd}
    />
    <section className="container-app py-16 md:py-24">
      <div className="grid md:grid-cols-12 gap-10 items-end mb-12 md:mb-16">
        <Reveal className="md:col-span-5">
          <p className="eyebrow mb-4">{t('brands.eyebrow')}</p>
          <h1 className="font-display font-medium text-display-md">
            {t('brands.title')}
          </h1>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-6 md:col-start-7">
          <p className="text-base text-ink-muted leading-relaxed">
            {t('brands.sub')}
          </p>
        </Reveal>
      </div>

      {isLoading && (
        <div className="grid place-items-center py-16 text-ink-muted">
          <Loader2 size={26} className="animate-spin" />
        </div>
      )}

      {!isLoading && brands.length === 0 && (
        <div className="border border-line p-12 text-center text-sm text-ink-muted">
          {t('brands.empty')}
        </div>
      )}

      {brands.length > 0 && (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-line border border-line">
          {brands.map((b, idx) => (
            <Reveal as="li" key={b._id ?? b.name} delay={idx * 0.05} y={16}>
              <Link
                to={`/shop?brand=${encodeURIComponent(b.name)}`}
                className="group relative bg-paper h-full flex flex-col justify-between min-h-[220px] p-6 md:p-8 transition-colors hover:bg-chrome"
              >
                <div className="flex items-start justify-between gap-3">
                  {b.logo ? (
                    <span
                      role="img"
                      aria-label={b.name}
                      className="block h-10 md:h-12 w-[150px] opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{
                        backgroundColor: BRAND_TINT,
                        WebkitMaskImage: `url("${b.logo}")`,
                        maskImage: `url("${b.logo}")`,
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                      }}
                    />
                  ) : (
                    <span
                      className="font-display text-3xl md:text-4xl font-medium whitespace-nowrap tracking-tight"
                      style={{ color: BRAND_TINT }}
                    >
                      {b.name}
                    </span>
                  )}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="num text-[11px] text-ink-muted">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {typeof countsByBrand[b.name] === 'number' && (
                      <span className="num text-[11px] text-ink-muted">
                        {t('brands.product_count', { count: countsByBrand[b.name] })}
                      </span>
                    )}
                  </div>
                </div>

                {b.description ? (
                  <p className="mt-6 text-sm text-ink-muted line-clamp-3">
                    {b.description}
                  </p>
                ) : (
                  <p className="mt-6 text-sm text-ink-muted/70 italic">
                    {t('brands.no_description')}
                  </p>
                )}

                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-ink group-hover:text-primary transition-colors">
                  {t('brands.explore')}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      )}
    </section>
    </>
  );
}
