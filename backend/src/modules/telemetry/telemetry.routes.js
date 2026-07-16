import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { telemetryService } from './telemetry.service.js';

const router = Router();
// GET /api/telemetry — latest sample for every vehicle
router.get('/', asyncHandler(async (_req, res) => ok(res, { latest: telemetryService.snapshotLatest() })));
// GET /api/telemetry/:vehicleId — recent history (in-memory ring / DB-backed)
router.get('/:vehicleId', asyncHandler(async (req, res) =>
  ok(res, { vehicleId: req.params.vehicleId, history: telemetryService.getHistory(req.params.vehicleId) })));
export default router;
