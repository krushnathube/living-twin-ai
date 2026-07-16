import { rnd, ri, round } from '../../../utils/random.js';
// Specialist agent: Sensor Integrity. Independently analyses an incident from its domain.
export const sensorAgent = {
  key: 'sensor',
  name: 'Sensor Integrity',
  domain: 'sensing',
  analyze(ctx) {
    const d = { ...(ctx.latest || {}), ...(ctx.faultTelemetry || {}) };
    const probe = d=>`Sensor ${d.sid??('TLM-'+ri(100,400))} flatlined over ${d.frames??ri(50,120)} frames — stale, not zero: a feed fault, not a device fault.`;
    return { agentKey: 'sensor', agentName: 'Sensor Integrity', finding: probe(d), confidence: round(rnd(0.86, 0.98), 2) };
  },
};
