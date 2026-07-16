// Entry point: init DB (optional), seed the fleet, wire sockets, start the simulator
// and the orchestrator booth loop, then listen.
import http from 'http';
import { config } from './src/config/index.js';
import { logger } from './src/config/logger.js';
import { createApp } from './src/app.js';
import { initDatabase } from './src/database/index.js';
import { initSocket } from './src/socket/index.js';
import { fleetService } from './src/modules/fleet/fleet.service.js';
import { simulatorService } from './src/modules/simulator/simulator.service.js';
import { boothLoop } from './src/orchestrator/boothLoop.js';

async function main() {
  await initDatabase();                 // no-op / fallback if RDS not configured
  fleetService.seed();                  // create the in-memory fleet
  logger.info('Fleet seeded', { size: fleetService.all().length });

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);                   // attach socket.io + bus bridge

  simulatorService.start();             // begin telemetry stream
  boothLoop.start();                    // begin detect->diagnose->approve->heal loop

  server.listen(config.port, () => logger.info(`Living Twin backend on :${config.port}`, { db: config.db.enabled ? 'rds' : 'in-memory' }));

  const shutdown = () => { simulatorService.stop(); boothLoop.stop(); server.close(() => process.exit(0)); };
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
}

main().catch((e) => { logger.error('fatal boot error', { msg: e.message }); process.exit(1); });
