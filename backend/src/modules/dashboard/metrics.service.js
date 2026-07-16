// Aggregate operational metrics shown on the dashboard. Updated on every resolution.
import { bus } from '../../utils/bus.js';
import { fleetService } from '../fleet/fleet.service.js';

class MetricsService {
  constructor() {
    this.state = {
      mttrSeconds: 8.4,
      faultsDiagnosed: 1204,
      failuresPrevented: 37,
      costAvoidedCr: 1.24,   // ₹ crore (illustrative baseline — replace with real figure)
      activeIncidents: 0,
      fleetHealthPct: 98.4,
    };
  }

  onResolved(durationSeconds, severity) {
    this.state.faultsDiagnosed += 1;
    if (severity === 'critical') this.state.failuresPrevented += 1;
    this.state.mttrSeconds = +(this.state.mttrSeconds * 0.8 + durationSeconds * 0.2).toFixed(1);
    this.state.costAvoidedCr = +(this.state.costAvoidedCr + (severity === 'critical' ? 0.03 : 0.01)).toFixed(2);
    this.recomputeFleetHealth();
    this.emit();
  }

  setActiveIncidents(n) { this.state.activeIncidents = n; this.recomputeFleetHealth(); this.emit(); }

  recomputeFleetHealth() {
    const snap = fleetService.snapshot();
    const healthy = snap.counts.healthy || 0;
    this.state.fleetHealthPct = +((healthy / Math.max(1, snap.total)) * 100).toFixed(1);
    this.state.operatorRatio = `1 : ${snap.total}`;
  }

  emit() { bus.emit('metrics', this.snapshot()); }
  snapshot() { this.recomputeFleetHealth(); return { ...this.state }; }
}

export const metricsService = new MetricsService();
