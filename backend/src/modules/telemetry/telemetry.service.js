// Live telemetry engine: keeps a bounded in-memory ring buffer of recent samples per
// vehicle (for instant history/playback) and persists to the DB best-effort.
import { bus } from '../../utils/bus.js';
import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';

const RING = 120; // ~4 min at 2s cadence

class TelemetryService {
  constructor() {
    this.latest = new Map();          // vehicleId -> last sample
    this.history = new Map();         // vehicleId -> sample[]
    bus.on('telemetry:batch', (batch) => this.ingest(batch));
  }

  ingest(batch) {
    for (const s of batch) {
      this.latest.set(s.vehicleId, s);
      const arr = this.history.get(s.vehicleId) || [];
      arr.push(s);
      if (arr.length > RING) arr.shift();
      this.history.set(s.vehicleId, arr);
    }
    if (config.db.enabled) this.persist(batch).catch(() => {});
  }

  async persist(batch) {
    // Best-effort bulk insert; never blocks the live stream.
    try {
      const { db } = await import('../../models/index.js');
      if (!db.Telemetry) return;
      await db.Telemetry.bulkCreate(batch.map((s) => ({
        vehicleId: s.vehicleId, batterySoc: s.batterySoc, batteryVoltage: s.batteryVoltage,
        batteryCurrent: s.batteryCurrent, packTemp: s.packTemp, motorTemp: s.motorTemp,
        cabinTemp: s.cabinTemp, speed: s.speed, signalStrength: s.signalStrength,
        packetLoss: s.packetLoss, tyrePsi: s.tyrePsi, healthScore: s.healthScore, raw: s,
      })));
    } catch (e) { logger.debug('telemetry persist skipped', { msg: e.message }); }
  }

  getLatest(vehicleId) { return this.latest.get(vehicleId) || null; }
  getHistory(vehicleId) { return this.history.get(vehicleId) || []; }
  snapshotLatest() { return [...this.latest.values()]; }
}

export const telemetryService = new TelemetryService();
