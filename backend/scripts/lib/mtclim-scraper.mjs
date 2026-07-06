// Shared HTML/JSON-LD parsing helpers for mtclim.ma product pages.
// Importable from both CLI scripts and the HTTP controller so the
// behaviour stays identical.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const MTCLIM = 'https://mtclim.ma';

export function extractJsonLd(html) {
  const matches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const m of matches) {
    const json = m.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
    try {
      const parsed = JSON.parse(json);
      if (parsed['@type'] === 'Product') return parsed;
      if (Array.isArray(parsed)) {
        const prod = parsed.find((p) => p['@type'] === 'Product');
        if (prod) return prod;
      }
    } catch {}
  }
  return null;
}

export function extractDescription(html) {
  const m = html.match(/<div[^>]*id="description"[^>]*>([\s\S]*?)<\/div>/i);
  if (!m) return '';
  return m[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000);
}

export function extractImages(html) {
  const images = [];
  const re = /<img[^>]+src="(https:\/\/mtclim\.ma\/[^"]+p\/[^"]+)"[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1].replace(/-\d+_default/g, '-large_default');
    if (!images.includes(url)) images.push(url);
  }
  return images.slice(0, 10);
}

export function extractVariants(html) {
  const variants = [];
  const m = html.match(/data-product-variants="([^"]+)"/i);
  if (m) {
    try {
      const decoded = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
      for (const group of Object.values(decoded)) {
        for (const opt of group.attributes || []) {
          variants.push({ capacity: opt.name || '', price: 0, stock: 0 });
        }
      }
    } catch {}
  }
  return variants;
}

export async function fetchPage(url, { retries = 3, timeoutMs = 15000 } = {}) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html',
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) {
        if (i < retries - 1) await sleep(2000);
        continue;
      }
      return await res.text();
    } catch {
      if (i < retries - 1) await sleep(2000);
    }
  }
  return null;
}

/** Scrape a single mtclim.ma product URL. Returns a CoolZone-shaped
 *  product object, or `null` if the page can't be parsed. */
export async function scrapeOneProduct(url) {
  if (!url || !/^https?:\/\/mtclim\.ma\//i.test(url)) {
    throw new Error(`URL must start with ${MTCLIM}/`);
  }
  const html = await fetchPage(url);
  if (!html) return { ok: false, error: 'fetch_failed', url };

  const jsonLd = extractJsonLd(html);
  if (!jsonLd) {
    return { ok: false, error: 'no_product_jsonld', url };
  }

  const name = jsonLd.name || '';
  const description = jsonLd.description || extractDescription(html) || '';
  const rawBrand = jsonLd.brand?.name || '';
  const sku = jsonLd.sku || jsonLd.mpn || '';

  let price = 0;
  let priceOld = 0;
  const offers = jsonLd.offers;
  if (offers) {
    price = Number(offers.price) || 0;
    if (offers.highPrice) priceOld = Number(offers.highPrice) || 0;
  }

  const images = jsonLd.image
    ? [jsonLd.image.replace(/-\d+_default/, '-large_default')]
    : extractImages(html);

  const inStock = offers?.availability?.includes('InStock') ?? true;
  const variants = extractVariants(html);

  return {
    ok: true,
    url,
    product: {
      name: { fr: name, ar: '' },
      description: { fr: description, ar: '' },
      brand:
        rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1).toLowerCase(),
      category: jsonLd.category || '',
      price,
      priceOld: priceOld || undefined,
      images,
      stock: inStock ? 10 : 0,
      tags: [String(jsonLd.category || '').toLowerCase()].filter(Boolean),
      variants,
      sourceUrl: url,
      sku,
    },
  };
}
