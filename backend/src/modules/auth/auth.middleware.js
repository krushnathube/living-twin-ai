import { authService } from './auth.service.js';
import { fail } from '../../utils/apiResponse.js';

// Route guard. Not applied to the public demo endpoints by default; attach where needed.
export const requireAuth = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return fail(res, 'Missing token', [], 401);
  try { req.user = authService.verify(token); next(); }
  catch { return fail(res, 'Invalid or expired token', [], 401); }
};
