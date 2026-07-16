// AI Diagnostic Council: runs the relevant specialist agents for a fault, then a
// supervisor synthesizes their findings into an explainable diagnosis. The council
// never executes fixes — it only reasons and recommends (human-in-the-loop).
import { AGENTS } from './agents/index.js';
import { FAULTS } from '../simulator/faultProfiles.js';
import { llmDiagnose } from './llm.provider.js';
import { rnd, ri, round } from '../../utils/random.js';

class CouncilService {
  // Which agents engage for a given fault.
  agentsFor(faultKey) {
    const f = FAULTS[faultKey];
    return f.agents.map((k) => AGENTS[k]).filter(Boolean);
  }

  // Run each specialist independently. Returns findings in order.
  runAgents(ctx) {
    return this.agentsFor(ctx.faultKey).map((agent) => agent.analyze(ctx));
  }

  // Supervisor synthesis: combine findings into a single diagnosis with governance fields.
  synthesize(faultKey, agentResults) {
    const f = FAULTS[faultKey];
    const d = f.telemetry();
    const confidence = round((agentResults.reduce((s, a) => s + a.confidence, 0) / Math.max(1, agentResults.length)) * 100, 0);
    const riskScore = f.severity === 'critical' ? ri(72, 94) : ri(38, 66);
    const mttrEstimate = f.severity === 'critical' ? round(rnd(3, 6), 1) : round(rnd(2, 4), 1);
    return {
      faultKey,
      faultLabel: f.label,
      severity: f.severity,
      rootCause: this.rootCause(faultKey, d),
      recommendedAction: f.recovery(d),
      riskNote: f.risk,
      confidence,
      riskScore,
      mttrEstimate,
      businessImpact: f.businessImpact,
      recoveryData: d,
    };
  }

  rootCause(faultKey, d) {
    const map = {
      BATTERY: `Cell group ${d.cell} is entering thermal divergence under fast-charge — heat is outpacing the pack's ability to dissipate it; left alone this cascades to a pack-level fault within minutes.`,
      MOTOR: `Drive motor is overheating under sustained torque — winding temperature is rising faster than the cooling loop can shed it on the current gradient/load.`,
      CONNECT: `The vehicle gateway is flapping between cells in a low-coverage corridor — repeated reconnects drop buffered telemetry before it reaches the platform.`,
      SENSOR: `Sensor ${d.sid} is reporting stale frames — the reading is frozen, not zero, pointing to a feed/serialisation fault upstream rather than a failed device.`,
      BRAKE: `Regenerative braking on the ${d.axle} axle responds slow with a widening command/feedback gap — an actuator or calibration drift, not yet a hydraulic fallback.`,
      TIRE: `${d.tyre} tyre is losing pressure at a steady rate — a slow leak, not a blowout; ride height and rolling resistance are already drifting.`,
    };
    return map[faultKey] || 'Anomaly localised to a single subsystem; see specialist findings.';
  }

  // Full diagnosis. Uses the live LLM when configured, else the built-in engine.
  async diagnose(ctx) {
    const results = this.runAgents(ctx);
    const synthesis = this.synthesize(ctx.faultKey, results);
    const llm = await llmDiagnose({
      fault: FAULTS[ctx.faultKey], faultKey: ctx.faultKey,
      agentNames: results.map((r) => r.agentName), telemetry: ctx.faultTelemetry,
    });
    if (llm) {
      if (Array.isArray(llm.agents) && llm.agents.length) {
        llm.agents.forEach((a, i) => { if (results[i]) results[i].finding = a.finding || results[i].finding; });
      }
      synthesis.rootCause = llm.rootCause || synthesis.rootCause;
      synthesis.recommendedAction = llm.recommendedAction || synthesis.recommendedAction;
      synthesis.riskNote = llm.riskNote || synthesis.riskNote;
      if (llm.confidence) synthesis.confidence = llm.confidence;
      synthesis.engine = 'live-llm';
    } else {
      synthesis.engine = 'built-in';
    }
    return { results, synthesis };
  }
}

export const councilService = new CouncilService();
