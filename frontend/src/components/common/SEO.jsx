import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'CoolZone';
const DEFAULT_DESCRIPTION =
  'CoolZone : climatiseurs premium au Maroc. Split, multi-split, gainable et cassette des plus grandes marques. Prix en MAD, livraison rapide partout au Maroc.';
const DEFAULT_OG_IMAGE = '/og-cover.png';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://coolzone.ma').replace(/\/+$/, '');

/** Build an absolute URL from a path or pass-through for already-absolute URLs. */
export function absoluteUrl(maybePath) {
  if (!maybePath) return `${SITE_URL}/`;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  return `${SITE_URL}${maybePath.startsWith('/') ? maybePath : `/${maybePath}`}`;
}

/**
 * <SEO /> — sets title, meta description, canonical, Open Graph, Twitter card
 * and optional JSON-LD structured data for the current page. Designed to be
 * rendered inside a <HelmetProvider>.
 *
 * @param {string}  title           Page title (without the site suffix)
 * @param {string}  description     Meta description
 * @param {string}  [path]          Path on the site (e.g. "/shop"). Defaults
 *                                  to the current location. The component
 *                                  joins it with the configured SITE_URL.
 * @param {string}  [image]         Absolute or /-rooted image URL
 * @param {'website'|'product'|'article'} [type] og:type
 * @param {object|Array<object>} [jsonLd]  Schema.org objects to emit as
 *                                  application/ld+json
 * @param {boolean} [noindex]       When true, emits noindex,nofollow
 * @param {string}  [lang]          hreflang (defaults to "fr-MA")
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  jsonLd,
  noindex = false,
  lang = 'fr-MA',
}) {
  const { pathname, search } = useLocation();
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Climatiseurs premium au Maroc`;
  const url = absoluteUrl(path ?? `${pathname}${search ?? ''}`);
  const img = absoluteUrl(image);

  return (
    <Helmet>
      <html lang="fr" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Robots */}
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow, noarchive, nosnippet'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* hreflang */}
      <link rel="alternate" hreflang={lang} href={url} />
      <link rel="alternate" hreflang="x-default" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="fr_MA" />
      <meta property="og:locale:alternate" content="ar_MA" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
}
