import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { metricsService } from './metrics.service.js';
import { fleetService } from '../fleet/fleet.service.js';
import { boothLoop } from '../../orchestrator/boothLoop.js';
import { incidentLog } from './incidentLog.service.js';
import { costModel } from './costModel.service.js';

const router = Router();
// GET /api/dashboard/metrics — headline KPIs
router.get('/metrics', asyncHandler(async (_req, res) => ok(res, metricsService.snapshot())));
// GET /api/dashboard/overview — everything a fresh dashboard needs in one call
router.get('/overview', asyncHandler(async (_req, res) => ok(res, {
  metrics: metricsService.snapshot(),
  fleet: fleetService.snapshot(),
  activeSessions: boothLoop.listSessions().length,
  recentIncidents: incidentLog.list(),
})));

// GET /api/dashboard/incidents — recently resolved incidents (timeline)
router.get('/incidents', asyncHandler(async (_req, res) => ok(res, { incidents: incidentLog.list() })));

// GET /api/dashboard/cost-model — current inputs + computed cost-avoidance breakdown
router.get('/cost-model', asyncHandler(async (_req, res) => ok(res, costModel.compute())));

// POST /api/dashboard/cost-model — update inputs (what-if); recomputes + pushes the headline live
router.post('/cost-model', asyncHandler(async (req, res) => {
  const result = (req.body && req.body.reset) ? costModel.reset() : costModel.update(req.body || {});
  metricsService.emit(); // broadcast the new headline to all dashboards
  ok(res, result, 'Cost model updated');
}));
export default router;
