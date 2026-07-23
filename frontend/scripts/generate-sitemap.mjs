// Build-time sitemap generator. Runs before `vite build` (see the `prebuild`
// npm script). Fetches every public product from the API and writes a fresh
// `public/sitemap.xml` so crawlers always see the latest canonical URLs.
//
// Configuration (read from .env):
//   VITE_SITE_URL       — canonical site origin
//   SEO_API_URL         — optional build-only API override
//   VITE_API_URL        — frontend API root

import { config as loadEnv } from 'dotenv';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  asList,
  fetchApi,
  normalizeSiteUrl,
  xmlEscape,
} from './seo-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
loadEnv({ path: resolve(ROOT, '.env') });

const SITE_URL = normalizeSiteUrl(process.env.VITE_SITE_URL);

const STATIC_ROUTES = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/shop', changefreq: 'daily', priority: '0.9' },
  { loc: '/brands', changefreq: 'weekly', priority: '0.8' },
  { loc: '/about', changefreq: 'monthly', priority: '0.5' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
];

const NOINDEX_PREFIXES = ['/account', '/admin', '/checkout', '/cart', '/login', '/register', '/wishlist'];

function toUrlEntry(
  loc,
  {
    changefreq = 'weekly',
    priority = '0.7',
    lastmod,
    images = [],
  } = {}
) {
  const url = `${SITE_URL}${loc.startsWith('/') ? loc : `/${loc}`}`;
  return `  <url>
    <loc>${xmlEscape(url)}</loc>
${lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${images
  .filter((image) => /^https?:\/\//i.test(image))
  .slice(0, 5)
  .map((image) => `    <image:image><image:loc>${xmlEscape(image)}</image:loc></image:image>`)
  .join('\n')}
  </url>`;
}

async function build() {
  console.log(`[sitemap] site: ${SITE_URL}`);

  const productsPayload = await fetchApi('/products?limit=10000', SITE_URL);
  const products = asList(productsPayload);

  const entries = [...STATIC_ROUTES.map((r) => toUrlEntry(r.loc, r))];

  if (!products.length) {
    throw new Error('The product API returned no public products; refusing to publish an empty product sitemap.');
  }
  let added = 0;
  for (const product of products) {
    if (!product.slug) continue;
    entries.push(toUrlEntry(`/product/${encodeURIComponent(product.slug)}`, {
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: product.updatedAt?.slice(0, 10),
      images: product.images ?? [],
    }));
    added += 1;
  }
  console.log(`[sitemap] products: ${added}`);

  const noindexHint = NOINDEX_PREFIXES.map((p) => `  <!-- private: ${p}* (noindex) -->`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${noindexHint}
${entries.join('\n')}
</urlset>
`;

  const outPath = resolve(ROOT, 'public', 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf8');
  console.log(`[sitemap] wrote ${entries.length} URLs to ${outPath}`);

  // Mirror into dist/ if it already exists (helps when this script is run
  // post-build for one-off regeneration).
  const distPath = resolve(ROOT, 'dist', 'sitemap.xml');
  if (existsSync(dirname(distPath))) {
    writeFileSync(distPath, xml, 'utf8');
  }

  // Regenerate robots.txt from the public/ template so the Sitemap: line
  // always points at the configured site origin. We do a simple text replace
  // so we don't have to keep a separate template.
  const robotsPath = resolve(ROOT, 'public', 'robots.txt');
  if (existsSync(robotsPath)) {
    const original = readFileSync(robotsPath, 'utf8');
    const updated = original.replace(
      /Sitemap:\s+\S+/i,
      `Sitemap: ${SITE_URL}/sitemap.xml`
    );
    writeFileSync(robotsPath, updated, 'utf8');
    console.log(`[sitemap] rewrote robots.txt with sitemap URL ${SITE_URL}/sitemap.xml`);
  }

  // Best-effort: ping search engines with the new sitemap URL. Google's
  // public ping endpoint was retired in 2023, so this is mostly useful for
  // Bing / IndexNow in the future. Opt-in via SITEMAP_PING=1.
  if (process.env.SITEMAP_PING === '1') {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    const endpoints = [
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        console.log(`[sitemap] ping ${new URL(url).hostname} → ${res.status}`);
      } catch (err) {
        console.warn(`[sitemap] ping failed for ${new URL(url).hostname}: ${err.message}`);
      }
    }
  }
}

build().catch((err) => {
  console.error('[sitemap] failed:', err.message);
  process.exitCode = 1;
});
