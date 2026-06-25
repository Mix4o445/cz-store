import { randomUUID } from 'node:crypto';
import slugify from 'slugify';

// ---------------------------------------------------------------------------
// Row (snake_case Postgres) -> Document (Mongo-style camelCase) mappers.
// These keep the Express API responses byte-for-byte compatible with what the
// React frontend consumed under MongoDB (_id, createdAt, nested name.fr, …).
// ---------------------------------------------------------------------------

const ts = (row) => ({
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function mapUser(row, { withPassword = false } = {}) {
  if (!row) return null;
  const doc = {
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    role: row.role,
    addresses: row.addresses ?? [],
    ...ts(row),
  };
  if (withPassword) doc.password = row.password;
  return doc;
}

export function mapCategory(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon ?? undefined,
    image: row.image ?? undefined,
    order: row.order ?? 0,
    ...ts(row),
  };
}

export function mapBrand(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo ?? '',
    description: row.description ?? '',
    order: row.order ?? 0,
    ...ts(row),
  };
}

export function mapProduct(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    description: row.description ?? { fr: '', ar: '' },
    brand: row.brand ?? undefined,
    category: row.category ?? undefined,
    price: num(row.price),
    priceOld: row.price_old != null ? num(row.price_old) : undefined,
    images: row.images ?? [],
    specs: row.specs ?? {},
    stock: row.stock ?? 0,
    rating: num(row.rating) ?? 0,
    numReviews: row.num_reviews ?? 0,
    isPromo: !!row.is_promo,
    isFeatured: !!row.is_featured,
    tags: row.tags ?? [],
    deliveryFee: num(row.delivery_fee) ?? 0,
    variants: row.variants ?? [],
    slug: row.slug,
    ...ts(row),
  };
}

export function mapReview(row) {
  if (!row) return null;
  // `users` may be embedded via a foreign-table select (`user:users(...)`).
  const joined = row.users ?? row.user ?? null;
  return {
    _id: row.id,
    user: joined ? { _id: joined.id, name: joined.name } : row.user_id,
    product: row.product_id,
    rating: row.rating,
    comment: row.comment ?? '',
    ...ts(row),
  };
}

export function mapOrder(row) {
  if (!row) return null;
  const joined = row.users ?? row.user ?? null;
  return {
    _id: row.id,
    user: joined ? { _id: joined.id, name: joined.name, email: joined.email } : row.user_id,
    items: row.items ?? [],
    shipping: row.shipping ?? {},
    payment: row.payment ?? {},
    status: row.status,
    subtotal: num(row.subtotal),
    shipping_cost: num(row.shipping_cost) ?? 0,
    discount: num(row.discount) ?? 0,
    total: num(row.total),
    coupon: row.coupon ?? undefined,
    notes: row.notes ?? undefined,
    ...ts(row),
  };
}

// ---------------------------------------------------------------------------
// Document (camelCase) -> Row (snake_case) for inserts/updates.
// Only defined keys are emitted, so partial updates work like Mongoose $set.
// ---------------------------------------------------------------------------

export function productToRow(d = {}) {
  const row = {};
  if (d.name !== undefined) row.name = d.name;
  if (d.description !== undefined) row.description = d.description;
  if (d.brand !== undefined) row.brand = d.brand || null;
  if (d.category !== undefined) row.category = d.category || null;
  if (d.price !== undefined) row.price = d.price;
  if (d.priceOld !== undefined) row.price_old = d.priceOld ?? null;
  if (d.images !== undefined) row.images = d.images;
  if (d.specs !== undefined) row.specs = d.specs;
  if (d.stock !== undefined) row.stock = d.stock;
  if (d.rating !== undefined) row.rating = d.rating;
  if (d.numReviews !== undefined) row.num_reviews = d.numReviews;
  if (d.isPromo !== undefined) row.is_promo = d.isPromo;
  if (d.isFeatured !== undefined) row.is_featured = d.isFeatured;
  if (d.tags !== undefined) row.tags = d.tags;
  if (d.deliveryFee !== undefined) row.delivery_fee = d.deliveryFee;
  if (d.variants !== undefined) row.variants = ensureIds(d.variants);
  if (d.slug !== undefined) row.slug = d.slug;
  return row;
}

export function categoryToRow(d = {}) {
  const row = {};
  if (d.name !== undefined) row.name = d.name;
  if (d.slug !== undefined) row.slug = d.slug;
  if (d.icon !== undefined) row.icon = d.icon;
  if (d.image !== undefined) row.image = d.image;
  if (d.order !== undefined) row.order = d.order;
  return row;
}

export function brandToRow(d = {}) {
  const row = {};
  if (d.name !== undefined) row.name = d.name;
  if (d.slug !== undefined) row.slug = d.slug;
  if (d.logo !== undefined) row.logo = d.logo;
  if (d.description !== undefined) row.description = d.description;
  if (d.order !== undefined) row.order = d.order;
  return row;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Postgres numeric columns come back as strings — coerce to JS numbers. */
function num(v) {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

/** Give nested array items (variants, addresses) a stable _id like Mongo subdocs. */
export function ensureIds(arr = []) {
  return (arr ?? []).map((item) =>
    item && typeof item === 'object' && !item._id ? { ...item, _id: randomUUID() } : item
  );
}

export function makeSlug(base) {
  return slugify(String(base || ''), { lower: true, strict: true });
}

export function makeProductSlug(nameFr) {
  return slugify(`${nameFr}-${Math.random().toString(36).slice(2, 6)}`, {
    lower: true,
    strict: true,
  });
}

/**
 * Convert a Mongoose-style sort string ("-createdAt", "price") into a column +
 * direction usable by supabase-js `.order()`.
 */
const SORT_COLUMNS = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  price: 'price',
  priceOld: 'price_old',
  rating: 'rating',
  stock: 'stock',
  numReviews: 'num_reviews',
};

export function parseSort(sort = '-createdAt') {
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  const column = SORT_COLUMNS[key] ?? 'created_at';
  return { column, ascending: !desc };
}
