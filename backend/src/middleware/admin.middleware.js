import { forbidden } from '../utils/apiError.js';

export function adminRequired(req, _res, next) {
  if (req.user?.role !== 'admin') return next(forbidden('Admin only'));
  next();
}
