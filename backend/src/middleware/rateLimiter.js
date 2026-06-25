import rateLimit from 'express-rate-limit';

// In a serverless environment (Netlify Functions) there is no TCP socket, so
// `req.ip` is undefined. Derive a client key from the forwarded headers Netlify
// sets, and disable the IP validation that would otherwise throw.
function clientKey(req) {
  return (
    req.headers['x-nf-client-connection-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.ip ||
    'anonymous'
  );
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKey,
  validate: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKey,
  validate: false,
  message: { success: false, message: 'Too many auth attempts, try again later' },
});
