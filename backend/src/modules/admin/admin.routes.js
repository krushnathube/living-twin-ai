import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok, fail } from '../../utils/apiResponse.js';
import { runBootstrap } from './bootstrap.service.js';

const router = Router();
// POST /api/admin/bootstrap { seedFleet?, key } — upsert reference data (+ optional fleet)
router.post('/bootstrap', asyncHandler(async (req, res) => {
  const result = await runBootstrap({ seedFleet: !!(req.body && req.body.seedFleet) });
  if (!result.ok) return fail(res, result.reason, [], 409);
  ok(res, result, 'Bootstrap complete');
}));
export default router;
