import { env } from '../config/env.js';
import { productsRepo } from '../db/products.repo.js';
import { ordersRepo } from '../db/orders.repo.js';
import { categoriesRepo } from '../db/categories.repo.js';
import { brandsRepo } from '../db/brands.repo.js';
import { usersRepo } from '../db/users.repo.js';
import { reviewsRepo } from '../db/reviews.repo.js';
import { sendOrderStatusEmails } from './email.service.js';
import { ApiError } from '../utils/apiError.js';

// ---------------------------------------------------------------------------
// CoolZone AI Admin Agent
// ---------------------------------------------------------------------------
// A tool-calling agent backed by NVIDIA NIM (OpenAI-compatible API). It can read
// and mutate store data through the same repositories the REST controllers use,
// so it acts exactly like a human admin would. Built for efficiency: bounded
// tool loop, trimmed history, compact tool payloads, low temperature.
// ---------------------------------------------------------------------------

const MAX_TOOL_ROUNDS = 10; // hard cap on tool-call iterations per request
const MAX_HISTORY = 14; // only keep the most recent turns sent from the client
const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// Trim a product to the few fields that matter to an admin, keeping tokens low.
const compactVariant = (v) =>
  v && {
    variantId: v._id,
    capacity: v.capacity,
    model: v.model,
    price: v.price,
    priceOld: v.priceOld,
    stock: v.stock,
    sku: v.sku,
  };

const compactProduct = (p) =>
  p && {
    id: p._id,
    name: p.name?.fr ?? p.name,
    nameAr: p.name?.ar,
    descriptionFr: p.description?.fr,
    price: p.price,
    priceOld: p.priceOld,
    stock: p.stock,
    brand: p.brand,
    category: p.category,
    isFeatured: p.isFeatured,
    isPromo: p.isPromo,
    tags: p.tags,
    images: p.images,
    specs: p.specs,
    slug: p.slug,
    variants: (p.variants ?? []).map(compactVariant),
  };

const compactOrder = (o) =>
  o && {
    id: o._id,
    status: o.status,
    total: o.total,
    customer: o.user?.name ?? o.shipping?.name,
    email: o.user?.email ?? o.shipping?.email,
    phone: o.shipping?.phone,
    payment: o.payment?.method,
    items: (o.items ?? []).map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    createdAt: o.createdAt,
  };

const compactUser = (u) =>
  u && { id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role };

// Keep only defined variant fields; coerce numbers. Preserves _id when present.
function cleanVariant(v = {}) {
  const out = {};
  if (v._id) out._id = v._id;
  if (v.capacity != null) out.capacity = String(v.capacity);
  if (v.model != null && v.model !== '') out.model = String(v.model);
  if (v.price != null) out.price = Number(v.price);
  if (v.priceOld != null) out.priceOld = Number(v.priceOld);
  if (v.stock != null) out.stock = Number(v.stock);
  if (v.sku != null && v.sku !== '') out.sku = String(v.sku);
  return out;
}

function normalizeVariants(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(cleanVariant).filter((v) => v.capacity && v.price != null);
}

// Mirror the REST controller: derive base price/stock from variants when set.
function deriveFromVariants(payload) {
  if (Array.isArray(payload.variants) && payload.variants.length > 0) {
    const prices = payload.variants.map((v) => v.price).filter((n) => n != null);
    if (prices.length && payload.price == null) payload.price = Math.min(...prices);
    if (payload.stock == null) {
      payload.stock = payload.variants.reduce((s, v) => s + (v.stock ?? 0), 0);
    }
  }
  return payload;
}

// fetch() with an abort timeout so web tools never hang the request.
async function fetchWithTimeout(url, options = {}, ms = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Tool implementations — each returns a plain JS object/array (serialized to
// JSON for the model). Throwing is fine; errors are surfaced back to the model.
// ---------------------------------------------------------------------------

const TOOL_IMPL = {
  async dashboard_stats() {
    const [users, products, orders, brands, categories, revenue] = await Promise.all([
      usersRepo.count(),
      productsRepo.count({}),
      ordersRepo.count(),
      brandsRepo.count(),
      categoriesRepo.count(),
      ordersRepo.revenue(),
    ]);
    return { counts: { users, products, orders, brands, categories }, revenue };
  },

  async list_products({ query = '', limit = 20 } = {}) {
    const filter = query ? { q: query } : {};
    const items = await productsRepo.list({ filter, limit: Math.min(Number(limit) || 20, 50) });
    return items.map(compactProduct);
  },

  async get_product({ id, slug } = {}) {
    const p = id ? await productsRepo.byId(id) : slug ? await productsRepo.bySlug(slug) : null;
    if (!p) return { error: 'Product not found' };
    return compactProduct(p);
  },

  async low_stock({ limit = 10 } = {}) {
    const items = await productsRepo.lowStock(Math.min(Number(limit) || 10, 50));
    return items.map(compactProduct);
  },

  async create_product(args = {}) {
    const { nameFr, nameAr, descriptionFr, descriptionAr, ...rest } = args;
    if (!nameFr) return { error: 'nameFr (French product name) is required' };
    const variants = normalizeVariants(rest.variants);
    if (rest.price == null && variants.length === 0)
      return { error: 'Provide a base price or at least one variant' };
    const payload = {
      name: { fr: nameFr, ar: nameAr ?? nameFr },
      description: { fr: descriptionFr ?? '', ar: descriptionAr ?? '' },
      price: rest.price != null ? Number(rest.price) : undefined,
      stock: rest.stock != null ? Number(rest.stock) : undefined,
      brand: rest.brand,
      category: rest.category,
      tags: rest.tags,
      deliveryFee: rest.deliveryFee != null ? Number(rest.deliveryFee) : undefined,
      isFeatured: rest.isFeatured,
      isPromo: rest.isPromo,
      priceOld: rest.priceOld != null ? Number(rest.priceOld) : undefined,
      images: rest.images,
      specs: rest.specs,
      variants: variants.length ? variants : undefined,
    };
    deriveFromVariants(payload);
    const created = await productsRepo.create(payload);
    return { ok: true, product: compactProduct(created) };
  },

  async update_product({ id, ...fields } = {}) {
    if (!id) return { error: 'id is required' };
    const payload = {};
    if (fields.nameFr != null || fields.nameAr != null) {
      const current = await productsRepo.byId(id);
      payload.name = {
        fr: fields.nameFr ?? current?.name?.fr,
        ar: fields.nameAr ?? current?.name?.ar,
      };
    }
    if (fields.descriptionFr != null || fields.descriptionAr != null) {
      const current = await productsRepo.byId(id);
      payload.description = {
        fr: fields.descriptionFr ?? current?.description?.fr ?? '',
        ar: fields.descriptionAr ?? current?.description?.ar ?? '',
      };
    }
    if (fields.specs !== undefined) payload.specs = fields.specs;
    if (fields.images !== undefined) payload.images = fields.images;
    if (fields.variants !== undefined) {
      payload.variants = normalizeVariants(fields.variants);
      deriveFromVariants(payload);
    }
    for (const [k, v] of Object.entries({
      price: fields.price != null ? Number(fields.price) : undefined,
      priceOld: fields.priceOld != null ? Number(fields.priceOld) : undefined,
      stock: fields.stock != null ? Number(fields.stock) : undefined,
      brand: fields.brand,
      category: fields.category,
      tags: fields.tags,
      isFeatured: fields.isFeatured,
      isPromo: fields.isPromo,
      deliveryFee: fields.deliveryFee != null ? Number(fields.deliveryFee) : undefined,
      slug: fields.slug,
    })) {
      if (v !== undefined) payload[k] = v;
    }
    const updated = await productsRepo.updateById(id, payload);
    if (!updated) return { error: 'Product not found' };
    return { ok: true, product: compactProduct(updated) };
  },

  // ---- Variants -----------------------------------------------------------
  async list_variants({ productId } = {}) {
    if (!productId) return { error: 'productId is required' };
    const p = await productsRepo.byId(productId);
    if (!p) return { error: 'Product not found' };
    return (p.variants ?? []).map(compactVariant);
  },

  async add_variant({ productId, capacity, model, price, priceOld, stock, sku } = {}) {
    if (!productId) return { error: 'productId is required' };
    if (!capacity) return { error: 'capacity is required' };
    if (price == null) return { error: 'price is required' };
    const p = await productsRepo.byId(productId);
    if (!p) return { error: 'Product not found' };
    const variants = [
      ...(p.variants ?? []),
      cleanVariant({ capacity, model, price, priceOld, stock, sku }),
    ];
    const payload = { variants };
    deriveFromVariants(payload);
    const updated = await productsRepo.updateById(productId, payload);
    return { ok: true, product: compactProduct(updated) };
  },

  async update_variant({ productId, variantId, ...fields } = {}) {
    if (!productId || !variantId) return { error: 'productId and variantId are required' };
    const p = await productsRepo.byId(productId);
    if (!p) return { error: 'Product not found' };
    let found = false;
    const variants = (p.variants ?? []).map((v) => {
      if (String(v._id) !== String(variantId)) return v;
      found = true;
      return cleanVariant({
        capacity: fields.capacity ?? v.capacity,
        model: fields.model ?? v.model,
        price: fields.price != null ? Number(fields.price) : v.price,
        priceOld: fields.priceOld != null ? Number(fields.priceOld) : v.priceOld,
        stock: fields.stock != null ? Number(fields.stock) : v.stock,
        sku: fields.sku ?? v.sku,
        _id: v._id,
      });
    });
    if (!found) return { error: 'Variant not found on this product' };
    const payload = { variants };
    deriveFromVariants(payload);
    const updated = await productsRepo.updateById(productId, payload);
    return { ok: true, product: compactProduct(updated) };
  },

  async delete_variant({ productId, variantId } = {}) {
    if (!productId || !variantId) return { error: 'productId and variantId are required' };
    const p = await productsRepo.byId(productId);
    if (!p) return { error: 'Product not found' };
    const variants = (p.variants ?? []).filter((v) => String(v._id) !== String(variantId));
    if (variants.length === (p.variants ?? []).length)
      return { error: 'Variant not found on this product' };
    const payload = { variants };
    deriveFromVariants(payload);
    const updated = await productsRepo.updateById(productId, payload);
    return { ok: true, product: compactProduct(updated) };
  },

  async delete_product({ id } = {}) {
    if (!id) return { error: 'id is required' };
    const deleted = await productsRepo.deleteById(id);
    if (!deleted) return { error: 'Product not found' };
    return { ok: true, deleted: compactProduct(deleted) };
  },

  async list_orders({ status = '', limit = 20 } = {}) {
    const items = await ordersRepo.listAll({
      status: status || undefined,
      limit: Math.min(Number(limit) || 20, 50),
    });
    return items.map(compactOrder);
  },

  async get_order({ id } = {}) {
    if (!id) return { error: 'id is required' };
    const o = await ordersRepo.byId(id, { withUser: true });
    if (!o) return { error: 'Order not found' };
    return { ...compactOrder(o), shipping: o.shipping, notes: o.notes };
  },

  async update_order_status({ id, status } = {}) {
    if (!id) return { error: 'id is required' };
    if (!ORDER_STATUSES.includes(status))
      return { error: `status must be one of: ${ORDER_STATUSES.join(', ')}` };
    const order = await ordersRepo.updateStatus(id, status);
    if (!order) return { error: 'Order not found' };
    // Fire status notification emails (non-blocking) like the REST endpoint does.
    ordersRepo
      .byId(order._id, { withUser: true })
      .then((populated) => sendOrderStatusEmails(populated ?? order, status))
      .catch(() => {});
    return { ok: true, order: compactOrder(order) };
  },

  async list_categories() {
    const items = await categoriesRepo.list();
    return items.map((c) => ({ id: c._id, name: c.name, slug: c.slug, order: c.order }));
  },

  async create_category({ nameFr, nameAr, icon, image, order } = {}) {
    if (!nameFr) return { error: 'nameFr is required' };
    const created = await categoriesRepo.create({
      name: { fr: nameFr, ar: nameAr ?? nameFr },
      icon,
      image,
      order,
    });
    return { ok: true, category: { id: created._id, name: created.name, slug: created.slug } };
  },

  async update_category({ id, nameFr, nameAr, icon, image, order } = {}) {
    if (!id) return { error: 'id is required' };
    const payload = {};
    if (nameFr != null || nameAr != null) {
      const cur = await categoriesRepo.byId(id);
      payload.name = { fr: nameFr ?? cur?.name?.fr, ar: nameAr ?? cur?.name?.ar };
    }
    if (icon !== undefined) payload.icon = icon;
    if (image !== undefined) payload.image = image;
    if (order !== undefined) payload.order = order;
    const updated = await categoriesRepo.updateById(id, payload);
    if (!updated) return { error: 'Category not found' };
    return { ok: true, category: { id: updated._id, name: updated.name } };
  },

  async delete_category({ id } = {}) {
    if (!id) return { error: 'id is required' };
    const deleted = await categoriesRepo.deleteById(id);
    if (!deleted) return { error: 'Category not found' };
    return { ok: true };
  },

  async list_brands() {
    const items = await brandsRepo.list();
    return items.map((b) => ({ id: b._id, name: b.name, slug: b.slug, order: b.order }));
  },

  async create_brand({ name, description, logo, order } = {}) {
    if (!name) return { error: 'name is required' };
    const created = await brandsRepo.create({ name, description, logo, order });
    return { ok: true, brand: { id: created._id, name: created.name, slug: created.slug } };
  },

  async update_brand({ id, name, description, logo, order } = {}) {
    if (!id) return { error: 'id is required' };
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (logo !== undefined) payload.logo = logo;
    if (order !== undefined) payload.order = order;
    const updated = await brandsRepo.updateById(id, payload);
    if (!updated) return { error: 'Brand not found' };
    return { ok: true, brand: { id: updated._id, name: updated.name } };
  },

  async delete_brand({ id } = {}) {
    if (!id) return { error: 'id is required' };
    const deleted = await brandsRepo.deleteById(id);
    if (!deleted) return { error: 'Brand not found' };
    return { ok: true };
  },

  async list_users({ query = '', limit = 20 } = {}) {
    const items = await usersRepo.list({ q: query, limit: Math.min(Number(limit) || 20, 50) });
    return items.map(compactUser);
  },

  async set_user_role({ id, role } = {}) {
    if (!id) return { error: 'id is required' };
    if (!['user', 'admin'].includes(role)) return { error: "role must be 'user' or 'admin'" };
    const updated = await usersRepo.updateById(id, { role });
    if (!updated) return { error: 'User not found' };
    return { ok: true, user: compactUser(updated) };
  },

  // ---- Reviews ------------------------------------------------------------
  async list_reviews({ productId } = {}) {
    if (!productId) return { error: 'productId is required' };
    const items = await reviewsRepo.listByProduct(productId);
    return items.map((r) => ({
      id: r._id,
      rating: r.rating,
      comment: r.comment,
      user: r.user?.name ?? r.user,
      createdAt: r.createdAt,
    }));
  },

  async delete_review({ id } = {}) {
    if (!id) return { error: 'id is required' };
    await reviewsRepo.deleteById(id);
    return { ok: true };
  },

  // ---- Web --------------------------------------------------------------
  async web_search({ query, max = 5 } = {}) {
    if (!query) return { error: 'query is required' };
    const limit = Math.min(Number(max) || 5, 8);

    // Preferred: Tavily (built for agents) when an API key is configured.
    if (env.ai.tavilyApiKey) {
      try {
        const r = await fetchWithTimeout('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: env.ai.tavilyApiKey,
            query,
            max_results: limit,
            include_answer: true,
          }),
        });
        const data = await r.json();
        return {
          answer: data.answer,
          results: (data.results ?? []).map((x) => ({
            title: x.title,
            url: x.url,
            snippet: (x.content ?? '').slice(0, 300),
          })),
        };
      } catch (e) {
        return { error: `web_search failed: ${e.message}` };
      }
    }

    // Keyless fallback: DuckDuckGo Instant Answer API.
    try {
      const u = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const r = await fetchWithTimeout(u);
      const data = await r.json();
      const results = [];
      if (data.AbstractText)
        results.push({ title: data.Heading, url: data.AbstractURL, snippet: data.AbstractText });
      for (const t of data.RelatedTopics ?? []) {
        if (t.Text && t.FirstURL) results.push({ title: t.Text.slice(0, 80), url: t.FirstURL, snippet: t.Text });
        if (results.length >= limit) break;
      }
      return results.length
        ? { results, note: 'Set TAVILY_API_KEY for richer web search.' }
        : { results: [], note: 'No instant answer. Configure TAVILY_API_KEY for full web search.' };
    } catch (e) {
      return { error: `web_search failed: ${e.message}` };
    }
  },

  async fetch_url({ url } = {}) {
    if (!url || !/^https?:\/\//i.test(url)) return { error: 'A valid http(s) url is required' };
    try {
      const r = await fetchWithTimeout(url, { headers: { 'User-Agent': 'CoolZoneBot/1.0' } });
      const html = await r.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return { url, status: r.status, text: text.slice(0, 4000) };
    } catch (e) {
      return { error: `fetch_url failed: ${e.message}` };
    }
  },
};

// Mutating tools — used to flag actions in the response so the UI can refresh.
const MUTATING_TOOLS = new Set([
  'create_product',
  'update_product',
  'delete_product',
  'add_variant',
  'update_variant',
  'delete_variant',
  'update_order_status',
  'create_category',
  'update_category',
  'delete_category',
  'create_brand',
  'update_brand',
  'delete_brand',
  'set_user_role',
  'delete_review',
]);

// ---------------------------------------------------------------------------
// Tool schemas advertised to the model (OpenAI tools format).
// ---------------------------------------------------------------------------

const str = (description) => ({ type: 'string', description });
const numType = (description) => ({ type: 'number', description });
const bool = (description) => ({ type: 'boolean', description });

const SPECS_SCHEMA = {
  type: 'object',
  description: 'Technical specs',
  properties: {
    capacity: { type: 'string' },
    energyClass: { type: 'string' },
    coverage: { type: 'string' },
    inverter: { type: 'boolean' },
    wifi: { type: 'boolean' },
    heating: { type: 'boolean' },
    noise: { type: 'string' },
    warranty: { type: 'string' },
  },
};

const VARIANT_SCHEMA = {
  type: 'object',
  properties: {
    capacity: { type: 'string', description: 'e.g. "12000 BTU"' },
    model: { type: 'string', description: 'e.g. "Inverter"' },
    price: { type: 'number' },
    priceOld: { type: 'number' },
    stock: { type: 'number' },
    sku: { type: 'string' },
  },
  required: ['capacity', 'price'],
};

const TOOLS = [
  fn('dashboard_stats', 'Get store totals (users, products, orders, brands, categories) and revenue.'),
  fn('list_products', 'Search/list products. Use `query` to filter by name or brand.', {
    query: str('Search term for product name or brand (optional)'),
    limit: numType('Max results, default 20, max 50'),
  }),
  fn('get_product', 'Get a single product by id or slug.', {
    id: str('Product id (UUID)'),
    slug: str('Product slug'),
  }),
  fn('low_stock', 'List products that are low or out of stock.', {
    limit: numType('Max results, default 10'),
  }),
  fn(
    'create_product',
    'Create a new product. nameFr and price are required.',
    {
      nameFr: str('Product name in French (required)'),
      nameAr: str('Product name in Arabic'),
      descriptionFr: str('Description in French'),
      descriptionAr: str('Description in Arabic'),
      price: numType('Price in MAD (required)'),
      priceOld: numType('Old/strikethrough price'),
      stock: numType('Stock quantity'),
      brand: str('Brand name'),
      category: str('Category id (use list_categories to find it)'),
      tags: { type: 'array', items: { type: 'string' }, description: 'Tags' },
      deliveryFee: numType('Delivery fee in MAD'),
      isFeatured: bool('Show on homepage'),
      isPromo: bool('Mark as promo'),
      images: { type: 'array', items: { type: 'string' }, description: 'Image URLs' },
      specs: SPECS_SCHEMA,
      variants: { type: 'array', items: VARIANT_SCHEMA, description: 'Product variants (capacity/price/stock)' },
    },
    ['nameFr']
  ),
  fn(
    'update_product',
    'Update fields of an existing product. Only provided fields change. Can edit name, description, price, stock, images, specs, tags, flags, and replace the whole variants array.',
    {
      id: str('Product id (required)'),
      nameFr: str('New French name'),
      nameAr: str('New Arabic name'),
      descriptionFr: str('New French description'),
      descriptionAr: str('New Arabic description'),
      price: numType('New price'),
      priceOld: numType('New old price'),
      stock: numType('New stock'),
      brand: str('New brand'),
      category: str('New category id'),
      tags: { type: 'array', items: { type: 'string' } },
      images: { type: 'array', items: { type: 'string' }, description: 'Replace image URLs' },
      specs: SPECS_SCHEMA,
      variants: { type: 'array', items: VARIANT_SCHEMA, description: 'Replace the entire variants array' },
      isFeatured: bool('Featured flag'),
      isPromo: bool('Promo flag'),
      deliveryFee: numType('Delivery fee'),
      slug: str('URL slug'),
    },
    ['id']
  ),
  fn('list_variants', 'List the variants of a product with their variantIds.', { productId: str('Product id') }, ['productId']),
  fn(
    'add_variant',
    'Add a variant to a product.',
    {
      productId: str('Product id'),
      capacity: str('Capacity, e.g. "12000 BTU" (required)'),
      model: str('Model label, e.g. "Inverter"'),
      price: numType('Variant price in MAD (required)'),
      priceOld: numType('Old price'),
      stock: numType('Variant stock'),
      sku: str('SKU code'),
    },
    ['productId', 'capacity', 'price']
  ),
  fn(
    'update_variant',
    'Update one variant of a product by variantId. Only provided fields change.',
    {
      productId: str('Product id'),
      variantId: str('Variant id (from list_variants)'),
      capacity: str('Capacity'),
      model: str('Model label'),
      price: numType('Price'),
      priceOld: numType('Old price'),
      stock: numType('Stock'),
      sku: str('SKU'),
    },
    ['productId', 'variantId']
  ),
  fn('delete_variant', 'Remove a variant from a product.', {
    productId: str('Product id'),
    variantId: str('Variant id'),
  }, ['productId', 'variantId']),
  fn('delete_product', 'Permanently delete a product. Confirm with the user first.', { id: str('Product id') }, ['id']),
  fn('list_orders', 'List orders, optionally filtered by status.', {
    status: { type: 'string', enum: ORDER_STATUSES, description: 'Filter by status' },
    limit: numType('Max results, default 20'),
  }),
  fn('get_order', 'Get full details of one order by id.', { id: str('Order id') }, ['id']),
  fn(
    'update_order_status',
    'Change an order status. Sends notification emails to customer and admin.',
    { id: str('Order id'), status: { type: 'string', enum: ORDER_STATUSES } },
    ['id', 'status']
  ),
  fn('list_categories', 'List all product categories with their ids.'),
  fn('create_category', 'Create a category.', {
    nameFr: str('French name (required)'),
    nameAr: str('Arabic name'),
    icon: str('Icon name'),
    image: str('Image URL'),
    order: numType('Sort order'),
  }, ['nameFr']),
  fn('update_category', 'Update a category.', {
    id: str('Category id'),
    nameFr: str('French name'),
    nameAr: str('Arabic name'),
    icon: str('Icon'),
    image: str('Image URL'),
    order: numType('Sort order'),
  }, ['id']),
  fn('delete_category', 'Delete a category. Confirm first.', { id: str('Category id') }, ['id']),
  fn('list_brands', 'List all brands with their ids.'),
  fn('create_brand', 'Create a brand.', {
    name: str('Brand name (required)'),
    description: str('Description'),
    logo: str('Logo URL'),
    order: numType('Sort order'),
  }, ['name']),
  fn('update_brand', 'Update a brand.', {
    id: str('Brand id'),
    name: str('Name'),
    description: str('Description'),
    logo: str('Logo URL'),
    order: numType('Sort order'),
  }, ['id']),
  fn('delete_brand', 'Delete a brand. Confirm first.', { id: str('Brand id') }, ['id']),
  fn('list_users', 'List/search users by name or email.', {
    query: str('Search term'),
    limit: numType('Max results, default 20'),
  }),
  fn('set_user_role', "Set a user's role to 'user' or 'admin'.", {
    id: str('User id'),
    role: { type: 'string', enum: ['user', 'admin'] },
  }, ['id', 'role']),
  fn('list_reviews', 'List customer reviews for a product.', { productId: str('Product id') }, ['productId']),
  fn('delete_review', 'Delete a customer review by id (e.g. spam/abuse). Confirm first.', { id: str('Review id') }, ['id']),
  fn(
    'web_search',
    'Search the public web for up-to-date information (competitor prices, specs, market data, news). Returns titles, URLs and snippets.',
    { query: str('Search query'), max: numType('Max results, default 5') },
    ['query']
  ),
  fn(
    'fetch_url',
    'Fetch a web page and return its readable text content. Use after web_search to read a specific result.',
    { url: str('Full http(s) URL') },
    ['url']
  ),
];

function fn(name, description, properties = {}, required = []) {
  return {
    type: 'function',
    function: {
      name,
      description,
      parameters: { type: 'object', properties, required },
    },
  };
}

const SYSTEM_PROMPT = `You are CoolZone Copilot, the AI operations assistant embedded in the admin panel of CoolZone — a bilingual (French/Arabic) air-conditioning e-commerce store in Morocco. Prices are in MAD.

You act on behalf of a store administrator with full control over the store. Use the provided tools to read and modify ANY store data: products (including their variants, images, specs, descriptions, prices, stock, tags, featured/promo flags), orders and their status, categories, brands, users and roles, and customer reviews. You can also search the web and read web pages to inform your decisions (e.g. competitor pricing, product specs, market research).

Guidelines:
- Be concise and professional. Reply in the same language the admin uses (French, Arabic, or English).
- Be proactive and agentic: when asked to do something, chain multiple tools to fully complete it — look up ids, make the changes, then verify. Do not just describe steps.
- To edit a product variant, first call list_variants to get the variantId, then add_variant / update_variant / delete_variant.
- Look up ids with list_* tools before updating or deleting by id. Never invent ids.
- Use web_search (and fetch_url to read a page) when the admin asks about current prices, specs, trends, or anything not in the store database.
- Before any destructive action (deleting a product, variant, category, brand, or review), confirm with the admin unless they already clearly approved it.
- When you change data, briefly summarize what changed (names and key values), not raw ids.
- If a tool returns an error, explain it plainly and suggest a fix.
- Money is in MAD. Keep answers short and skimmable.`;

// ---------------------------------------------------------------------------
// NVIDIA NIM chat completion (OpenAI-compatible) via native fetch.
// ---------------------------------------------------------------------------

async function nvidiaChat(messages, { tools = true } = {}) {
  const res = await fetch(`${env.ai.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.ai.nvidiaApiKey}`,
    },
    body: JSON.stringify({
      model: env.ai.model,
      messages,
      ...(tools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(502, `AI provider error (${res.status})`, text.slice(0, 500));
  }
  const data = await res.json();
  return data.choices?.[0]?.message;
}

/**
 * Run one agent turn.
 * @param {{role:string, content:string}[]} history  Prior chat turns from client.
 * @returns {Promise<{reply:string, actions:{tool:string, ok:boolean}[]}>}
 */
export async function runAgent(history = []) {
  if (!env.ai.nvidiaApiKey) {
    throw new ApiError(503, 'AI assistant is not configured. Set NVIDIA_API_KEY on the server.');
  }

  // Keep only role/content from client turns, trimmed to the recent window.
  const trimmed = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content }));

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed];
  const actions = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const msg = await nvidiaChat(messages);
    if (!msg) throw new Error('Empty response from AI provider');

    const toolCalls = msg.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return { reply: msg.content ?? '', actions };
    }

    // Record the assistant's tool-call message, then execute each call.
    messages.push({ role: 'assistant', content: msg.content ?? '', tool_calls: toolCalls });

    for (const call of toolCalls) {
      const name = call.function?.name;
      let args = {};
      try {
        args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
      } catch {
        args = {};
      }

      let result;
      try {
        const impl = TOOL_IMPL[name];
        result = impl ? await impl(args) : { error: `Unknown tool: ${name}` };
      } catch (e) {
        result = { error: e.message || 'Tool execution failed' };
      }

      const ok = !(result && result.error);
      if (MUTATING_TOOLS.has(name)) actions.push({ tool: name, ok });

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result).slice(0, 4000),
      });
    }
  }

  // Hit the loop cap — ask for a final summary without more tools.
  const final = await nvidiaChat(messages, { tools: false });
  return { reply: final?.content ?? 'Action terminée.', actions };
}
