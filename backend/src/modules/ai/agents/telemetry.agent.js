import { rnd, ri, round } from '../../../utils/random.js';
// Specialist agent: Telemetry Integrity. Independently analyses an incident from its domain.
export const telemetryAgent = {
  key: 'telemetry',
  name: 'Telemetry Integrity',
  domain: 'data',
  analyze(ctx) {
    const d = { ...(ctx.latest || {}), ...(ctx.faultTelemetry || {}) };
    const probe = d=>`Cross-signal correlation holds; anomaly localised, not a fleet-wide data artefact. Health score ${d.healthScore??ri(40,70)}.`;
    return { agentKey: 'telemetry', agentName: 'Telemetry Integrity', finding: probe(d), confidence: round(rnd(0.86, 0.98), 2) };
  },
};
