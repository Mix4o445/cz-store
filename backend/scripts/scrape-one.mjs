#!/usr/bin/env node
// Scrape a single mtclim.ma product page and print (or save) the result.
//
// Usage:
//   node scripts/scrape-one.js <url>                 # print JSON to stdout
//   node scripts/scrape-one.js <url> --save <file>  # also write to <file>
//   node scripts/scrape-one.js <url> --import       # push to Supabase
//
// The shape of the output is the same as a CoolZone Product document, so
// you can pipe the result straight into a `create product` request or a
// JSON file that you can `INSERT` into Supabase.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { productToRow, makeProductSlug } from '../src/db/map.js';
import { scrapeOneProduct } from './lib/mtclim-scraper.mjs';

loadEnv();

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/scrape-one.js <url> [--save <file>] [--import]');
  process.exit(1);
}

const saveIdx = process.argv.indexOf('--save');
const savePath = saveIdx > -1 ? process.argv[saveIdx + 1] : null;
const doImport = process.argv.includes('--import');

const result = await scrapeOneProduct(url);

if (!result.ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(2);
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
