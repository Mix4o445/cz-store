import { z } from 'zod';
import { reviewsRepo } from '../db/reviews.repo.js';
import { productsRepo } from '../db/products.repo.js';
import { ok, created } from '../utils/apiResponse.js';
import { badRequest, notFound, forbidden } from '../utils/apiError.js';
import { isUuid } from '../utils/ids.js';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().or(z.literal('')),
});

/** Recompute product.rating and product.numReviews after a review change. */
async function recompute(productId) {
  const { avg, count } = await reviewsRepo.statsForProduct(productId);
  await productsRepo.setRating(productId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
}

export async function listProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    if (!isUuid(productId)) throw badRequest('Invalid productId');

    const reviews = await reviewsRepo.listByProduct(productId);

    let mine = null;
    if (req.user?.sub) {
      mine = reviews.find((r) => String(r.user?._id ?? r.user) === req.user.sub) ?? null;
    }

    return ok(res, { reviews, mine });
  } catch (e) {
    next(e);
  }
}

export async function upsertReview(req, res, next) {
  try {
    const { productId } = req.params;
    if (!isUuid(productId)) throw badRequest('Invalid productId');

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());

    const product = await productsRepo.byId(productId);
    if (!product) throw notFound('Product not found');

    const review = await reviewsRepo.upsert({
      userId: req.user.sub,
      productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? '',
    });

    await recompute(productId);
    return created(res, review, 'Review saved');
  } catch (e) {
    next(e);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw badRequest('Invalid review id');

    const review = await reviewsRepo.byId(id);
    if (!review) throw notFound('Review not found');

    const ownerId = review.user?._id ?? review.user;
    if (req.user?.role !== 'admin' && String(ownerId) !== req.user?.sub) {
      throw forbidden();
    }

    const productId = review.product;
    await reviewsRepo.deleteById(id);
    await recompute(productId);
    return ok(res, null, 'Review deleted');
  } catch (e) {
    next(e);
  }
}
