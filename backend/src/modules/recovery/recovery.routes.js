import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok, fail } from '../../utils/apiResponse.js';
import { boothLoop } from '../../orchestrator/boothLoop.js';

const router = Router();
// POST /api/recovery/:sessionId/approve — human-in-the-loop approval that triggers healing
router.post('/:sessionId/approve', asyncHandler(async (req, res) => {
  const approvedBy = (req.user && req.user.name) || (req.body && req.body.approvedBy) || 'operator';
  const result = await boothLoop.approve(req.params.sessionId, { approvedBy, autoApproved: false });
  if (!result.ok) return fail(res, result.reason || 'Approval failed', [], 409);
  ok(res, result.record, 'Recovery approved and executed');
}));
export default router;
