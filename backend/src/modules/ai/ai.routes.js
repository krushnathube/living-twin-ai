import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { AGENTS } from './agents/index.js';
import { boothLoop } from '../../orchestrator/boothLoop.js';

const router = Router();
// GET /api/ai/agents — the specialist council roster
router.get('/agents', asyncHandler(async (_req, res) =>
  ok(res, { agents: Object.values(AGENTS).map(({ key, name, domain }) => ({ key, name, domain })) })));
// GET /api/ai/sessions — active diagnostic sessions
router.get('/sessions', asyncHandler(async (_req, res) =>
  ok(res, { sessions: boothLoop.listSessions().map((s) => ({ id: s.id, vehicleId: s.vehicleId, faultLabel: s.faultLabel, status: s.status, synthesis: s.synthesis })) })));
export default router;
