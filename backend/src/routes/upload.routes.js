import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware.js';
import { adminRequired } from '../middleware/admin.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = Router();

router.post('/', authRequired, adminRequired, upload.single('image'), uploadImage);

export default router;
