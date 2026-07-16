// Orchestrator — the closed loop: Observe -> Detect -> Diagnose -> Recommend ->
// (Human) Approve -> Heal -> Monitor. Holds active sessions and schedules incidents.
import { config } from '../config/index.js';
import { HEALTH, INCIDENT_STATUS } from '../constants/index.js';
import { bus } from '../utils/bus.js';
import { id, ri, pick } from '../utils/random.js';
import { fleetService } from '../modules/fleet/fleet.service.js';
import { simulatorService } from '../modules/simulator/simulator.service.js';
import { FAULTS, faultKeys } from '../modules/simulator/faultProfiles.js';
import { councilService } from '../modules/ai/council.service.js';
import { recoveryService } from '../modules/recovery/recovery.service.js';
import { metricsService } from '../modules/dashboard/metrics.service.js';
import { telemetryService } from '../modules/telemetry/telemetry.service.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class BoothLoop {
  constructor() {
    this.sessions = new Map();  // sessionId -> session
    this.nextAt = 0;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.nextAt = Date.now() + 3500;
    this.tick();
  }
  stop() { this.running = false; }

  activeCount() { return [...this.sessions.values()].filter((s) => s.status !== INCIDENT_STATUS.RESOLVED).length; }

  async tick() {
    if (!this.running) return;
    if (this.activeCount() === 0 && Date.now() >= this.nextAt) {
      await this.openIncident();
    }
    setTimeout(() => this.tick(), 500);
  }

  // Manually inject a fault (used by the simulator API). faultKey optional.
  async inject(faultKey) {
    if (this.activeCount() > 0) return { skipped: true, reason: 'incident in progress' };
    return this.openIncident(faultKey);
  }

  async openIncident(forcedKey) {
    const faultKey = forcedKey && FAULTS[forcedKey] ? forcedKey : pick(faultKeys());
    const fault = FAULTS[faultKey];
    const candidates = fleetService.healthyVehicles();
    const vehicle = pick(candidates.length ? candidates : fleetService.all());
    const sessionId = id('SESS');

    simulatorService.registerIncident(vehicle.id, faultKey);
    fleetService.setHealth(vehicle.id, fault.severity === 'critical' ? HEALTH.CRITICAL : HEALTH.WARNING, sessionId);

    const session = {
      id: sessionId, vehicleId: vehicle.id, faultKey, faultLabel: fault.label,
      severity: fault.severity, status: INCIDENT_STATUS.DETECTED, t0: Date.now(),
      faultTelemetry: fault.telemetry(), synthesis: null,
    };
    this.sessions.set(sessionId, session);
    metricsService.setActiveIncidents(this.activeCount());

    bus.emit('incident:open', {
      sessionId, vehicleId: vehicle.id, faultLabel: fault.label, severity: fault.severity,
      agents: fault.agents, anomalyScore: (ri(72, 97) / 100), detectedAt: Date.now(),
    });
    bus.emit('feed', { level: fault.severity === 'critical' ? 'bad' : 'warn', vehicleId: vehicle.id, text: `${fault.label.toLowerCase()} detected` });

    await this.diagnose(session);
  }

  async diagnose(session) {
    session.status = INCIDENT_STATUS.DIAGNOSING;
    const ctx = { faultKey: session.faultKey, faultTelemetry: session.faultTelemetry, latest: telemetryService.getLatest(session.vehicleId) };
    const { results, synthesis } = await councilService.diagnose(ctx);
    session.synthesis = synthesis;

    // Stream each specialist finding with a short delay so the council looks "live".
    for (const r of results) {
      if (!this.sessions.has(session.id)) return;
      bus.emit('incident:agent', { sessionId: session.id, ...r });
      await sleep(650);
    }

    bus.emit('incident:diagnosis', { sessionId: session.id, ...synthesis });
    session.status = INCIDENT_STATUS.AWAITING_APPROVAL;
    bus.emit('incident:await_approval', { sessionId: session.id, vehicleId: session.vehicleId, recommendedAction: synthesis.recommendedAction });

    // Human-in-the-loop. Booth mode auto-approves after a pause; disabling it means an
    // operator must call POST /api/recovery/:sessionId/approve.
    if (config.simulator.autoApprove) {
      session.autoTimer = setTimeout(() => this.approve(session.id, { approvedBy: 'auto-operator', autoApproved: true }), config.simulator.autoApproveDelayMs);
    }
  }

  async approve(sessionId, { approvedBy = 'operator', autoApproved = false } = {}) {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === INCIDENT_STATUS.RESOLVED) return { ok: false, reason: 'no active session' };
    if (session.autoTimer) clearTimeout(session.autoTimer);
    session.status = INCIDENT_STATUS.HEALING;

    const record = await recoveryService.execute(session, { approvedBy, autoApproved });
    session.status = INCIDENT_STATUS.RESOLVED;

    bus.emit('incident:healed', {
      sessionId, vehicleId: session.vehicleId, durationSeconds: record.durationSeconds,
      approvedBy, autoApproved, faultLabel: session.faultLabel,
    });
    metricsService.onResolved(record.durationSeconds, session.severity);
    metricsService.setActiveIncidents(this.activeCount());

    // schedule the next incident and retire this session
    this.nextAt = Date.now() + ri(config.simulator.incidentMinGapMs, config.simulator.incidentMaxGapMs);
    setTimeout(() => this.sessions.delete(sessionId), 5000);
    return { ok: true, record };
  }

  getSession(id) { return this.sessions.get(id) || null; }
  listSessions() { return [...this.sessions.values()]; }
}

export const boothLoop = new BoothLoop();
