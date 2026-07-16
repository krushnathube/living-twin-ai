import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok, fail } from '../../utils/apiResponse.js';
import { fleetService } from './fleet.service.js';
import { telemetryService } from '../telemetry/telemetry.service.js';

const router = Router();
// GET /api/fleet — full fleet snapshot (counts + vehicle list)
router.get('/', asyncHandler(async (_req, res) => ok(res, fleetService.snapshot())));
// GET /api/fleet/:id — single vehicle with latest + short history
router.get('/:id', asyncHandler(async (req, res) => {
  const v = fleetService.get(req.params.id);
  if (!v) return fail(res, 'Vehicle not found', [], 404);
  ok(res, { vehicle: v, latest: telemetryService.getLatest(v.id), history: telemetryService.getHistory(v.id) });
}));
export default router;
