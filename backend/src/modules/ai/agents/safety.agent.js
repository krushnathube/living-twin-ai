import { rnd, ri, round } from '../../../utils/random.js';
// Specialist agent: Safety Systems. Independently analyses an incident from its domain.
export const safetyAgent = {
  key: 'safety',
  name: 'Safety Systems',
  domain: 'safety',
  analyze(ctx) {
    const d = { ...(ctx.latest || {}), ...(ctx.faultTelemetry || {}) };
    const probe = d=>`Actuator response ${d.lag??ri(70,130)}ms vs ${d.expected??ri(20,30)}ms spec; command/feedback delta ${d.delta??ri(6,14)}% on the ${d.axle??'front'} axle.`;
    return { agentKey: 'safety', agentName: 'Safety Systems', finding: probe(d), confidence: round(rnd(0.86, 0.98), 2) };
  },
};
