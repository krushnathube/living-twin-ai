// Agent registry — add an agent here to make it available to the council.
import { batteryAgent } from './battery.agent.js';
import { powertrainAgent } from './powertrain.agent.js';
import { connectivityAgent } from './connectivity.agent.js';
import { thermalAgent } from './thermal.agent.js';
import { sensorAgent } from './sensor.agent.js';
import { safetyAgent } from './safety.agent.js';
import { chassisAgent } from './chassis.agent.js';
import { telemetryAgent } from './telemetry.agent.js';

export const AGENTS = {
  battery: batteryAgent,
  powertrain: powertrainAgent,
  connectivity: connectivityAgent,
  thermal: thermalAgent,
  sensor: sensorAgent,
  safety: safetyAgent,
  chassis: chassisAgent,
  telemetry: telemetryAgent,
};
