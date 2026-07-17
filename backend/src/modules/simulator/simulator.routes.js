import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { FAULTS, faultKeys } from './faultProfiles.js';
import { simulatorService } from './simulator.service.js';
import { boothLoop } from '../../orchestrator/boothLoop.js';

const router = Router();

// GET /api/simulator/faults — available fault scenarios
router.get('/faults', asyncHandler(async (_req, res) =>
  ok(res, { faults: faultKeys().map((k) => ({ key: k, label: FAULTS[k].label, severity: FAULTS[k].severity })) })));

// GET /api/simulator/state — device control state for every vehicle (console bootstrap)
router.get('/state', asyncHandler(async (_req, res) => ok(res, { devices: simulatorService.getState(), auto: boothLoop.auto, autoApprove: boothLoop.autoApprove })));

// POST /api/simulator/inject { faultKey?, vehicleId? } — inject an AI incident
router.post('/inject', asyncHandler(async (req, res) => {
  const { faultKey, vehicleId } = req.body || {};
  ok(res, await boothLoop.inject(faultKey, vehicleId), 'Injection requested');
}));

// POST /api/simulator/auto-approve { enabled } — toggle AI recovery approval mode
router.post('/auto-approve', asyncHandler(async (req, res) =>
  ok(res, boothLoop.setAutoApprove(!!(req.body && req.body.enabled)), 'Auto-approve updated')));

// POST /api/simulator/random { enabled } — toggle random failures (auto loop)
router.post('/random', asyncHandler(async (req, res) =>
  ok(res, boothLoop.setRandom(!!(req.body && req.body.enabled)), 'Random failures updated')));

// POST /api/simulator/schedule { delayMs, faultKey?, vehicleId?, kind? } — scheduled failure
router.post('/schedule', asyncHandler(async (req, res) => {
  const { delayMs = 5000, faultKey, vehicleId, kind = 'incident' } = req.body || {};
  if (kind === 'device') { simulatorService.scheduleDeviceFault(vehicleId, faultKey, delayMs); return ok(res, { scheduled: true, kind, inMs: delayMs }, 'Device fault scheduled'); }
  ok(res, boothLoop.schedule(delayMs, faultKey, vehicleId), 'Incident scheduled');
}));

// ---- Per-device controls (console) ----
// POST /api/simulator/device/:id/mode { mode }  healthy|warning|critical|offline|auto
router.post('/device/:id/mode', asyncHandler(async (req, res) =>
  ok(res, simulatorService.setMode(req.params.id, (req.body || {}).mode), 'Mode set')));

// POST /api/simulator/device/:id/override { field, value }  (value null clears)
router.post('/device/:id/override', asyncHandler(async (req, res) => {
  const { field, value, clear } = req.body || {};
  if (clear) { simulatorService.clearOverrides(req.params.id); return ok(res, { cleared: true }, 'Overrides cleared'); }
  ok(res, simulatorService.setOverride(req.params.id, field, value), 'Override set');
}));

// POST /api/simulator/device/:id/fault { faultKey }  (simulator-level drift, no AI)
router.post('/device/:id/fault', asyncHandler(async (req, res) =>
  ok(res, simulatorService.setDeviceFault(req.params.id, (req.body || {}).faultKey), 'Device fault set')));

// POST /api/simulator/device/:id/incident { faultKey? }  (trigger the AI council on this device)
router.post('/device/:id/incident', asyncHandler(async (req, res) =>
  ok(res, await boothLoop.inject((req.body || {}).faultKey, req.params.id), 'AI incident triggered')));

// POST /api/simulator/device/:id/recover  (heal: approve AI session if any, else clear)
router.post('/device/:id/recover', asyncHandler(async (req, res) =>
  ok(res, await boothLoop.recoverVehicle(req.params.id, { approvedBy: 'Simulator Console' }), 'Recovery requested')));

export default router;
