// Build-time sitemap generator. Runs before `vite build` (see the `prebuild`
// npm script). Fetches every public product, category and brand from the API
// and writes a fresh `public/sitemap.xml` so crawlers always see the latest
// URLs.
//
// Configuration (read from .env):
//   VITE_SITE_URL       — canonical site origin (default https://coolzone.ma)
//   VITE_API_URL        — backend root (default http://localhost:5050/api)
//
// The script is intentionally tolerant: it warns and exits 0 if the API is
// unreachable, so a build still succeeds when the data layer is down.

import { config as loadEnv } from 'dotenv';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
loadEnv({ path: resolve(ROOT, '.env') });

const SITE_URL = (process.env.VITE_SITE_URL || 'https://coolzone.ma').replace(/\/+$/, '');
const API_URL = (process.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/+$/, '');

const STATIC_ROUTES = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/shop', changefreq: 'daily', priority: '0.9' },
  { loc: '/brands', changefreq: 'weekly', priority: '0.8' },
  { loc: '/about', changefreq: 'monthly', priority: '0.5' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
];

const NOINDEX_PREFIXES = ['/account', '/admin', '/checkout', '/cart', '/login', '/register', '/wishlist'];

function xmlEscape(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function safeFetch(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    const json = await res.json();
    return json?.data ?? json ?? [];
  } catch (err) {
    console.warn(`[sitemap] ${err.message}`);
    return null;
  }
}

function toUrlEntry(loc, { changefreq = 'weekly', priority = '0.7' } = {}) {
  const url = `${SITE_URL}${loc.startsWith('/') ? loc : `/${loc}`}`;
  return `  <url>
    <loc>${xmlEscape(url)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function build() {
  console.log(`[sitemap] site: ${SITE_URL}`);
  console.log(`[sitemap] api:  ${API_URL}`);

  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    safeFetch('/products?limit=10000'),
    safeFetch('/categories'),
    safeFetch('/brands'),
  ]);

  const entries = [...STATIC_ROUTES.map((r) => toUrlEntry(r.loc, r))];

  if (Array.isArray(categoriesRes)) {
    for (const c of categoriesRes) {
      const slug = c.slug || c.name?.fr;
      if (!slug) continue;
      entries.push(toUrlEntry(`/shop?category=${encodeURIComponent(slug)}`, { changefreq: 'daily', priority: '0.8' }));
    }
    console.log(`[sitemap] categories: ${categoriesRes.length}`);
  }

  if (Array.isArray(brandsRes)) {
    for (const b of brandsRes) {
      const name = b.name;
      if (!name) continue;
      entries.push(toUrlEntry(`/shop?brand=${encodeURIComponent(name)}`, { changefreq: 'weekly', priority: '0.7' }));
    }
    console.log(`[sitemap] brands: ${brandsRes.length}`);
  }

  if (Array.isArray(productsRes)) {
    let added = 0;
    for (const p of productsRes) {
      if (!p.slug) continue;
      entries.push(toUrlEntry(`/product/${encodeURIComponent(p.slug)}`, { changefreq: 'weekly', priority: '0.7' }));
      added += 1;
    }
    console.log(`[sitemap] products: ${added}`);
  }

  const noindexHint = NOINDEX_PREFIXES.map((p) => `  <!-- private: ${p}* (noindex) -->`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${noindexHint}
${entries.join('\n')}
</urlset>
`;

  const outPath = resolve(ROOT, 'public', 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf8');
  console.log(`[sitemap] wrote ${entries.length} URLs to ${outPath}`);

  // If the API was unreachable, fall back to a tiny but valid sitemap so
  // crawlers still see something useful.
  if (entries.length === STATIC_ROUTES.length) {
    console.warn('[sitemap] No dynamic entries added — using static routes only.');
  }

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
    const updated = original.replace(/%VITE_SITE_URL%\//g, `${SITE_URL}/`);
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
  process.exitCode = 0; // don't fail the build
});
