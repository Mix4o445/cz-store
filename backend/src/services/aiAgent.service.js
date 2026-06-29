import { env } from '../config/env.js';
import { productsRepo } from '../db/products.repo.js';
import { ordersRepo } from '../db/orders.repo.js';
import { categoriesRepo } from '../db/categories.repo.js';
import { brandsRepo } from '../db/brands.repo.js';
import { usersRepo } from '../db/users.repo.js';
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

const MAX_TOOL_ROUNDS = 6; // hard cap on tool-call iterations per request
const MAX_HISTORY = 12; // only keep the most recent turns sent from the client
const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// Trim a product to the few fields that matter to an admin, keeping tokens low.
const compactProduct = (p) =>
  p && {
    id: p._id,
    name: p.name?.fr ?? p.name,
    price: p.price,
    priceOld: p.priceOld,
    stock: p.stock,
    brand: p.brand,
    category: p.category,
    isFeatured: p.isFeatured,
    isPromo: p.isPromo,
    tags: p.tags,
    slug: p.slug,
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
    if (rest.price == null) return { error: 'price is required' };
    const payload = {
      name: { fr: nameFr, ar: nameAr ?? nameFr },
      description: { fr: descriptionFr ?? '', ar: descriptionAr ?? '' },
      price: Number(rest.price),
      stock: rest.stock != null ? Number(rest.stock) : 0,
      brand: rest.brand,
      category: rest.category,
      tags: rest.tags,
      deliveryFee: rest.deliveryFee != null ? Number(rest.deliveryFee) : undefined,
      isFeatured: rest.isFeatured,
      isPromo: rest.isPromo,
      priceOld: rest.priceOld != null ? Number(rest.priceOld) : undefined,
      images: rest.images,
    };
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
    })) {
      if (v !== undefined) payload[k] = v;
    }
    const updated = await productsRepo.updateById(id, payload);
    if (!updated) return { error: 'Product not found' };
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
};

// Mutating tools — used to flag actions in the response so the UI can refresh.
const MUTATING_TOOLS = new Set([
  'create_product',
  'update_product',
  'delete_product',
  'update_order_status',
  'create_category',
  'update_category',
  'delete_category',
  'create_brand',
  'update_brand',
  'delete_brand',
  'set_user_role',
]);

// ---------------------------------------------------------------------------
// Tool schemas advertised to the model (OpenAI tools format).
// ---------------------------------------------------------------------------

const str = (description) => ({ type: 'string', description });
const numType = (description) => ({ type: 'number', description });
const bool = (description) => ({ type: 'boolean', description });

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
    },
    ['nameFr', 'price']
  ),
  fn(
    'update_product',
    'Update fields of an existing product. Only provided fields change.',
    {
      id: str('Product id (required)'),
      nameFr: str('New French name'),
      nameAr: str('New Arabic name'),
      price: numType('New price'),
      priceOld: numType('New old price'),
      stock: numType('New stock'),
      brand: str('New brand'),
      category: str('New category id'),
      tags: { type: 'array', items: { type: 'string' } },
      isFeatured: bool('Featured flag'),
      isPromo: bool('Promo flag'),
      deliveryFee: numType('Delivery fee'),
    },
    ['id']
  ),
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

You act on behalf of a store administrator. Use the provided tools to read and modify real store data (products, orders, categories, brands, users). 

Guidelines:
- Be concise and professional. Reply in the same language the admin uses (French, Arabic, or English).
- When asked to do something, use tools to actually do it — do not just describe steps.
- Look up ids with list_* tools before updating or deleting by id. Never invent ids.
- Before any destructive action (deleting a product, category, or brand), confirm with the admin unless they already clearly approved it.
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
