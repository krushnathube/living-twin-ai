import { rnd, ri, round } from '../../../utils/random.js';
// Specialist agent: Powertrain. Independently analyses an incident from its domain.
export const powertrainAgent = {
  key: 'powertrain',
  name: 'Powertrain',
  domain: 'drivetrain',
  analyze(ctx) {
    const d = { ...(ctx.latest || {}), ...(ctx.faultTelemetry || {}) };
    const probe = d=>`Inverter draw ${d.batteryCurrent??ri(180,260)}A with torque ripple; efficiency down ${d.eff??round(rnd(4,12),1)}% versus this duty cycle's baseline.`;
    return { agentKey: 'powertrain', agentName: 'Powertrain', finding: probe(d), confidence: round(rnd(0.86, 0.98), 2) };
  },
};
