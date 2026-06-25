import { ApiError } from '../utils/apiError.js';

export function notFoundHandler(req, res, _next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

function isDbUnavailable(err) {
  if (!err) return false;
  if (['MongooseServerSelectionError', 'MongoNotConnectedError'].includes(err.name)) return true;
  const msg = String(err.message || '');
  return /before initial connection is complete|client must be connected|topology was destroyed|ECONNREFUSED.*27017|server selection/i.test(
    msg
  );
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, message: err.message, details: err.details });
  }
  if (isDbUnavailable(err)) {
    return res.status(503).json({
      success: false,
      message: 'Service temporairement indisponible : la base de données est hors ligne. Démarrez MongoDB puis réessayez.',
      code: 'DB_UNAVAILABLE',
    });
  }
  // Mongoose duplicate key
  if (err?.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate key', details: err.keyValue });
  }
  // Mongoose validation
  if (err?.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation error', details: err.errors });
  }
  if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
  console.error('[error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
