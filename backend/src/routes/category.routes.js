import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';
import { adminRequired } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/', listCategories);
router.post('/', authRequired, adminRequired, createCategory);
router.put('/:id', authRequired, adminRequired, updateCategory);
router.delete('/:id', authRequired, adminRequired, deleteCategory);

export default router;
