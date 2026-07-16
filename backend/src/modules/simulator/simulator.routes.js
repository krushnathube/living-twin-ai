import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { FAULTS, faultKeys } from './faultProfiles.js';
import { boothLoop } from '../../orchestrator/boothLoop.js';

const router = Router();
// GET /api/simulator/faults — available fault scenarios
router.get('/faults', asyncHandler(async (_req, res) =>
  ok(res, { faults: faultKeys().map((k) => ({ key: k, label: FAULTS[k].label, severity: FAULTS[k].severity })) })));
// POST /api/simulator/inject { faultKey? } — inject an incident on demand (booth control)
router.post('/inject', asyncHandler(async (req, res) => {
  const result = await boothLoop.inject(req.body && req.body.faultKey);
  ok(res, result, 'Injection requested');
}));
export default router;
