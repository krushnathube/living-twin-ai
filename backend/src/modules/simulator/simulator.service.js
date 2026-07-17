// Realistic IoT telemetry simulator. Imitates a fleet of connected devices publishing
// a rich telemetry frame every few seconds. The simulator OWNS each vehicle's health
// each tick, derived from: manual mode override -> healing window -> active AI incident
// -> manual device fault -> live thresholds (so console sliders actually drive state).
import { config } from '../../config/index.js';
import { HEALTH } from '../../constants/index.js';
import { bus } from '../../utils/bus.js';
import { rnd, ri, round, pick } from '../../utils/random.js';
import { fleetService } from '../fleet/fleet.service.js';
import { FAULTS } from './faultProfiles.js';

// Fault -> device fault code shown on the console (SPN-style codes for realism).
const FAULT_CODES = { BATTERY: 'BMS-P0A80', MOTOR: 'MOT-P0C49', CONNECT: 'NET-U029A',
  SENSOR: 'TLM-U0101', BRAKE: 'BRK-C1095', TIRE: 'TPMS-C0750' };

const WEATHER = ['clear', 'rain', 'heat', 'storm', 'fog'];
const ROADS = ['smooth', 'urban', 'rough', 'incline', 'highway'];
const TRIPS = ['idle', 'en_route', 'charging', 'maintenance'];

const FEED_LINES = [
  () => 'telemetry sync ok · pack balanced',
  () => `SoC ${ri(30, 95)}% · regen active`,
  () => `coolant ${ri(38, 52)}°C · nominal`,
  () => `MQTT heartbeat · ${ri(8, 40)}ms`,
  () => `GPS lock · ${ri(9, 14)} sats`,
  () => 'OTA check passed · fw current',
  () => 'geofence ok · on corridor',
];

// A full healthy device frame.
function healthyFrame(v) {
  const charging = Math.random() < 0.15;
  return {
    vehicleId: v.id,
    // energy
    batterySoc: round(rnd(45, 95)),
    batteryVoltage: round(rnd(360, 400), 1),
    batteryCurrent: round(rnd(40, 120)),
    packTemp: round(rnd(28, 42)),
    chargingState: charging ? 'charging' : 'discharging',
    powerConsumptionKw: round(rnd(8, 34), 1),
    // drivetrain / motion
    motorTemp: round(rnd(45, 78)),
    cabinTemp: round(rnd(21, 26)),
    speed: round(charging ? 0 : rnd(0, 62)),
    acceleration: round(rnd(-1.5, 1.8), 2),
    // location
    lat: round(v.lat, 5),
    lng: round(v.lng, 5),
    heading: round(v.heading),
    gpsSats: ri(9, 14),
    // connectivity
    connectivity: 'online',
    network: pick(['4G', '5G-NSA', '5G']),
    signalStrength: round(rnd(60, 95)),
    packetLoss: round(rnd(0, 2)),
    // compute
    cpu: round(rnd(12, 45)),
    memory: round(rnd(30, 62)),
    // status
    sensorStatus: 'ok',
    doorStatus: charging ? 'open' : 'closed',
    tyrePsi: round(rnd(32, 36)),
    tripStatus: charging ? 'charging' : pick(['idle', 'en_route', 'en_route']),
    // environment
    weatherImpact: pick(WEATHER),
    roadCondition: pick(ROADS),
    // rollups
    alerts: [],
    faultCodes: [],
    healthScore: round(rnd(96, 100)),
    stale: false,
    ts: Date.now(),
  };
}

// Blend a fault's telemetry signature into the frame + attach an alert/fault code.
function applyFault(frame, faultKey) {
  const f = FAULTS[faultKey];
  const d = f.telemetry();
  const m = { ...frame };
  if (d.packTemp) m.packTemp = d.packTemp;
  if (d.batteryVoltage) m.batteryVoltage = d.batteryVoltage;
  if (d.batteryCurrent) m.batteryCurrent = d.batteryCurrent;
  if (d.motorTemp) { m.motorTemp = d.motorTemp; m.cabinTemp = round(m.cabinTemp + rnd(2, 5)); }
  if (d.signalStrength != null) { m.signalStrength = d.signalStrength; m.connectivity = 'degraded'; }
  if (d.packetLoss != null) m.packetLoss = d.packetLoss;
  if (d.tyrePsi) m.tyrePsi = d.tyrePsi;
  if (faultKey === 'SENSOR') m.sensorStatus = 'fault';
  if (faultKey === 'CONNECT') { m.connectivity = 'degraded'; m.network = d.net || m.network; }
  m.powerConsumptionKw = round(m.powerConsumptionKw + rnd(3, 9), 1);
  m.faultCodes = [FAULT_CODES[faultKey]];
  m.alerts = [{ severity: f.severity, code: FAULT_CODES[faultKey], message: f.label }];
  m.healthScore = round(f.severity === 'critical' ? rnd(34, 60) : rnd(64, 82));
  m.faultKey = faultKey;
  return m;
}

// Live thresholds so console sliders (pinned fields) can push a device into warn/critical.
function bandFromFrame(s) {
  if (s.packTemp >= 60 || s.motorTemp >= 112 || s.batteryVoltage <= 300 || s.tyrePsi <= 26 || s.healthScore <= 55)
    return HEALTH.CRITICAL;
  if (s.packTemp >= 48 || s.motorTemp >= 92 || s.signalStrength <= 25 || s.packetLoss >= 15 || s.tyrePsi <= 30 || s.healthScore <= 82)
    return HEALTH.WARNING;
  return HEALTH.HEALTHY;
}

class SimulatorService {
  constructor() {
    this.timer = null;
    this.activeIncidents = new Map();   // vehicleId -> faultKey (driven by AI orchestrator)
    this.device = new Map();            // vehicleId -> { mode, overrides, fault } (console-driven)
    this.healingUntil = new Map();      // vehicleId -> ts
    this.deviceSchedules = [];          // [{ at, vehicleId, faultKey }]
  }

  dev(id) { if (!this.device.has(id)) this.device.set(id, { mode: null, overrides: {}, fault: null }); return this.device.get(id); }

  // --- AI-orchestrator hooks ---
  registerIncident(vehicleId, faultKey) { this.activeIncidents.set(vehicleId, faultKey); }
  clearIncident(vehicleId) { this.activeIncidents.delete(vehicleId); }
  markHealing(vehicleId, ms = 1400) { this.healingUntil.set(vehicleId, Date.now() + ms); }

  // --- Console controls ---
  setMode(id, mode) { const d = this.dev(id); d.mode = mode === 'auto' || mode === 'clear' ? null : mode; if (d.mode !== HEALTH.OFFLINE) {} return d; }
  setOverride(id, field, value) { const d = this.dev(id); if (value === null || value === undefined || value === '') delete d.overrides[field]; else d.overrides[field] = Number(value); return d; }
  clearOverrides(id) { this.dev(id).overrides = {}; }
  setDeviceFault(id, faultKey) { const d = this.dev(id); d.fault = FAULTS[faultKey] ? faultKey : null; return d; }
  clearDevice(id) { const d = this.dev(id); d.mode = null; d.overrides = {}; d.fault = null; this.activeIncidents.delete(id); this.markHealing(id); }
  scheduleDeviceFault(vehicleId, faultKey, delayMs) { this.deviceSchedules.push({ at: Date.now() + delayMs, vehicleId, faultKey }); }

  start() { if (this.timer) return; this.timer = setInterval(() => this.tick(), config.simulator.intervalMs); }
  stop() { clearInterval(this.timer); this.timer = null; }

  tick() {
    fleetService.move();
    const now = Date.now();

    // fire due device-level scheduled faults
    for (const s of this.deviceSchedules.filter((x) => now >= x.at)) this.setDeviceFault(s.vehicleId, s.faultKey);
    this.deviceSchedules = this.deviceSchedules.filter((x) => now < x.at);

    const batch = [];
    for (const v of fleetService.all()) {
      const d = this.dev(v.id);
      let frame = healthyFrame(v);

      // 1) active AI incident drift
      const incFault = this.activeIncidents.get(v.id);
      if (incFault) frame = applyFault(frame, incFault);
      // 2) console device fault drift
      else if (d.fault) frame = applyFault(frame, d.fault);

      // 3) manual field overrides (sliders) win
      for (const [k, val] of Object.entries(d.overrides)) frame[k] = val;

      // 4) offline handling
      const healing = (this.healingUntil.get(v.id) || 0) > now;
      let health;
      if (d.mode === HEALTH.OFFLINE) {
        health = HEALTH.OFFLINE;
        frame.connectivity = 'offline'; frame.signalStrength = 0; frame.packetLoss = 100;
        frame.tripStatus = 'offline'; frame.speed = 0; frame.stale = true; frame.healthScore = 0;
        frame.alerts = [{ severity: 'critical', code: 'NET-OFFLINE', message: 'Device unreachable' }];
        frame.faultCodes = ['NET-OFFLINE'];
      } else if (d.mode) {
        health = d.mode;               // forced band
      } else if (healing) {
        health = HEALTH.HEALING;
      } else if (incFault || d.fault) {
        health = (FAULTS[incFault || d.fault].severity === 'critical') ? HEALTH.CRITICAL : HEALTH.WARNING;
      } else {
        health = bandFromFrame(frame); // threshold-driven (sliders)
      }

      // decorate alerts for forced/threshold bands without an explicit fault
      if (!frame.alerts.length && (health === HEALTH.WARNING || health === HEALTH.CRITICAL)) {
        frame.alerts = [{ severity: health === HEALTH.CRITICAL ? 'critical' : 'warning', code: 'THRESH', message: 'Telemetry threshold breach' }];
        frame.faultCodes = ['THRESH'];
      }

      frame.health = health;
      fleetService.setHealth(v.id, health, incFault ? v.incidentId : v.incidentId);
      if (health !== HEALTH.OFFLINE) batch.push(frame);
      else batch.push(frame); // still emit offline frame so console shows it
    }

    bus.emit('telemetry:batch', batch);
    if (Math.random() < 0.9) {
      const v = pick(fleetService.all());
      bus.emit('feed', { level: 'ok', vehicleId: v.id, text: pick(FEED_LINES)(), ts: Date.now() });
    }
  }

  // Snapshot of device control state (for the console on load).
  getState() {
    return fleetService.all().map((v) => {
      const d = this.dev(v.id);
      return { vehicleId: v.id, model: v.model, mode: d.mode, fault: d.fault, overrides: d.overrides, health: v.health };
    });
  }
}

export const simulatorService = new SimulatorService();
