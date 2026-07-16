import { Router } from 'express';
import { authService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';

const router = Router();
// POST /api/auth/login  { email, password }  (demo password: living-twin)
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const result = authService.login(email, password);
  ok(res, result, 'Logged in');
}));
export default router;
