import { rnd, ri, round } from '../../../utils/random.js';
// Specialist agent: Thermal. Independently analyses an incident from its domain.
export const thermalAgent = {
  key: 'thermal',
  name: 'Thermal',
  domain: 'cooling',
  analyze(ctx) {
    const d = { ...(ctx.latest || {}), ...(ctx.faultTelemetry || {}) };
    const probe = d=>`Winding/coolant delta widening; motor ${d.motorTemp??ri(115,138)}°C, heat outpacing the cooling loop on current load.`;
    return { agentKey: 'thermal', agentName: 'Thermal', finding: probe(d), confidence: round(rnd(0.86, 0.98), 2) };
  },
};
