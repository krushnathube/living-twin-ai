// Recovery engine. Executes an approved recovery: transitions the vehicle back to
// healthy, records an audit trail, and (best-effort) persists history. The engine is
// invoked only AFTER human (or booth auto) approval — never autonomously mid-diagnosis.
import { HEALTH } from '../../constants/index.js';
import { bus } from '../../utils/bus.js';
import { logger } from '../../config/logger.js';
import { config } from '../../config/index.js';
import { fleetService } from '../fleet/fleet.service.js';
import { simulatorService } from '../simulator/simulator.service.js';

class RecoveryService {
  async execute(session, { approvedBy = 'operator', autoApproved = false } = {}) {
    const v = fleetService.get(session.vehicleId);
    if (!v) return null;

    fleetService.setHealth(session.vehicleId, HEALTH.HEALING, session.id);
    simulatorService.clearIncident(session.vehicleId);

    const durationSeconds = Math.max(2.1, (Date.now() - session.t0) / 1000);

    // Settle back to healthy shortly after applying the fix (visual heal window).
    setTimeout(() => {
      fleetService.setHealth(session.vehicleId, HEALTH.HEALTHY, null);
    }, 1400);

    const record = {
      sessionId: session.id, vehicleId: session.vehicleId,
      action: session.synthesis.recommendedAction, approvedBy, autoApproved,
      outcome: 'healed', durationSeconds: +durationSeconds.toFixed(1),
    };
    if (config.db.enabled) this.persist(session, record).catch(() => {});
    bus.emit('recovery:done', record);
    return record;
  }

  async persist(session, record) {
    try {
      const { db } = await import('../../models/index.js');
      if (db.RecoveryHistory) await db.RecoveryHistory.create(record);
      if (db.DiagnosticSession) {
        await db.DiagnosticSession.update(
          { status: 'resolved', resolvedAt: new Date(), mttrSeconds: record.durationSeconds, approvedBy: record.approvedBy },
          { where: { id: session.id } },
        );
      }
    } catch (e) { logger.debug('recovery persist skipped', { msg: e.message }); }
  }
}

export const recoveryService = new RecoveryService();
