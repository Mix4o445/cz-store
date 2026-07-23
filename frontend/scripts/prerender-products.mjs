import { config as loadEnv } from 'dotenv';
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  asList,
  fetchApi,
  htmlEscape,
  normalizeSiteUrl,
} from './seo-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
loadEnv({ path: resolve(ROOT, '.env') });

const SITE_URL = normalizeSiteUrl(process.env.VITE_SITE_URL);
const shellPath = resolve(DIST, 'index.html');

function localText(value) {
  if (typeof value === 'string') return value.trim();
  return String(value?.fr || value?.ar || '').trim();
}

function cleanDescription(value, fallback) {
  const text = localText(value).replace(/\s+/g, ' ').trim() || fallback;
  if (text.length <= 160) return text;
  const clipped = text.slice(0, 157);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 120 ? lastSpace : 157).trimEnd()}…`;
}

function positivePrice(product) {
  const values = [
    Number(product.price),
    ...(product.variants ?? []).map((variant) => Number(variant.price)),
  ].filter((value) => Number.isFinite(value) && value > 0);
  return values.length ? Math.min(...values) : null;
}

function formatPrice(value) {
  if (!value) return '';
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(value);
}

function replaceTag(html, pattern, replacement) {
  return html.replace(pattern, () => replacement);
}

function setPageMeta(html, {
  title,
  description,
  url,
  image,
  type = 'website',
}) {
  let output = html;
  output = replaceTag(output, /<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(title)}</title>`);
  output = replaceTag(
    output,
    /<meta\s+name="description"[\s\S]*?\/>/i,
    `<meta name="description" content="${htmlEscape(description)}" />`
  );
  output = replaceTag(
    output,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${htmlEscape(url)}" />`
  );
  output = replaceTag(
    output,
    /<link\s+rel="alternate"\s+hreflang="fr-MA"[^>]*>/i,
    `<link rel="alternate" hreflang="fr-MA" href="${htmlEscape(url)}" />`
  );
  output = replaceTag(
    output,
    /<link\s+rel="alternate"\s+hreflang="x-default"[^>]*>/i,
    `<link rel="alternate" hreflang="x-default" href="${htmlEscape(url)}" />`
  );
  output = replaceTag(output, /<meta\s+property="og:type"[^>]*>/i, `<meta property="og:type" content="${type}" />`);
  output = replaceTag(output, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${htmlEscape(title)}" />`);
  output = replaceTag(output, /<meta\s+property="og:description"[\s\S]*?\/>/i, `<meta property="og:description" content="${htmlEscape(description)}" />`);
  output = replaceTag(output, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${htmlEscape(url)}" />`);
  output = replaceTag(output, /<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${htmlEscape(image)}" />`);
  output = replaceTag(output, /<meta\s+property="og:image:alt"[^>]*>/i, `<meta property="og:image:alt" content="${htmlEscape(title)}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${htmlEscape(title)}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:description"[\s\S]*?\/>/i, `<meta name="twitter:description" content="${htmlEscape(description)}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${htmlEscape(image)}" />`);
  return output;
}

function injectHead(html, content) {
  return html.replace('</head>', `${content}\n  </head>`);
}

function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function productJsonLd(product, name, description, url, image, price) {
  const inStock = Number(product.stock ?? 0) > 0 ||
    (product.variants ?? []).some((variant) => Number(variant.stock ?? 0) > 0);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: (product.images ?? []).filter(Boolean).length
      ? (product.images ?? []).filter(Boolean)
      : [image],
    sku: product._id,
    url,
    brand: product.brand
      ? { '@type': 'Brand', name: product.brand }
      : undefined,
  };
  if (price && !product.contactOnly) {
    data.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: 'MAD',
      price,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'CoolZone' },
    };
  }
  if (product.rating && product.numReviews) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating).toFixed(1),
      reviewCount: product.numReviews,
    };
  }
  return data;
}

function productFallback(product, name, description, image, price) {
  const variants = (product.variants ?? [])
    .map((variant) => [variant.capacity, variant.model].filter(Boolean).join(' · '))
    .filter(Boolean);
  return `
    <main class="seo-fallback">
      <nav aria-label="Fil d’Ariane"><a href="/">Accueil</a> / <a href="/shop">Boutique</a></nav>
      <article>
        ${image ? `<img src="${htmlEscape(image)}" alt="${htmlEscape(name)}" width="640" height="640" />` : ''}
        <div>
          ${product.brand ? `<p class="seo-eyebrow">${htmlEscape(product.brand)}</p>` : ''}
          <h1>${htmlEscape(name)}</h1>
          ${price && !product.contactOnly
            ? `<p class="seo-price">${htmlEscape(formatPrice(price))}</p>`
            : '<p class="seo-price">Prix sur demande</p>'}
          <p>${htmlEscape(description)}</p>
          ${variants.length
            ? `<h2>Variantes disponibles</h2><ul>${variants.map((variant) => `<li>${htmlEscape(variant)}</li>`).join('')}</ul>`
            : ''}
          <a class="seo-cta" href="/shop">Voir tous les produits</a>
        </div>
      </article>
    </main>`;
}

function shopFallback(products) {
  const cards = products.map((product) => {
    const name = localText(product.name) || 'Produit CoolZone';
    const image = product.images?.find(Boolean);
    const price = positivePrice(product);
    return `
      <li>
        <a href="/product/${encodeURIComponent(product.slug)}">
          ${image ? `<img src="${htmlEscape(image)}" alt="${htmlEscape(name)}" width="320" height="320" />` : ''}
          <strong>${htmlEscape(name)}</strong>
          <span>${product.contactOnly || !price ? 'Prix sur demande' : htmlEscape(formatPrice(price))}</span>
        </a>
      </li>`;
  }).join('');

  return `
    <main class="seo-fallback seo-catalog">
      <nav aria-label="Fil d’Ariane"><a href="/">Accueil</a> / Boutique</nav>
      <h1>Tous les produits CoolZone</h1>
      <p>Climatisation et ventilation au Maroc : découvrez notre catalogue, les prix et les modèles disponibles.</p>
      <ul>${cards}</ul>
    </main>`;
}

const fallbackStyles = `
    <style id="seo-prerender-styles">
      .seo-fallback{max-width:1180px;margin:0 auto;padding:48px 24px;font-family:Inter,Arial,sans-serif;color:#0a1628}
      .seo-fallback nav{margin-bottom:32px;color:#64748b;font-size:14px}.seo-fallback a{color:inherit}
      .seo-fallback article{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;align-items:start}
      .seo-fallback article>img{width:100%;height:auto;object-fit:contain;background:#f4f5f2;border-radius:18px}
      .seo-fallback h1{font-size:clamp(34px,5vw,64px);line-height:1.05;margin:8px 0 24px}.seo-fallback h2{font-size:18px;margin-top:28px}
      .seo-fallback p{font-size:17px;line-height:1.7}.seo-eyebrow{text-transform:uppercase;letter-spacing:.14em;color:#64748b;font-size:12px!important}
      .seo-price{font-weight:700;font-size:28px!important}.seo-cta{display:inline-block;margin-top:24px;padding:13px 24px;border-radius:999px;background:#0a1628;color:#fff!important;text-decoration:none}
      .seo-catalog>p{max-width:720px}.seo-catalog>ul{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;list-style:none;padding:0;margin-top:40px}
      .seo-catalog li a{display:grid;gap:10px;text-decoration:none}.seo-catalog li img{width:100%;aspect-ratio:1;object-fit:contain;background:#f4f5f2;border-radius:14px}
      .seo-catalog li span{color:#64748b}@media(max-width:720px){.seo-fallback article{grid-template-columns:1fr;gap:28px}.seo-catalog>ul{grid-template-columns:repeat(2,minmax(0,1fr))}}
    </style>`;

async function build() {
  const shell = readFileSync(shellPath, 'utf8');
  const products = asList(await fetchApi('/products?limit=10000', SITE_URL));
  if (!products.length) {
    throw new Error('The product API returned no public products; product pages were not generated.');
  }

  const productDir = resolve(DIST, 'product');
  mkdirSync(productDir, { recursive: true });
  let generated = 0;
  for (const product of products) {
    if (!product.slug) continue;
    const name = localText(product.name) || 'Produit CoolZone';
    const fallbackDescription = `${name}${product.brand ? ` par ${product.brand}` : ''}, disponible chez CoolZone avec livraison partout au Maroc.`;
    const fullDescription = localText(product.description).replace(/\s+/g, ' ').trim() || fallbackDescription;
    const description = cleanDescription(fullDescription, fallbackDescription);
    const path = `/product/${encodeURIComponent(product.slug)}`;
    const url = `${SITE_URL}${path}`;
    const image = product.images?.find(Boolean) || `${SITE_URL}/og-cover.png`;
    const price = positivePrice(product);
    const title = `${name} — CoolZone`;
    const jsonLd = [
      productJsonLd(product, name, fullDescription, url, image, price),
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Boutique', item: `${SITE_URL}/shop` },
          { '@type': 'ListItem', position: 3, name, item: url },
        ],
      },
    ];

    let html = setPageMeta(shell, {
      title,
      description,
      url,
      image,
      type: 'product',
    });
    html = injectHead(
      html,
      `${fallbackStyles}\n    <script type="application/ld+json">${safeJsonLd(jsonLd)}</script>`
    );
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${productFallback(product, name, fullDescription, image, price)}</div>`
    );

    writeFileSync(resolve(productDir, `${product.slug}.html`), html, 'utf8');
    generated += 1;
  }

  const shopTitle = 'Climatiseurs et ventilation au Maroc — CoolZone';
  const shopDescription = 'Découvrez tous les climatiseurs, accessoires et équipements de ventilation CoolZone. Prix en MAD et livraison partout au Maroc.';
  const shopUrl = `${SITE_URL}/shop`;
  let shopHtml = setPageMeta(shell, {
    title: shopTitle,
    description: shopDescription,
    url: shopUrl,
    image: `${SITE_URL}/og-cover.png`,
  });
  shopHtml = injectHead(
    shopHtml,
    `${fallbackStyles}\n    <script type="application/ld+json">${safeJsonLd({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: generated,
      itemListElement: products
        .filter((product) => product.slug)
        .map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: localText(product.name) || 'Produit CoolZone',
          url: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`,
        })),
    })}</script>`
  );
  shopHtml = shopHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${shopFallback(products.filter((product) => product.slug))}</div>`
  );
  writeFileSync(resolve(DIST, 'shop.html'), shopHtml, 'utf8');

  console.log(`[prerender] generated ${generated} product pages and the crawlable shop page`);
}

build().catch((error) => {
  console.error(`[prerender] failed: ${error.message}`);
  process.exitCode = 1;
});
