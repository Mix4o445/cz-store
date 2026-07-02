import { z } from 'zod';
import { ok } from '../utils/apiResponse.js';
import { badRequest, serviceUnavailable } from '../utils/apiError.js';
import { sendContactEmails } from '../services/email.service.js';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Nom requis').max(120),
  email: z.string().trim().toLowerCase().email('Email invalide').max(200),
  message: z.string().trim().min(5, 'Message trop court').max(5000),
});

// Very small in-memory rate limit so a single IP can't flood the inbox.
// Resets on process restart — good enough for a contact form.
const buckets = new Map(); // ip -> { count, resetAt }
const WINDOW_MS = 10 * 60 * 1000; // 10 min
const MAX_PER_WINDOW = 5;

function rateLimit(ip) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (b.count >= MAX_PER_WINDOW) return false;
  b.count += 1;
  return true;
}

export async function sendContactMessage(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || 'unknown';
    if (!rateLimit(ip)) {
      throw badRequest('Trop de messages envoyés. Réessayez dans quelques minutes.');
    }

    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const first =
        Object.values(flat.fieldErrors || {}).flat()[0] ||
        flat.formErrors?.[0] ||
        'Champs invalides';
      throw badRequest(first, flat);
    }

    await sendContactEmails(parsed.data);

    return ok(res, null, 'Message envoyé. Nous vous répondons sous 24h.');
  } catch (e) {
    if (e.statusCode === 400) return next(e);
    // Surface mail-server failures as 503 so the client can show a clear error
    next(serviceUnavailable('Le service de messagerie est momentanément indisponible.'));
  }
}
