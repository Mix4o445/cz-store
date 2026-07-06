import { Router } from 'express';
import { scrapeProduct } from '../controllers/scraper.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';
import { adminRequired } from '../middleware/admin.middleware.js';

const router = Router();

// Admin-only — used by the product form "Import from URL" button.
router.post('/product', authRequired, adminRequired, scrapeProduct);

export default router;
