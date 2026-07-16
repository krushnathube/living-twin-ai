// Express app assembly: security middleware, JSON parsing, rate limiting, API routes,
// health check, 404 + centralized error handling.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { ok } from './utils/apiResponse.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false }));

  app.get('/health', (_req, res) => ok(res, { status: 'ok', env: config.env, db: config.db.enabled ? 'connected' : 'in-memory', ts: Date.now() }, 'healthy'));
  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
