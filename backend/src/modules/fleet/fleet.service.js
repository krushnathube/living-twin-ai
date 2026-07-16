// Owns the in-memory fleet state (the source of truth for the live demo).
// Vehicles are persisted to the DB best-effort when one is connected.
import { config } from '../../config/index.js';
import { HEALTH } from '../../constants/index.js';
import { id, rnd, ri, pick } from '../../utils/random.js';

const MODELS = ['LT-eBus 12m', 'LT-Cargo 8t', 'LT-Van 3.5t', 'LT-Shuttle 6m'];
// A rough ring of coordinates around a metro area so the map looks alive.
const CENTER = { lat: 18.5204, lng: 73.8567 }; // Pune

class FleetService {
  constructor() { this.vehicles = new Map(); }

  seed(size = config.simulator.fleetSize) {
    for (let i = 0; i < size; i++) {
      const vid = id('HM');
      this.vehicles.set(vid, {
        id: vid,
        label: vid,
        model: pick(MODELS),
        region: 'west',
        health: HEALTH.HEALTHY,
        lat: CENTER.lat + rnd(-0.08, 0.08),
        lng: CENTER.lng + rnd(-0.08, 0.08),
        heading: rnd(0, 360),
        speed: rnd(20, 60),
        incidentId: null,
      });
    }
    return this.snapshot();
  }

  get(vid) { return this.vehicles.get(vid); }
  all() { return [...this.vehicles.values()]; }

  healthyVehicles() { return this.all().filter((v) => v.health === HEALTH.HEALTHY); }

  setHealth(vid, health, incidentId = undefined) {
    const v = this.vehicles.get(vid);
    if (!v) return;
    v.health = health;
    if (incidentId !== undefined) v.incidentId = incidentId;
  }

  // Nudge positions each tick so the fleet drifts across the map.
  move() {
    for (const v of this.vehicles.values()) {
      if (v.health === HEALTH.OFFLINE) continue;
      v.heading += rnd(-8, 8);
      const rad = (v.heading * Math.PI) / 180;
      const step = 0.0006 * (v.speed / 45);
      v.lat += Math.cos(rad) * step;
      v.lng += Math.sin(rad) * step;
      // keep them loosely bounded
      if (Math.abs(v.lat - CENTER.lat) > 0.1) v.heading += 180;
      if (Math.abs(v.lng - CENTER.lng) > 0.1) v.heading += 180;
    }
  }

  snapshot() {
    const counts = { healthy: 0, warning: 0, critical: 0, offline: 0, healing: 0 };
    const list = this.all().map((v) => {
      counts[v.health] = (counts[v.health] || 0) + 1;
      return { id: v.id, label: v.label, model: v.model, health: v.health, lat: +v.lat.toFixed(5), lng: +v.lng.toFixed(5), incidentId: v.incidentId };
    });
    return { vehicles: list, counts, total: list.length };
  }
}

export const fleetService = new FleetService();
