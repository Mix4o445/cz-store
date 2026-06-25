import { z } from 'zod';
import { brandsRepo } from '../db/brands.repo.js';
import { ok, created } from '../utils/apiResponse.js';
import { badRequest, notFound } from '../utils/apiError.js';
import { isUuid } from '../utils/ids.js';

const brandSchema = z.object({
  name: z.string().min(1),
  logo: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  order: z.number().int().optional(),
});

export async function listBrands(_req, res, next) {
  try {
    const items = await brandsRepo.list();
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function createBrand(req, res, next) {
  try {
    const parsed = brandSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    const item = await brandsRepo.create(parsed.data);
    return created(res, item);
  } catch (e) {
    next(e);
  }
}

export async function updateBrand(req, res, next) {
  try {
    if (!isUuid(req.params.id)) throw notFound('Brand not found');
    const parsed = brandSchema.partial().safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    const item = await brandsRepo.updateById(req.params.id, parsed.data);
    if (!item) throw notFound('Brand not found');
    return ok(res, item);
  } catch (e) {
    next(e);
  }
}

export async function removeBrand(req, res, next) {
  try {
    if (!isUuid(req.params.id)) throw notFound('Brand not found');
    const item = await brandsRepo.deleteById(req.params.id);
    if (!item) throw notFound('Brand not found');
    return ok(res, null, 'Deleted');
  } catch (e) {
    next(e);
  }
}
