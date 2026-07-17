// Socket.io transport. Subscribes to the domain event bus and forwards live events to
// all connected dashboards. New clients get an immediate snapshot so they're never blank.
import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { SOCKET_EVENTS } from '../constants/index.js';
import { bus } from '../utils/bus.js';
import { fleetService } from '../modules/fleet/fleet.service.js';
import { telemetryService } from '../modules/telemetry/telemetry.service.js';
import { metricsService } from '../modules/dashboard/metrics.service.js';
import { incidentLog } from '../modules/dashboard/incidentLog.service.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: config.corsOrigin, methods: ['GET', 'POST'] } });

  io.on('connection', (socket) => {
    logger.info('client connected', { id: socket.id });
    socket.emit(SOCKET_EVENTS.FLEET_SNAPSHOT, fleetService.snapshot());
    socket.emit(SOCKET_EVENTS.METRICS, metricsService.snapshot());
    socket.emit(SOCKET_EVENTS.TELEMETRY, telemetryService.snapshotLatest());
    socket.emit(SOCKET_EVENTS.INCIDENTS, incidentLog.list());
    socket.on('disconnect', () => logger.info('client disconnected', { id: socket.id }));
  });

  // Bridge domain events -> socket events.
  const fwd = (busEvent, socketEvent, map = (x) => x) => bus.on(busEvent, (p) => io.emit(socketEvent, map(p)));

  fwd('telemetry:batch', SOCKET_EVENTS.TELEMETRY);
  fwd('feed', SOCKET_EVENTS.FEED);
  fwd('incident:open', SOCKET_EVENTS.INCIDENT_OPEN);
  fwd('incident:agent', SOCKET_EVENTS.AGENT_RESULT);
  fwd('incident:diagnosis', SOCKET_EVENTS.DIAGNOSIS);
  fwd('incident:await_approval', SOCKET_EVENTS.AWAIT_APPROVAL);
  fwd('incident:healed', SOCKET_EVENTS.HEALED);
  fwd('metrics', SOCKET_EVENTS.METRICS);

  // Re-broadcast the fleet snapshot on every telemetry tick so map colors stay in sync.
  bus.on('telemetry:batch', () => io.emit(SOCKET_EVENTS.FLEET_SNAPSHOT, fleetService.snapshot()));

  return io;
}
