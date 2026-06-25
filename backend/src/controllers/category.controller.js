import { Category } from '../models/Category.model.js';
import { ok, created } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function listCategories(_req, res, next) {
  try {
    const items = await Category.find().sort({ order: 1, createdAt: 1 });
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function createCategory(req, res, next) {
  try {
    const item = await Category.create(req.body);
    return created(res, item);
  } catch (e) {
    next(e);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const item = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) throw new ApiError(404, 'Category not found');
    return ok(res, item, 'Updated');
  } catch (e) {
    next(e);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const item = await Category.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, 'Category not found');
    return ok(res, { _id: item._id }, 'Deleted');
  } catch (e) {
    next(e);
  }
}
