// Fault library shared by the simulator (to drive telemetry drift), the AI council
// (to reason about), and the recovery engine (to heal). Adding an industry = adding
// entries here + agents; the platform core does not change.
import { rnd, ri, pick, round } from '../../utils/random.js';

export const FAULTS = {
  BATTERY: {
    label: 'Battery thermal divergence', severity: 'critical',
    agents: ['battery', 'powertrain', 'telemetry'],
    telemetry: () => ({ packTemp: ri(64, 79), batteryVoltage: round(rnd(320, 340), 1), batteryCurrent: ri(180, 240), cell: ri(1, 8), rate: round(rnd(2.4, 5.1), 1), mean: ri(44, 52) }),
    recovery: (d) => `Throttle charge to 0.5C, isolate cell group ${d.cell}, route to depot ${ri(3, 19)} for inspection.`,
    risk: 'Pack shutdown, vehicle stranded, warranty/recall exposure.',
    businessImpact: 'Prevents a stranded-vehicle event (~₹1.8L incident cost avoided).',
  },
  MOTOR: {
    label: 'Drive motor overtemp', severity: 'critical',
    agents: ['powertrain', 'thermal', 'telemetry'],
    telemetry: () => ({ motorTemp: ri(118, 140), batteryCurrent: ri(210, 290), eff: round(rnd(7, 14), 1) }),
    recovery: () => `Apply ${ri(12, 25)}% torque cap, raise coolant pump to max, re-profile route around the grade.`,
    risk: 'Thermal derate mid-route, possible motor damage, unplanned downtime.',
    businessImpact: 'Avoids mid-route breakdown and tow (~₹1.2L avoided).',
  },
  CONNECT: {
    label: 'IoT connectivity loss', severity: 'warning',
    agents: ['connectivity', 'telemetry', 'sensor'],
    telemetry: () => ({ signalStrength: ri(6, 22), packetLoss: ri(8, 28), drops: ri(3, 9), net: pick(['4G', '5G-NSA', 'roaming']) }),
    recovery: () => `Switch gateway to store-and-forward buffering, pin to strongest carrier, back-fill on reconnect.`,
    risk: 'Telemetry gaps, delayed incident detection on this vehicle.',
    businessImpact: 'Restores fleet visibility; avoids blind-spot risk.',
  },
  SENSOR: {
    label: 'Telematics sensor dropout', severity: 'warning',
    agents: ['sensor', 'connectivity', 'telemetry'],
    telemetry: () => ({ sensorVar: 0.0, frames: ri(50, 120), sid: 'TLM-' + ri(100, 400) }),
    recovery: (d) => `Force channel re-sync on ${d.sid}, fail over to redundant feed, flag OTA firmware check.`,
    risk: 'Blind spot in fleet visibility; downstream analytics act on stale data.',
    businessImpact: 'Keeps analytics trustworthy; avoids bad decisions on stale data.',
  },
  BRAKE: {
    label: 'Regen brake anomaly', severity: 'critical',
    agents: ['safety', 'powertrain', 'telemetry'],
    telemetry: () => ({ lag: ri(70, 130), expected: ri(20, 30), axle: pick(['front', 'rear']), delta: ri(6, 14) }),
    recovery: (d) => `Reduce regen blend, shift braking bias to friction on ${d.axle} axle, schedule brake-by-wire calibration.`,
    risk: 'Degraded braking feel; safety-critical — do not defer.',
    businessImpact: 'Mitigates a safety-critical fault before it reaches the driver.',
  },
  TIRE: {
    label: 'Tyre pressure loss', severity: 'warning',
    agents: ['chassis', 'safety', 'telemetry'],
    telemetry: () => ({ tyrePsi: ri(24, 30), leak: round(rnd(1.5, 4), 1), tyre: pick(['FL', 'FR', 'RL', 'RR']), eta: ri(25, 70) }),
    recovery: (d) => `Alert driver, cap speed to ${ri(60, 80)} km/h, route to service point within ${d.eta} min.`,
    risk: 'Pressure below safe threshold, blowout risk under load.',
    businessImpact: 'Avoids blowout and roadside incident (~₹60k avoided).',
  },
};

export const faultKeys = () => Object.keys(FAULTS);
