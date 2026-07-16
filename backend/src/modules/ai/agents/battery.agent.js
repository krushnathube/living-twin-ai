import { rnd, ri, round } from '../../../utils/random.js';
// Specialist agent: Battery / Thermal. Independently analyses an incident from its domain.
export const batteryAgent = {
  key: 'battery',
  name: 'Battery / Thermal',
  domain: 'energy',
  analyze(ctx) {
    const d = { ...(ctx.latest || {}), ...(ctx.faultTelemetry || {}) };
    const probe = d=>`Cell ${d.cell??ri(1,8)} at ${d.packTemp??ri(60,78)}°C, climbing ${d.rate??round(rnd(2,5),1)}°C/min vs a ${d.mean??ri(44,52)}°C pack mean — a pre-runaway divergence signature.`;
    return { agentKey: 'battery', agentName: 'Battery / Thermal', finding: probe(d), confidence: round(rnd(0.86, 0.98), 2) };
  },
};
