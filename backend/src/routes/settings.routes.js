import { Router } from 'express';
import { getMaintenance, setMaintenance } from '../controllers/settings.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';
import { adminRequired } from '../middleware/admin.middleware.js';

const router = Router();

// Public — read the current maintenance flag. The storefront calls this on
// app boot to decide whether to show the maintenance page.
router.get('/maintenance', getMaintenance);

// Admin only — toggle the flag or update the message.
router.put('/maintenance', authRequired, adminRequired, setMaintenance);

export default router;
