import { Router } from 'express';
import { sendContactMessage } from '../controllers/contact.controller.js';

const router = Router();

// Public — anyone (including the storefront contact form) can submit a
// message. The controller applies a small in-memory rate limit so a single
// IP can't spam the inbox.
router.post('/', sendContactMessage);

export default router;
