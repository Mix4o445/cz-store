import { z } from 'zod';
import mongoose from 'mongoose';
import { Review } from '../models/Review.model.js';
import { Product } from '../models/Product.model.js';
import { ok, created } from '../utils/apiResponse.js';
import { badRequest, notFound, forbidden } from '../utils/apiError.js';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().or(z.literal('')),
});

/** Recompute product.rating and product.numReviews after a review change. */
async function recompute(productId) {
  const agg = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
}

export async function listProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) throw badRequest('Invalid productId');

    const reviews = await Review.find({ product: productId })
      .sort('-createdAt')
      .populate('user', 'name');

    let mine = null;
    if (req.user?.sub) {
      mine = reviews.find((r) => r.user?._id?.toString() === req.user.sub) ?? null;
    }

    return ok(res, { reviews, mine });
  } catch (e) {
    next(e);
  }
}

export async function upsertReview(req, res, next) {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) throw badRequest('Invalid productId');

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());

    const product = await Product.findById(productId).select('_id');
    if (!product) throw notFound('Product not found');

    const review = await Review.findOneAndUpdate(
      { user: req.user.sub, product: productId },
      { $set: { rating: parsed.data.rating, comment: parsed.data.comment ?? '' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('user', 'name');

    await recompute(productId);
    return created(res, review, 'Review saved');
  } catch (e) {
    next(e);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw badRequest('Invalid review id');

    const review = await Review.findById(id);
    if (!review) throw notFound('Review not found');

    if (req.user?.role !== 'admin' && review.user?.toString() !== req.user?.sub) {
      throw forbidden();
    }

    const productId = review.product;
    await review.deleteOne();
    await recompute(productId);
    return ok(res, null, 'Review deleted');
  } catch (e) {
    next(e);
  }
}
