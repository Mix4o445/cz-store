import { z } from 'zod';
import slugify from 'slugify';
import { productsRepo } from '../db/products.repo.js';
import { categoriesRepo } from '../db/categories.repo.js';
import { ok, created } from '../utils/apiResponse.js';
import { badRequest, notFound } from '../utils/apiError.js';
import { isUuid } from '../utils/ids.js';

const boolish = z.preprocess(
  (v) => (typeof v === 'string' ? v.trim().toLowerCase() === 'true' : v),
  z.boolean()
);

const specsSchema = z
  .object({
    capacity: z.string().optional().or(z.literal('')),
    energyClass: z.string().optional().or(z.literal('')),
    coverage: z.string().optional().or(z.literal('')),
    inverter: boolish.optional(),
    wifi: boolish.optional(),
    heating: boolish.optional(),
    noise: z.string().optional().or(z.literal('')),
    warranty: z.string().optional().or(z.literal('')),
  })
  .optional();

const variantSchema = z.object({
  capacity: z.string().min(1),
  model: z.string().optional().or(z.literal('')),
  price: z.number().nonnegative(),
  priceOld: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().optional().or(z.literal('')),
});

const baseProductShape = {
  name: z.object({ fr: z.string().min(1), ar: z.string().optional().or(z.literal('')) }),
  description: z
    .object({ fr: z.string().optional().or(z.literal('')), ar: z.string().optional().or(z.literal('')) })
    .optional(),
  brand: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  price: z.number().nonnegative().optional(),
  priceOld: z.number().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  specs: specsSchema,
  stock: z.number().int().nonnegative().optional(),
  isPromo: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  slug: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  deliveryFee: z.number().nonnegative().optional(),
  variants: z.array(variantSchema).optional(),
};

const productSchema = z.object(baseProductShape).refine(
  (data) => data.price !== undefined || (Array.isArray(data.variants) && data.variants.length > 0),
  { message: 'Either a base price or at least one variant is required', path: ['price'] }
);

/** Ensure base price/stock are populated from variants when admin omits them. */
function deriveFromVariants(payload) {
  if (Array.isArray(payload.variants) && payload.variants.length > 0) {
    const prices = payload.variants.map((v) => v.price);
    if (payload.price == null) payload.price = Math.min(...prices);
    if (payload.stock == null) {
      payload.stock = payload.variants.reduce((s, v) => s + (v.stock ?? 0), 0);
    }
  }
  return payload;
}

export async function listProducts(req, res, next) {
  try {
    const {
      page = 1,
      limit = 24,
      sort = '-createdAt',
      brand,
      category,
      tag,
      minPrice,
      maxPrice,
      promo,
      featured,
      popular,
      q,
    } = req.query;

    const filter = {};
    if (brand) filter.brand = brand;
    if (category) {
      if (isUuid(category)) {
        filter.category = category;
      } else {
        const cat = await categoriesRepo.bySlug(category);
        if (!cat) return ok(res, { items: [], total: 0, page: Number(page), limit: Number(limit) });
        filter.category = cat._id;
      }
    }
    if (tag) filter.tag = tag.toLowerCase();
    if (promo === '1' || promo === 'true') filter.isPromo = true;
    if (featured === '1' || featured === 'true') filter.isFeatured = true;
    if (popular === '1' || popular === 'true') filter.isPopular = true;
    if (minPrice) filter.minPrice = Number(minPrice);
    if (maxPrice) filter.maxPrice = Number(maxPrice);
    if (q) filter.q = q;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      productsRepo.list({ filter, sort, skip, limit: Number(limit) }),
      productsRepo.count(filter),
    ]);

    return ok(res, { items, total, page: Number(page), limit: Number(limit) });
  } catch (e) {
    next(e);
  }
}

export async function getFeatured(_req, res, next) {
  try {
    const items = await productsRepo.featured(8);
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function listTags(_req, res, next) {
  try {
    const tags = await productsRepo.distinctTags();
    return ok(res, tags.filter(Boolean).sort());
  } catch (e) {
    next(e);
  }
}

export async function listByIds(req, res, next) {
  try {
    const raw = String(req.query.ids || '');
    const ids = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => isUuid(s));
    if (!ids.length) return ok(res, []);
    const items = await productsRepo.byIds(ids);
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function getBySlug(req, res, next) {
  try {
    const item = await productsRepo.bySlug(req.params.slug);
    if (!item) throw notFound('Product not found');
    return ok(res, item);
  } catch (e) {
    next(e);
  }
}

/** Normalize a user-supplied slug: trim, slugify. Returns the cleaned value or
 *  an empty string when the input is empty / nullish. The repo layer is
 *  responsible for auto-generating a slug when it receives an empty value. */
function normalizeSlug(raw) {
  if (raw == null) return '';
  const cleaned = slugify(String(raw).trim(), { lower: true, strict: true });
  return cleaned || '';
}

export async function createProduct(req, res, next) {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    if (parsed.data.tags) parsed.data.tags = parsed.data.tags.map((t) => t.toLowerCase().trim()).filter(Boolean);
    if (!parsed.data.category) delete parsed.data.category;
    parsed.data.slug = normalizeSlug(parsed.data.slug);
    deriveFromVariants(parsed.data);
    const item = await productsRepo.create(parsed.data);
    return created(res, item);
  } catch (e) {
    next(e);
  }
}

export async function updateProduct(req, res, next) {
  try {
    if (!isUuid(req.params.id)) throw notFound('Product not found');
    const partialSchema = z.object(baseProductShape).partial();
    const parsed = partialSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    if (parsed.data.tags) parsed.data.tags = parsed.data.tags.map((t) => t.toLowerCase().trim()).filter(Boolean);
    if (parsed.data.category === '') parsed.data.category = null;
    if ('slug' in parsed.data) {
      // The form distinguishes three cases via the raw payload:
      //  - `req.body.slug === undefined` ⇒ user didn't touch the field, keep
      //    the existing slug (drop the key from the update).
      //  - `req.body.slug === ''` ⇒ user explicitly cleared it; ask the repo
      //    to auto-generate a fresh one.
      //  - non-empty string ⇒ slugify and use it.
      if (req.body.slug == null) {
        delete parsed.data.slug;
      } else {
        const cleaned = normalizeSlug(req.body.slug);
        parsed.data.slug = cleaned;
        if (cleaned === '') delete parsed.data.slug; // signal auto-generate
      }
    }
    deriveFromVariants(parsed.data);
    const item = await productsRepo.updateById(req.params.id, parsed.data);
    if (!item) throw notFound('Product not found');
    return ok(res, item);
  } catch (e) {
    next(e);
  }
}

export async function removeProduct(req, res, next) {
  try {
    if (!isUuid(req.params.id)) throw notFound('Product not found');
    const item = await productsRepo.deleteById(req.params.id);
    if (!item) throw notFound('Product not found');
    return ok(res, null, 'Deleted');
  } catch (e) {
    next(e);
  }
}

export async function duplicateProduct(req, res, next) {
  try {
    if (!isUuid(req.params.id)) throw notFound('Product not found');
    const src = await productsRepo.byId(req.params.id);
    if (!src) throw notFound('Product not found');

    const { _id, slug, createdAt, updatedAt, rating, numReviews, ...rest } = src;

    const copy = {
      ...rest,
      name: {
        ...(rest.name ?? {}),
        fr: rest.name?.fr ? `${rest.name.fr} (copie)` : 'Produit (copie)',
      },
      slug: undefined,
      stock: 0,
      rating: 0,
      numReviews: 0,
      variants: Array.isArray(rest.variants)
        ? rest.variants.map(({ _id, ...v }) => v)
        : [],
    };

    deriveFromVariants(copy);
    const item = await productsRepo.create(copy);
    return created(res, item);
  } catch (e) {
    next(e);
  }
}
