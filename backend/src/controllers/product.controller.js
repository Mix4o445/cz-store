import { z } from 'zod';
import mongoose from 'mongoose';
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { ok, created } from '../utils/apiResponse.js';
import { badRequest, notFound } from '../utils/apiError.js';

const specsSchema = z
  .object({
    capacity: z.string().optional().or(z.literal('')),
    energyClass: z.string().optional().or(z.literal('')),
    coverage: z.string().optional().or(z.literal('')),
    inverter: z.boolean().optional(),
    wifi: z.boolean().optional(),
    heating: z.boolean().optional(),
    noise: z.string().optional().or(z.literal('')),
    warranty: z.string().optional().or(z.literal('')),
  })
  .optional();

const variantSchema = z.object({
  capacity: z.string().min(1),
  price: z.number().nonnegative(),
  priceOld: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().optional().or(z.literal('')),
});

const productSchema = z
  .object({
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
    tags: z.array(z.string()).optional(),
    deliveryFee: z.number().nonnegative().optional(),
    variants: z.array(variantSchema).optional(),
  })
  .refine(
    (data) =>
      data.price !== undefined ||
      (Array.isArray(data.variants) && data.variants.length > 0),
    {
      message: 'Either a base price or at least one variant is required',
      path: ['price'],
    }
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
      q,
    } = req.query;

    const filter = {};
    if (brand) filter.brand = brand;
    if (category) {
      if (mongoose.isValidObjectId(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (!cat) return ok(res, { items: [], total: 0, page: Number(page), limit: Number(limit) });
        filter.category = cat._id;
      }
    }
    if (tag) filter.tags = tag.toLowerCase();
    if (promo === '1' || promo === 'true') filter.isPromo = true;
    if (featured === '1' || featured === 'true') filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    return ok(res, { items, total, page: Number(page), limit: Number(limit) });
  } catch (e) {
    next(e);
  }
}

export async function getFeatured(_req, res, next) {
  try {
    const items = await Product.find({ isFeatured: true }).limit(8);
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function listTags(_req, res, next) {
  try {
    const tags = await Product.distinct('tags');
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
      .filter((s) => mongoose.isValidObjectId(s));
    if (!ids.length) return ok(res, []);
    const items = await Product.find({ _id: { $in: ids } });
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function getBySlug(req, res, next) {
  try {
    const item = await Product.findOne({ slug: req.params.slug });
    if (!item) throw notFound('Product not found');
    return ok(res, item);
  } catch (e) {
    next(e);
  }
}

export async function createProduct(req, res, next) {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    if (parsed.data.tags) parsed.data.tags = parsed.data.tags.map((t) => t.toLowerCase().trim()).filter(Boolean);
    if (!parsed.data.category) delete parsed.data.category;
    deriveFromVariants(parsed.data);
    const item = await Product.create(parsed.data);
    return created(res, item);
  } catch (e) {
    next(e);
  }
}

export async function updateProduct(req, res, next) {
  try {
    // Updates use `partial`, so the top-level refine is skipped — but we still
    // want to derive price/stock from variants when admin only edits variants.
    const partialSchema = z.object({
      name: z.object({ fr: z.string().min(1), ar: z.string().optional().or(z.literal('')) }).optional(),
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
      tags: z.array(z.string()).optional(),
      deliveryFee: z.number().nonnegative().optional(),
      variants: z.array(variantSchema).optional(),
    });
    const parsed = partialSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    if (parsed.data.tags) parsed.data.tags = parsed.data.tags.map((t) => t.toLowerCase().trim()).filter(Boolean);
    if (parsed.data.category === '') delete parsed.data.category;
    deriveFromVariants(parsed.data);
    const item = await Product.findByIdAndUpdate(req.params.id, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!item) throw notFound('Product not found');
    return ok(res, item);
  } catch (e) {
    next(e);
  }
}

export async function removeProduct(req, res, next) {
  try {
    const item = await Product.findByIdAndDelete(req.params.id);
    if (!item) throw notFound('Product not found');
    return ok(res, null, 'Deleted');
  } catch (e) {
    next(e);
  }
}
