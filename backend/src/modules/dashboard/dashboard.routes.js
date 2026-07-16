import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { metricsService } from './metrics.service.js';
import { fleetService } from '../fleet/fleet.service.js';
import { boothLoop } from '../../orchestrator/boothLoop.js';

const router = Router();
// GET /api/dashboard/metrics — headline KPIs
router.get('/metrics', asyncHandler(async (_req, res) => ok(res, metricsService.snapshot())));
// GET /api/dashboard/overview — everything a fresh dashboard needs in one call
router.get('/overview', asyncHandler(async (_req, res) => ok(res, {
  metrics: metricsService.snapshot(),
  fleet: fleetService.snapshot(),
  activeSessions: boothLoop.listSessions().length,
})));
export default router;
