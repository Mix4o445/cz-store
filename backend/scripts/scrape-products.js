import mongoose from 'mongoose';
import { Product } from '../src/models/Product.model.js';
import { Category } from '../src/models/Category.model.js';
import { Brand } from '../src/models/Brand.model.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coolzone';
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const CATEGORY_SLUG = process.argv.find((a, i) => process.argv[i - 1] === '--category') || null;
const DELAY_MS = Number(process.argv.find((a, i) => process.argv[i - 1] === '--delay') || 800);
const MAX_PAGES = Number(process.argv.find((a, i) => process.argv[i - 1] === '--max-pages') || 0) || 999;

const MTCLIM = 'https://mtclim.ma';

const CATEGORY_URLS = [
  { slug: 'climatisation', url: '/3-climatiseur' },
  { slug: 'ventilation', url: '/4-ventilation' },
  { slug: 'refrigeration', url: '/5-froid' },
  { slug: 'mural', url: '/11-mural' },
  { slug: 'gainable', url: '/12-gainable' },
  { slug: 'cassette', url: '/13-cassette' },
  { slug: 'console', url: '/124-console' },
  { slug: 'armoire', url: '/125-armoire' },
  { slug: 'mobile', url: '/126-mobile' },
  { slug: 'deshumidificateur', url: '/127-deshumidificateur' },
  { slug: 'black-miroir', url: '/128-black-miroir' },
  { slug: 'multi-muraux', url: '/15-multi-muraux' },
  { slug: 'multi-cassette', url: '/14-multi-cassette' },
  { slug: 'multi-gainable', url: '/16-multi-gainable' },
  { slug: 'unite-exterieure', url: '/17-multi-unite-exterieur' },
  { slug: 'accessoires-climatiseur', url: '/166-Accessoires-Climatiseur' },
  { slug: 'caissons-et-ventilateurs', url: '/53-caisson-ventilation' },
  { slug: 'caissons-entrainement-direct', url: '/54-caissons-vebtilation-entrainement-direct' },
  { slug: 'caissons-poulie-courroie', url: '/55-caissons-poulie-courroie-mtclim-casablanca-maroc' },
  { slug: 'caissons-desenfumage', url: '/56-caissons-desenfumage-mtclim-casablanca-maroc' },
  { slug: 'conduits-circulaires-et-accessoires', url: '/140-conduits-circulaires-et-accessoires' },
  { slug: 'accessoires-en-tole', url: '/141-accessoires-en-tole-' },
  { slug: 'flexible-isole', url: '/143-flexible-isole' },
  { slug: 'flexible-souple', url: '/144-flexible-souple' },
  { slug: 'diffusion-d-air', url: '/133-diffusion-d-air' },
  { slug: 'grille', url: '/58-grille' },
  { slug: 'diffuseur', url: '/61-diffuseur-' },
  { slug: 'ventouse', url: '/142-venteus' },
  { slug: 'diffuseur-sur-platine', url: '/150-diffuseur-sur-platine-' },
  { slug: 'ventilateurs', url: '/59-ventilateur-mtclim-casablanca-maroc' },
  { slug: 'filtre-electrostatique', url: '/169-filtre-electrostatique' },
  { slug: 'compresseurs-frigorifiques', url: '/7-groupes-frigorifrique' },
  { slug: 'compresseurs', url: '/18-compresseur-maroc' },
  { slug: 'fluide-frigorigene', url: '/8-fluide-frigorigene' },
  { slug: 'forane', url: '/145-forane-' },
  { slug: 'harp-fluide', url: '/146-harp' },
  { slug: 'frio', url: '/147-frio' },
  { slug: 'isolation', url: '/19-isolant-thermique' },
  { slug: 'isolant-thermique', url: '/20-isolant-thermique' },
  { slug: 'scotch-aluminium', url: '/21-scotch-aluminium' },
  { slug: 'bande-adhesive', url: '/22-bande-adhesive' },
  { slug: 'armaflex', url: '/151-armaflex' },
  { slug: 'matelaflex', url: '/152-matelaflex' },
  { slug: 'scotch-grise', url: '/153-scotch-grise-' },
  { slug: 'evaporateurs', url: '/23-evaporateurs' },
  { slug: 'evaporateurs-cubique', url: '/24-evaporateurs-cubique' },
  { slug: 'evaporateurs-extra-plat', url: '/25-evaporateurs-extra-plat' },
  { slug: 'evaporateur-double-flux', url: '/26-evaporateur-double-flux' },
  { slug: 'huile-frigorifiques', url: '/27-huile-frigorifiques' },
  { slug: 'suniso-sl-32', url: '/154-suniso-sl-32' },
  { slug: 'suniso-4gs', url: '/155-suniso-4gs' },
  { slug: 'suniso-3gs', url: '/156-suniso-3gs' },
  { slug: 'harp-mo-3e', url: '/157-harp-mo-3e' },
  { slug: 'outillages', url: '/28-outillages' },
  { slug: 'dudgeonnieres', url: '/29-dudgeonnieres' },
  { slug: 'coupe-tubes', url: '/30-coupe-tubes' },
  { slug: 'manometres', url: '/31-manometres' },
  { slug: 'pompes-a-vide', url: '/32-pompes-a-vides' },
  { slug: 'chalumeau-a-gaz', url: '/37-chalumeau-a-gaz' },
  { slug: 'thermometre-infrarouge', url: '/148-thermometre-infrarouge' },
  { slug: 'additif-stop-fuites', url: '/149-additif-stop-fuites' },
  { slug: 'evaseur-et-kit-evaseur', url: '/158-evaseur-et-kit-evaseur' },
  { slug: 'tubes-en-cuivre', url: '/33-tubes-en-cuivre' },
  { slug: 'tube-cuivre-en-rouleaux', url: '/34-tube-cuivre-en-rouleaux' },
  { slug: 'tube-cuivre-en-barres', url: '/35-tube-cuivre-en-barres' },
  { slug: 'tube-cuivre-isole', url: '/36-tube-cuivre-isole' },
  { slug: 'regulation', url: '/38-regulation' },
  { slug: 'regulateur-electronique', url: '/39-regulateur-electronique' },
  { slug: 'detendeurs-thermostatiques', url: '/40-detendeurs-thermostatiques-' },
  { slug: 'electrovannes', url: '/41-electrovannes' },
  { slug: 'pressostats', url: '/42-presosstats' },
  { slug: 'voyants-liquides', url: '/43-voyants-liquides' },
  { slug: 'filtres-deshydrateurs', url: '/44-filtres-deshydrateurs' },
  { slug: 'thermostats-menagers', url: '/45-thermostats-menagers' },
  { slug: 'thermostats-universels', url: '/46-thermostats-universels-' },
  { slug: 'thermostats-pour-clapet', url: '/163-thermostats-pour-clapet' },
  { slug: 'condenseurs', url: '/47-condenseurs' },
  { slug: 'accessoires-en-cuivre', url: '/48-accessoires-en-cuivre' },
  { slug: 'coudes-en-cuivre', url: '/49-coudes-en-cuivre' },
  { slug: 'te-en-cuivre', url: '/50-te-en-cuivre' },
  { slug: 'siphon-en-cuivre', url: '/51-siphon-en-cuivre' },
  { slug: 'manchon-en-cuivre', url: '/52-manchon-en-cuivre' },
  { slug: 'groupe-de-condensation', url: '/159-groupe-de-condensation-' },
  { slug: 'groupe-normal', url: '/160-groupe-normal' },
  { slug: 'groupe-carrosse', url: '/161-groupe-carrosse-' },
  { slug: 'groupe-silencieux', url: '/162-groupe-silencieux' },
  { slug: 'cables', url: '/164-cables' },
  { slug: 'cable-souple', url: '/165-cable-souple' },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractJsonLd(html) {
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

function extractProductsFromListing(html) {
  const productUrls = new Set();
  const linkRegex = /href="(https?:\/\/mtclim\.ma\/[^"]+?-\d+-[^"]+?\.html)(?:#[^"]*)?"/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.includes('/module/') || url.includes('/panier') || url.includes('/commande')) continue;
    productUrls.add(url);
  }
  const articleRegex = /class="[^"]*product-miniature[^"]*"[^>]*data-id-product="(\d+)"/gi;
  const idSet = new Set();
  while ((match = articleRegex.exec(html)) !== null) {
    idSet.add(match[1]);
  }
  return [...productUrls];
}

function extractDescription(html) {
  const descMatch = html.match(/<div[^>]*id="description"[^>]*>([\s\S]*?)<\/div>/i);
  if (descMatch) {
    return descMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000);
  }
  return '';
}

function extractImages(html) {
  const images = [];
  const imgRegex = /<img[^>]+src="(https:\/\/mtclim\.ma\/[^"]+p\/[^"]+)"[^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1].replace(/-\d+_default/g, '-large_default');
    if (!images.includes(url)) images.push(url);
  }
  return images.slice(0, 10);
}

function extractVariants(html) {
  const variants = [];
  const variantRegex = /data-product-variants="([^"]+)"/i;
  const match = html.match(variantRegex);
  if (match) {
    try {
      const decoded = JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
      for (const group of Object.values(decoded)) {
        for (const opt of group.attributes || []) {
          variants.push({ capacity: opt.name || '', price: 0, stock: 0 });
        }
      }
    } catch {}
  }
  return variants;
}

async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html',
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        console.warn(`  [WARN] HTTP ${res.status} for ${url}`);
        if (i < retries - 1) await sleep(2000);
        continue;
      }
      return await res.text();
    } catch (e) {
      console.warn(`  [WARN] Fetch error (${i + 1}/${retries}) for ${url}: ${e.message}`);
      if (i < retries - 1) await sleep(2000);
    }
  }
  return null;
}

async function scrapeProductPage(url) {
  const html = await fetchPage(url);
  if (!html) return null;

  const jsonLd = extractJsonLd(html);
  if (!jsonLd) {
    console.warn(`  [WARN] No Product JSON-LD found at ${url}`);
    return null;
  }

  const name = jsonLd.name || '';
  const description = jsonLd.description || extractDescription(html) || '';
  const brand = jsonLd.brand?.name || '';
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

  const category = jsonLd.category || '';
  const inStock = offers?.availability?.includes('InStock') ?? true;

  return {
    name: { fr: name, ar: '' },
    description: { fr: description, ar: '' },
    brand: brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase(),
    category,
    price,
    priceOld: priceOld || undefined,
    images,
    stock: inStock ? 10 : 0,
    tags: [category.toLowerCase()].filter(Boolean),
    sourceUrl: url,
    sku,
  };
}

function matchCategory(categoryName, slug) {
  if (!categoryName && !slug) return null;
  const catMap = {
    mural: 'mural', gainable: 'gainable', cassette: 'cassette',
    'mono split': 'mono-split', 'multi split': 'multi-split',
    ventilation: 'ventilation', climatisation: 'climatisation',
    refrigeration: 'refrigeration', froid: 'refrigeration',
  };
  if (slug && catMap[slug]) return catMap[slug];
  if (categoryName) {
    const lower = categoryName.toLowerCase();
    for (const [k, v] of Object.entries(catMap)) {
      if (lower.includes(k)) return v;
    }
  }
  return slug || categoryName?.toLowerCase().replace(/\s+/g, '-') || null;
}

async function main() {
  console.log('========================================');
  console.log('  MT Clim Product Scraper');
  console.log('========================================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Force: ${FORCE ? 'YES' : 'NO (skip existing by SKU)'}`);
  console.log(`Delay: ${DELAY_MS}ms between requests`);
  console.log(`Category filter: ${CATEGORY_SLUG || 'ALL'}`);

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('[db] Connected to MongoDB\n');

  const brands = await Brand.find({});
  const brandNames = new Set(brands.map((b) => b.name.toLowerCase()));
  const categories = await Category.find({});
  const catSlugMap = new Map(categories.map((c) => [c.slug, c._id]));

  const categoriesToScrape = CATEGORY_SLUG
    ? CATEGORY_URLS.filter((c) => c.slug === CATEGORY_SLUG)
    : CATEGORY_URLS;

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const catInfo of categoriesToScrape) {
    console.log(`\n--- Category: ${catInfo.slug} (${MTCLIM + catInfo.url}) ---`);
    const categoryObjectId = catSlugMap.get(catInfo.slug);

    const allProductUrls = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const pageUrl = `${MTCLIM}${catInfo.url}?page=${page}`;
      console.log(`  Fetching listing page ${page}: ${pageUrl}`);
      const html = await fetchPage(pageUrl);
      if (!html) break;

      const urls = extractProductsFromListing(html);
      if (urls.length === 0 && page > 1) break;
      allProductUrls.push(...urls);
      console.log(`  Found ${urls.length} product URLs on page ${page}`);

      const hasNextPage = html.includes(`?page=${page + 1}`) || html.includes(`&page=${page + 1}`) || html.includes(`page=${page + 1}`);
      if (!hasNextPage && page > 1) break;
      if (urls.length === 0) break;
      await sleep(DELAY_MS);
    }

    const uniqueUrls = [...new Set(allProductUrls)];
    console.log(`  Total unique product URLs: ${uniqueUrls.length}`);

    for (const productUrl of uniqueUrls) {
      await sleep(DELAY_MS);

      const productData = await scrapeProductPage(productUrl);
      if (!productData) {
        totalErrors++;
        continue;
      }

      const matchedCatSlug = matchCategory(productData.category, catInfo.slug);
      const matchedCategoryId = catSlugMap.get(matchedCatSlug) || categoryObjectId || null;

      if (DRY_RUN) {
        console.log(`  [DRY] Product: "${productData.name.fr}" | Brand: ${productData.brand} | Price: ${productData.price} MAD | Cat: ${matchedCatSlug}`);
        totalCreated++;
        continue;
      }

      const existingSku = productData.sku ? await Product.findOne({ 'name.fr': productData.name.fr }) : null;
      if (existingSku && !FORCE) {
        console.log(`  [SKIP] "${productData.name.fr}" already exists`);
        totalSkipped++;
        continue;
      }
      if (existingSku && FORCE) {
        await Product.deleteOne({ _id: existingSku._id });
      }

      try {
        const product = await Product.create({
          name: productData.name,
          description: productData.description,
          brand: brandNames.has(productData.brand.toLowerCase()) ? productData.brand.charAt(0).toUpperCase() + productData.brand.slice(1).toLowerCase() : productData.brand,
          category: matchedCategoryId,
          price: productData.price || 0,
          priceOld: productData.priceOld,
          images: productData.images,
          stock: productData.stock,
          tags: productData.tags,
        });
        console.log(`  [CREATE] "${productData.name.fr}" (price: ${productData.price} MAD)`);
        totalCreated++;
      } catch (err) {
        console.error(`  [ERROR] Creating "${productData.name.fr}": ${err.message}`);
        totalErrors++;
      }
    }
  }

  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================');
  console.log(`Created:  ${totalCreated}`);
  console.log(`Skipped:  ${totalSkipped}`);
  console.log(`Errors:   ${totalErrors}`);

  await mongoose.disconnect();
  console.log('[db] Disconnected');
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});