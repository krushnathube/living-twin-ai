// Mounts every module's routes under /api. Adding a module = one line here.
import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import fleetRoutes from '../modules/fleet/fleet.routes.js';
import telemetryRoutes from '../modules/telemetry/telemetry.routes.js';
import aiRoutes from '../modules/ai/ai.routes.js';
import recoveryRoutes from '../modules/recovery/recovery.routes.js';
import simulatorRoutes from '../modules/simulator/simulator.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/fleet', fleetRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/ai', aiRoutes);
router.use('/recovery', recoveryRoutes);
router.use('/simulator', simulatorRoutes);
router.use('/dashboard', dashboardRoutes);
export default router;
