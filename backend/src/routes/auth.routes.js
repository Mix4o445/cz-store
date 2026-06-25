import { Router } from 'express';
import { register, login, logout, me, changePassword } from '../controllers/auth.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authRequired, me);
router.put('/password', authRequired, changePassword);

export default router;
