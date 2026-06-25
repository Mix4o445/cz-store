import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware.js';
import { adminRequired } from '../middleware/admin.middleware.js';
import { listUsers, setUserRole, dashboardStats } from '../controllers/admin.controller.js';

const router = Router();

router.use(authRequired, adminRequired);

router.get('/dashboard', dashboardStats);
router.get('/users', listUsers);
router.put('/users/:id/role', setUserRole);

export default router;
