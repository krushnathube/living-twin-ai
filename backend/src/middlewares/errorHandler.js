import { logger } from '../config/logger.js';
import { fail } from '../utils/apiResponse.js';

// Centralized error handler — last middleware in the chain.
export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) logger.error('Unhandled error', { path: req.path, msg: err.message });
  fail(res, err.message || 'Internal server error', err.errors || [], status);
};

export const notFound = (req, res) =>
  fail(res, `Route not found: ${req.method} ${req.originalUrl}`, [], 404);
