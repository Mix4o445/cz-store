/**
 * One-off migration: copy all data from the existing MongoDB database into
 * Supabase (PostgreSQL). Safe to re-run — rows are upserted on their natural
 * keys (slug / email / name), except orders which are insert-only.
 *
 * Usage:
 *   MONGODB_URI=...  SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  \
 *   node scripts/migrate-to-supabase.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';

import { env } from '../src/config/env.js';
import { supabase } from '../src/config/supabase.js';

import { User } from '../src/models/User.model.js';
import { Product } from '../src/models/Product.model.js';
import { Category } from '../src/models/Category.model.js';
import { Brand } from '../src/models/Brand.model.js';
import { Order } from '../src/models/Order.model.js';
import { Review } from '../src/models/Review.model.js';
import { Coupon } from '../src/models/Coupon.model.js';

const ensureIds = (arr = []) =>
  (arr ?? []).map((x) => (x && typeof x === 'object' && !x._id ? { ...x, _id: randomUUID() } : x));

async function upsert(table, rows, onConflict) {
  if (!rows.length) return [];
  const { data, error } = await supabase.from(table).upsert(rows, { onConflict }).select('*');
  if (error) throw new Error(`[${table}] ${error.message}`);
  return data ?? [];
}

async function run() {
  console.log('[migrate] connecting to MongoDB:', env.mongoUri);
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });

  // --- Categories ---------------------------------------------------------
  const cats = await Category.find().lean();
  const catRows = cats.map((c) => ({
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? null,
    image: c.image ?? null,
    order: c.order ?? 0,
    created_at: c.createdAt,
  }));
  const insertedCats = await upsert('categories', catRows, 'slug');
  const catMap = new Map(); // oldId -> newId
  for (const c of cats) {
    const match = insertedCats.find((r) => r.slug === c.slug);
    if (match) catMap.set(String(c._id), match.id);
  }
  console.log(`[migrate] categories: ${insertedCats.length}`);

  // --- Brands -------------------------------------------------------------
  const brands = await Brand.find().lean();
  await upsert(
    'brands',
    brands.map((b) => ({
      name: b.name,
      slug: b.slug,
      logo: b.logo ?? '',
      description: b.description ?? '',
      order: b.order ?? 0,
      created_at: b.createdAt,
    })),
    'name'
  );
  console.log(`[migrate] brands: ${brands.length}`);

  // --- Users --------------------------------------------------------------
  const users = await User.find().select('+password').lean();
  const userRows = users.map((u) => ({
    name: u.name,
    email: String(u.email).toLowerCase(),
    password: u.password, // already a bcrypt hash — carry over as-is
    phone: u.phone ?? null,
    role: u.role ?? 'user',
    addresses: ensureIds(u.addresses ?? []),
    created_at: u.createdAt,
  }));
  const insertedUsers = await upsert('users', userRows, 'email');
  const userMap = new Map();
  for (const u of users) {
    const match = insertedUsers.find((r) => r.email === String(u.email).toLowerCase());
    if (match) userMap.set(String(u._id), match.id);
  }
  console.log(`[migrate] users: ${insertedUsers.length}`);

  // --- Products -----------------------------------------------------------
  const products = await Product.find().lean();
  const productRows = products.map((p) => ({
    name: p.name,
    description: p.description ?? { fr: '', ar: '' },
    brand: p.brand ?? null,
    category: p.category ? catMap.get(String(p.category)) ?? null : null,
    price: p.price ?? 0,
    price_old: p.priceOld ?? null,
    images: p.images ?? [],
    specs: p.specs ?? {},
    stock: p.stock ?? 0,
    rating: p.rating ?? 0,
    num_reviews: p.numReviews ?? 0,
    is_promo: !!p.isPromo,
    is_featured: !!p.isFeatured,
    tags: p.tags ?? [],
    delivery_fee: p.deliveryFee ?? 0,
    variants: ensureIds(p.variants ?? []),
    slug: p.slug,
    created_at: p.createdAt,
  }));
  const insertedProducts = await upsert('products', productRows, 'slug');
  const productMap = new Map();
  for (const p of products) {
    const match = insertedProducts.find((r) => r.slug === p.slug);
    if (match) productMap.set(String(p._id), match.id);
  }
  console.log(`[migrate] products: ${insertedProducts.length}`);

  // --- Reviews ------------------------------------------------------------
  const reviews = await Review.find().lean();
  const reviewRows = reviews
    .map((r) => ({
      user_id: userMap.get(String(r.user)),
      product_id: productMap.get(String(r.product)),
      rating: r.rating,
      comment: r.comment ?? '',
      created_at: r.createdAt,
    }))
    .filter((r) => r.user_id && r.product_id);
  await upsert('reviews', reviewRows, 'user_id,product_id');
  console.log(`[migrate] reviews: ${reviewRows.length}`);

  // --- Coupons ------------------------------------------------------------
  const coupons = await Coupon.find().lean();
  await upsert(
    'coupons',
    coupons.map((c) => ({
      code: c.code,
      type: c.type,
      value: c.value ?? 0,
      min_total: c.minTotal ?? 0,
      expires_at: c.expiresAt ?? null,
      usage_limit: c.usageLimit ?? 0,
      used_count: c.usedCount ?? 0,
      active: c.active ?? true,
      created_at: c.createdAt,
    })),
    'code'
  );
  console.log(`[migrate] coupons: ${coupons.length}`);

  // --- Orders (insert-only; no natural key) -------------------------------
  const orders = await Order.find().lean();
  const orderRows = orders.map((o) => ({
    user_id: o.user ? userMap.get(String(o.user)) ?? null : null,
    items: (o.items ?? []).map((it) => ({
      ...it,
      product: it.product ? productMap.get(String(it.product)) ?? null : null,
    })),
    shipping: o.shipping ?? {},
    payment: o.payment ?? {},
    status: o.status ?? 'pending',
    subtotal: o.subtotal ?? null,
    shipping_cost: o.shipping_cost ?? 0,
    discount: o.discount ?? 0,
    total: o.total ?? 0,
    notes: o.notes ?? null,
    created_at: o.createdAt,
  }));
  if (orderRows.length) {
    const { error } = await supabase.from('orders').insert(orderRows);
    if (error) throw new Error(`[orders] ${error.message}`);
  }
  console.log(`[migrate] orders: ${orderRows.length}`);

  await mongoose.disconnect();
  console.log('[migrate] done ✅');
}

run().catch(async (e) => {
  console.error('[migrate] FAILED:', e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
