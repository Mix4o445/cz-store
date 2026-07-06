import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clipboard, Download, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useScrapeProduct } from '@/hooks/useScraper';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatPrice';

const SAMPLE_URL = 'https://mtclim.ma/forane-/54-freon-forane-r134a.html';

export default function AdminScraper() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrape = useScrapeProduct();
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const onScrape = (e) => {
    e.preventDefault();
    setError('');
    setProduct(null);
    scrape.mutate(url, {
      onSuccess: (res) => setProduct(res?.data ?? res),
      onError: (err) => setError(getApiErrorMessage(err)),
    });
  };

  const onUseForNewProduct = () => {
    if (!product) return;
    // Hand the scraped product to AdminProducts via sessionStorage.
    sessionStorage.setItem('coolzone-scraped-draft', JSON.stringify(product));
    navigate('/admin/products');
  };

  const onDownload = () => {
    if (!product) return;
    const blob = new Blob([JSON.stringify(product, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${product.slug || 'scraped-product'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onCopyJson = async () => {
    if (!product) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(product, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <p className="eyebrow mb-3">{t('admin.scraper.eyebrow')}</p>
        <h2 className="font-display text-display-sm font-medium">
          {t('admin.scraper.title')}
        </h2>
        <p className="text-ink-muted text-sm mt-2 max-w-2xl">
          {t('admin.scraper.sub')}
        </p>
      </header>

      <form
        onSubmit={onScrape}
        className="border border-line rounded-2xl p-5 md:p-6 bg-paper space-y-4"
      >
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
            {t('admin.scraper.url_label')}
          </span>
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={SAMPLE_URL}
              spellCheck={false}
              className="flex-1 bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink font-mono text-sm"
            />
            <button
              type="submit"
              disabled={scrape.isPending || !url}
              className="btn-primary inline-flex items-center gap-2 justify-center shrink-0"
            >
              {scrape.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} strokeWidth={1.6} />
              )}
              {t('admin.scraper.scrape')}
            </button>
          </div>
          <span className="block mt-1 text-[11px] text-ink-muted">
            {t('admin.scraper.url_hint')}
          </span>
        </label>

        {error && (
          <p className="text-sm text-signal border-s-2 border-signal ps-3">{error}</p>
        )}
      </form>

      {product && (
        <section className="border border-line rounded-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-6 py-4 border-b border-line bg-chrome/40">
            <div>
              <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
                {t('admin.scraper.preview')}
              </p>
              <p className="font-display text-base font-medium mt-0.5 truncate max-w-md">
                {product.name?.fr || product.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCopyJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider-1 border border-line rounded-full text-ink hover:border-ink hover:bg-ink hover:text-paper transition-colors"
              >
                {copied ? '✓' : <Clipboard size={12} strokeWidth={1.6} />}
                {copied ? t('admin.scraper.copied') : t('admin.scraper.copy')}
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider-1 border border-line rounded-full text-ink hover:border-ink hover:bg-ink hover:text-paper transition-colors"
              >
                <Download size={12} strokeWidth={1.6} />
                {t('admin.scraper.download')}
              </button>
              <button
                type="button"
                onClick={onUseForNewProduct}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] uppercase tracking-wider-1 rounded-full bg-ink text-paper hover:bg-primary transition-colors"
              >
                {t('admin.scraper.use_for_new')}
                <ArrowRight size={12} strokeWidth={1.6} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-[180px_1fr] gap-5 md:gap-6 p-5 md:p-6">
            {product.images?.[0] && (
              <div className="bg-chrome rounded-xl overflow-hidden flex items-center justify-center aspect-square">
                <img
                  src={product.images[0]}
                  alt=""
                  className="w-full h-full object-contain p-3 mix-blend-multiply"
                />
              </div>
            )}

            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label={t('admin.scraper.field_brand')} value={product.brand} />
              <Row label={t('admin.scraper.field_price')} value={formatPrice(product.price || 0)} />
              {product.priceOld > 0 && (
                <Row label={t('admin.scraper.field_price_old')} value={formatPrice(product.priceOld)} />
              )}
              <Row label={t('admin.scraper.field_sku')} value={product.sku} mono />
              <Row label={t('admin.scraper.field_stock')} value={String(product.stock ?? 0)} />
              <Row label={t('admin.scraper.field_category')} value={product.category} />
              {product.variants?.length > 0 && (
                <Row
                  label={t('admin.scraper.field_variants')}
                  value={product.variants.map((v) => v.capacity).filter(Boolean).join(', ')}
                />
              )}
              <div className="sm:col-span-2">
                <dt className="text-[10px] uppercase tracking-wider-2 text-ink-muted">
                  {t('admin.scraper.field_description')}
                </dt>
                <dd
                  className={clsx(
                    'mt-1 text-ink-muted leading-relaxed',
                    !product.description?.fr && 'italic text-ink-muted/60'
                  )}
                >
                  {product.description?.fr || t('admin.scraper.no_description')}
                </dd>
              </div>
              {product.sourceUrl && (
                <div className="sm:col-span-2 pt-1">
                  <a
                    href={product.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
                  >
                    <ExternalLink size={11} strokeWidth={1.6} />
                    {product.sourceUrl}
                  </a>
                </div>
              )}
            </dl>
          </div>
        </section>
      )}

      {!scrape.isPending && !product && !error && (
        <div className="border border-dashed border-line rounded-2xl p-8 text-center text-sm text-ink-muted">
          {t('admin.scraper.placeholder')}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider-2 text-ink-muted">{label}</dt>
      <dd className={clsx('mt-0.5', mono && 'font-mono text-xs')}>
        {value || <span className="text-ink-muted/60 italic">—</span>}
      </dd>
    </div>
  );
}
