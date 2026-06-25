import { Router } from 'express';
import { authRequired, authOptional } from '../middleware/auth.middleware.js';
import {
  listProductReviews,
  upsertReview,
  deleteReview,
} from '../controllers/review.controller.js';

const router = Router();

router.get('/product/:productId', authOptional, listProductReviews);
router.post('/product/:productId', authRequired, upsertReview);
router.delete('/:id', authRequired, deleteReview);

export default router;
