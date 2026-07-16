import { rnd, ri, round } from '../../../utils/random.js';
// Specialist agent: Chassis / Tyres. Independently analyses an incident from its domain.
export const chassisAgent = {
  key: 'chassis',
  name: 'Chassis / Tyres',
  domain: 'chassis',
  analyze(ctx) {
    const d = { ...(ctx.latest || {}), ...(ctx.faultTelemetry || {}) };
    const probe = d=>`${d.tyre??'FL'} tyre at ${d.tyrePsi??ri(24,30)} psi, bleeding ${d.leak??round(rnd(1.5,4),1)} psi/hr — below safe threshold in ~${d.eta??ri(25,70)} min.`;
    return { agentKey: 'chassis', agentName: 'Chassis / Tyres', finding: probe(d), confidence: round(rnd(0.86, 0.98), 2) };
  },
};
