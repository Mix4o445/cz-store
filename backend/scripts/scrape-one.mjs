#!/usr/bin/env node
// Scrape a single mtclim.ma product page and print (or save) the result.
//
// Usage:
//   node scripts/scrape-one.mjs <url>                 # print JSON to stdout
//   node scripts/scrape-one.mjs <url> --save <file>  # also write to <file>
//   node scripts/scrape-one.mjs <url> --import       # push to Supabase
//   node scripts/scrape-one.mjs <url> --no-mirror    # skip image re-hosting
//
// By default the scraper downloads every image on the page and re-uploads
// it to our own Cloudinary bucket, so the JSON output already points at
// our CDN instead of mtclim.ma. Pass --no-mirror to keep the original
// remote URLs (useful for debugging).

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { productToRow, makeProductSlug } from '../src/db/map.js';
import { scrapeOneProduct } from './lib/mtclim-scraper.mjs';
import { mirrorImages } from '../src/services/image.service.js';

loadEnv();

const url = process.argv[2];
if (!url) {
  console.error(
    'Usage: node scripts/scrape-one.mjs <url> [--save <file>] [--import] [--no-mirror]'
  );
  process.exit(1);
}

const saveIdx = process.argv.indexOf('--save');
const savePath = saveIdx > -1 ? process.argv[saveIdx + 1] : null;
const doImport = process.argv.includes('--import');
const noMirror = process.argv.includes('--no-mirror');

const result = await scrapeOneProduct(url);
if (!result.ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(2);
}

if (!noMirror && result.product.images?.length) {
  console.error(`[scrape-one] mirroring ${result.product.images.length} image(s)…`);
  result.product.images = await mirrorImages(result.product.images);
}

console.log(JSON.stringify(result.product, null, 2));

if (savePath) {
  const abs = resolve(savePath);
  writeFileSync(abs, JSON.stringify(result.product, null, 2) + '\n', 'utf8');
  console.error(`\n[scrape-one] saved to ${abs}`);
}

if (doImport) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n[scrape-one] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — cannot import');
    process.exit(3);
  }
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const row = productToRow(result.product);
  if (!row.slug) row.slug = makeProductSlug(result.product.name?.fr ?? 'product');
  const { data, error } = await supabase
    .from('products')
    .insert(row)
    .select('*')
    .single();
  if (error) {
    console.error('\n[scrape-one] insert failed:', error.message);
    process.exit(4);
  }
  console.error(`\n[scrape-one] inserted product id=${data.id} slug=${data.slug}`);
}

