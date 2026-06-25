import { verifyToken } from '../utils/generateToken.js';
import { unauthorized } from '../utils/apiError.js';

export function authRequired(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
    const token = bearer || req.cookies?.token;
    if (!token) throw unauthorized('Missing token');
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (e) {
    next(unauthorized('Invalid or expired token'));
  }
}

export function authOptional(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
    const token = bearer || req.cookies?.token;
    if (token) req.user = verifyToken(token);
  } catch {
    /* ignore */
  }
  next();
}
