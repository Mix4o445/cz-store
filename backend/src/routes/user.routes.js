import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware.js';
import {
  updateProfile,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/user.controller.js';

const router = Router();

router.put('/me', authRequired, updateProfile);
router.get('/me/addresses', authRequired, listAddresses);
router.post('/me/addresses', authRequired, addAddress);
router.put('/me/addresses/:id', authRequired, updateAddress);
router.delete('/me/addresses/:id', authRequired, deleteAddress);

export default router;
