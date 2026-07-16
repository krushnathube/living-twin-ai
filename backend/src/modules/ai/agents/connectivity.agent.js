import { rnd, ri, round } from '../../../utils/random.js';
// Specialist agent: Connectivity. Independently analyses an incident from its domain.
export const connectivityAgent = {
  key: 'connectivity',
  name: 'Connectivity',
  domain: 'network',
  analyze(ctx) {
    const d = { ...(ctx.latest || {}), ...(ctx.faultTelemetry || {}) };
    const probe = d=>`Link dropped ${d.drops??ri(3,9)}× over ${d.net??'4G'}; signal ${d.signalStrength??ri(8,22)}%, packet loss ${d.packetLoss??ri(8,28)}%.`;
    return { agentKey: 'connectivity', agentName: 'Connectivity', finding: probe(d), confidence: round(rnd(0.86, 0.98), 2) };
  },
};
