import { Router } from 'express';
import {
  listProducts,
  getFeatured,
  getBySlug,
  createProduct,
  updateProduct,
  removeProduct,
  listTags,
  listByIds,
} from '../controllers/product.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';
import { adminRequired } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/', listProducts);
router.get('/tags', listTags);
router.get('/by-ids', listByIds);
router.get('/featured', getFeatured);
router.get('/:slug', getBySlug);

router.post('/', authRequired, adminRequired, createProduct);
router.put('/:id', authRequired, adminRequired, updateProduct);
router.delete('/:id', authRequired, adminRequired, removeProduct);

export default router;
