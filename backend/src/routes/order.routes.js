import { Router } from 'express';
import {
  createOrder,
  listMyOrders,
  listAllOrders,
  getOrder,
  updateStatus,
} from '../controllers/order.controller.js';
import { authRequired, authOptional } from '../middleware/auth.middleware.js';
import { adminRequired } from '../middleware/admin.middleware.js';

const router = Router();

router.post('/', authRequired, createOrder);
router.get('/all', authRequired, adminRequired, listAllOrders);
router.get('/mine', authRequired, listMyOrders);
router.get('/:id', authRequired, getOrder);
router.put('/:id/status', authRequired, adminRequired, updateStatus);

export default router;
