import { Router } from 'express';
import { listBrands, createBrand, updateBrand, removeBrand } from '../controllers/brand.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';
import { adminRequired } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/', listBrands);
router.post('/', authRequired, adminRequired, createBrand);
router.put('/:id', authRequired, adminRequired, updateBrand);
router.delete('/:id', authRequired, adminRequired, removeBrand);

export default router;
