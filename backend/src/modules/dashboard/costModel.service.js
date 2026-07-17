// Defensible cost-avoidance model. Replaces the illustrative counter with a transparent
// calculation you can show (and edit live) in front of judges. Every input is stated and
// adjustable; the headline "cost avoided / yr" is derived, not hand-waved.
//
// Model:
//   annual_incidents      = fleet_size × faults_per_vehicle_per_month × 12
//   prevented_failures    = annual_incidents × prevention_rate
//   field_failure_avoided = prevented_failures × weighted_avg(per-fault field-failure cost)
//   downtime_avoided      = annual_incidents × (manual_MTTR − livingtwin_MTTR)h × downtime_$/h
//   total                 = field_failure_avoided + downtime_avoided
//
// Defaults are illustrative Indian/global commercial-fleet placeholders — replace with your
// own figures. All are editable at runtime via POST /api/dashboard/cost-model.
import { config } from '../../config/index.js';

const DEFAULTS = {
  fleetSize: config.simulator.fleetSize,     // vehicles under management
  faultsPerVehiclePerMonth: 0.8,             // developing faults detected per vehicle / month
  preventionRate: 0.35,                      // fraction that would have become field failures
  downtimeCostPerHour: 65,                   // USD, commercial vehicle out-of-service cost / hr
  manualMttrHours: 4.5,                      // typical manual detect→diagnose→dispatch→fix
  livingTwinMttrHours: 0.75,                 // guided remediation time with Living Twin
  // Field-failure cost avoided per fault type when caught early (USD):
  perFault: { BATTERY: 22000, MOTOR: 14000, BRAKE: 9000, CONNECT: 1200, SENSOR: 1500, TIRE: 2500 },
  // Relative frequency mix (weights) used for the weighted average:
  faultMix: { BATTERY: 1, MOTOR: 1, BRAKE: 0.8, CONNECT: 1.2, SENSOR: 1.2, TIRE: 1 },
};

const num = (v, d) => (v == null || Number.isNaN(+v) ? d : +v);

class CostModelService {
  constructor() { this.inputs = JSON.parse(JSON.stringify(DEFAULTS)); }

  update(patch = {}) {
    const i = this.inputs;
    i.fleetSize = num(patch.fleetSize, i.fleetSize);
    i.faultsPerVehiclePerMonth = num(patch.faultsPerVehiclePerMonth, i.faultsPerVehiclePerMonth);
    i.preventionRate = num(patch.preventionRate, i.preventionRate);
    i.downtimeCostPerHour = num(patch.downtimeCostPerHour, i.downtimeCostPerHour);
    i.manualMttrHours = num(patch.manualMttrHours, i.manualMttrHours);
    i.livingTwinMttrHours = num(patch.livingTwinMttrHours, i.livingTwinMttrHours);
    if (patch.perFault) i.perFault = { ...i.perFault, ...patch.perFault };
    if (patch.faultMix) i.faultMix = { ...i.faultMix, ...patch.faultMix };
    return this.compute();
  }
  reset() { this.inputs = JSON.parse(JSON.stringify(DEFAULTS)); return this.compute(); }

  weightedFieldAvoided() {
    const keys = Object.keys(this.inputs.perFault);
    const totalW = keys.reduce((s, k) => s + (this.inputs.faultMix[k] || 0), 0) || 1;
    return keys.reduce((s, k) => s + this.inputs.perFault[k] * ((this.inputs.faultMix[k] || 0) / totalW), 0);
  }

  compute() {
    const i = this.inputs;
    const annualIncidents = i.fleetSize * i.faultsPerVehiclePerMonth * 12;
    const preventedFailures = annualIncidents * i.preventionRate;
    const fieldAvoidedPer = this.weightedFieldAvoided();
    const fieldFailureAvoided = preventedFailures * fieldAvoidedPer;
    const downtimeHoursSavedPer = Math.max(0, i.manualMttrHours - i.livingTwinMttrHours);
    const downtimeAvoided = annualIncidents * downtimeHoursSavedPer * i.downtimeCostPerHour;
    const total = fieldFailureAvoided + downtimeAvoided;
    return {
      inputs: i,
      annualIncidents: Math.round(annualIncidents),
      preventedFailures: Math.round(preventedFailures),
      fieldAvoidedPerIncident: Math.round(fieldAvoidedPer),
      downtimeHoursSavedPerIncident: +downtimeHoursSavedPer.toFixed(2),
      breakdown: {
        fieldFailureAvoided: Math.round(fieldFailureAvoided),
        downtimeAvoided: Math.round(downtimeAvoided),
      },
      annualCostAvoidedUsd: Math.round(total),
      costAvoidedUsdM: +(total / 1e6).toFixed(2),
    };
  }
}
export const costModel = new CostModelService();
