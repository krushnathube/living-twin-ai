// Realistic IoT telemetry simulator. Every tick it emits a plausible sample for each
// vehicle: healthy baselines with light noise, or fault-driven drift when the vehicle
// is under an active incident. This imitates a real device fleet publishing to MQTT.
import { config } from '../../config/index.js';
import { HEALTH } from '../../constants/index.js';
import { bus } from '../../utils/bus.js';
import { rnd, ri, round, pick } from '../../utils/random.js';
import { fleetService } from '../fleet/fleet.service.js';
import { FAULTS } from './faultProfiles.js';

const FEED_LINES = [
  () => 'telemetry sync ok · pack balanced',
  () => `SoC ${ri(30, 95)}% · regen active`,
  () => `coolant ${ri(38, 52)}°C · nominal`,
  () => `MQTT heartbeat · ${ri(8, 40)}ms`,
  () => `GPS lock · ${ri(9, 14)} sats`,
  () => 'OTA check passed · fw current',
  () => 'geofence ok · on corridor',
];

// Baseline healthy sample for a vehicle.
function healthySample(v) {
  return {
    vehicleId: v.id,
    batterySoc: round(rnd(45, 95)),
    batteryVoltage: round(rnd(350, 400), 1),
    batteryCurrent: round(rnd(40, 120)),
    packTemp: round(rnd(28, 42)),
    motorTemp: round(rnd(45, 75)),
    cabinTemp: round(rnd(21, 26)),
    speed: round(v.speed),
    signalStrength: round(rnd(60, 95)),
    packetLoss: round(rnd(0, 2)),
    tyrePsi: round(rnd(32, 36)),
    healthScore: round(rnd(96, 100)),
  };
}

// Blend fault telemetry into the sample for a vehicle under incident.
function applyFault(sample, incident) {
  const f = FAULTS[incident.faultKey];
  const d = incident.telemetry;
  const merged = { ...sample };
  if (d.packTemp) merged.packTemp = d.packTemp;
  if (d.batteryVoltage) merged.batteryVoltage = d.batteryVoltage;
  if (d.batteryCurrent) merged.batteryCurrent = d.batteryCurrent;
  if (d.motorTemp) merged.motorTemp = d.motorTemp;
  if (d.signalStrength) merged.signalStrength = d.signalStrength;
  if (d.packetLoss) merged.packetLoss = d.packetLoss;
  if (d.tyrePsi) merged.tyrePsi = d.tyrePsi;
  merged.healthScore = round(incident.severity === 'critical' ? rnd(38, 62) : rnd(66, 82));
  merged.faultKey = incident.faultKey;
  return merged;
}

class SimulatorService {
  constructor() { this.timer = null; this.activeIncidents = new Map(); } // vehicleId -> incident meta

  registerIncident(vehicleId, faultKey) {
    const f = FAULTS[faultKey];
    this.activeIncidents.set(vehicleId, { faultKey, severity: f.severity, telemetry: f.telemetry() });
  }
  clearIncident(vehicleId) { this.activeIncidents.delete(vehicleId); }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), config.simulator.intervalMs);
  }
  stop() { clearInterval(this.timer); this.timer = null; }

  tick() {
    fleetService.move();
    const batch = [];
    for (const v of fleetService.all()) {
      if (v.health === HEALTH.OFFLINE) continue;
      let sample = healthySample(v);
      const inc = this.activeIncidents.get(v.id);
      if (inc) sample = applyFault(sample, inc);
      sample.ts = Date.now();
      batch.push(sample);
    }
    // Emit a batched telemetry event (socket layer forwards; persistence writes).
    bus.emit('telemetry:batch', batch);

    // Occasional ambient feed line (healthy chatter) from a random vehicle.
    if (Math.random() < 0.9) {
      const v = pick(fleetService.all());
      bus.emit('feed', { level: 'ok', vehicleId: v.id, text: pick(FEED_LINES)() });
    }
  }
}

export const simulatorService = new SimulatorService();
