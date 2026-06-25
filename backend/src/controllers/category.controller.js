import { categoriesRepo } from '../db/categories.repo.js';
import { ok, created } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { isUuid } from '../utils/ids.js';

export async function listCategories(_req, res, next) {
  try {
    const items = await categoriesRepo.list();
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function createCategory(req, res, next) {
  try {
    const item = await categoriesRepo.create(req.body);
    return created(res, item);
  } catch (e) {
    next(e);
  }
}

export async function updateCategory(req, res, next) {
  try {
    if (!isUuid(req.params.id)) throw new ApiError(404, 'Category not found');
    const item = await categoriesRepo.updateById(req.params.id, req.body);
    if (!item) throw new ApiError(404, 'Category not found');
    return ok(res, item, 'Updated');
  } catch (e) {
    next(e);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    if (!isUuid(req.params.id)) throw new ApiError(404, 'Category not found');
    const item = await categoriesRepo.deleteById(req.params.id);
    if (!item) throw new ApiError(404, 'Category not found');
    return ok(res, { _id: item._id }, 'Deleted');
  } catch (e) {
    next(e);
  }
}
