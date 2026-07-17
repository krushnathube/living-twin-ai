// Programmatic DB bootstrap: upserts reference data (roles, users, agents, recovery
// actions, simulator profiles, settings) and optionally the current fleet. Idempotent.
import { db } from '../../models/index.js';
import { fleetService } from '../fleet/fleet.service.js';

const REFERENCE = {
  Role: [
    { id: 'ROLE-ADMIN', key: 'admin', name: 'Fleet Admin', description: 'Full access' },
    { id: 'ROLE-OPS', key: 'operator', name: 'Operator', description: 'Monitors + approves recovery' },
    { id: 'ROLE-VIEW', key: 'viewer', name: 'Viewer', description: 'Read-only' },
  ],
  Permission: [
    { id: 'PERM-1', roleId: 'ROLE-ADMIN', resource: '*', action: '*' },
    { id: 'PERM-2', roleId: 'ROLE-OPS', resource: 'recovery', action: 'approve' },
    { id: 'PERM-3', roleId: 'ROLE-OPS', resource: 'simulator', action: 'inject' },
    { id: 'PERM-5', roleId: 'ROLE-VIEW', resource: 'fleet', action: 'read' },
  ],
  User: [
    { id: 'U-ADMIN', email: 'admin@livingtwin.ai', passwordHash: '$2b$10$REPLACE_WITH_REAL_BCRYPT_HASH', name: 'Fleet Admin', roleId: 'ROLE-ADMIN', active: true },
    { id: 'U-OPS', email: 'operator@livingtwin.ai', passwordHash: '$2b$10$REPLACE_WITH_REAL_BCRYPT_HASH', name: 'Ops Operator', roleId: 'ROLE-OPS', active: true },
  ],
  DiagnosticAgent: [
    ['AG-BAT', 'battery', 'Battery / Thermal', 'energy'], ['AG-PWR', 'powertrain', 'Powertrain', 'drivetrain'],
    ['AG-CON', 'connectivity', 'Connectivity', 'network'], ['AG-THM', 'thermal', 'Thermal', 'cooling'],
    ['AG-SEN', 'sensor', 'Sensor Integrity', 'sensing'], ['AG-SAF', 'safety', 'Safety Systems', 'safety'],
    ['AG-CHS', 'chassis', 'Chassis / Tyres', 'chassis'], ['AG-TEL', 'telemetry', 'Telemetry Integrity', 'data'],
  ].map(([id, key, name, domain]) => ({ id, key, name, domain, enabled: true })),
  RecoveryAction: [
    ['RA-BAT', 'BATTERY', 'Throttle & isolate pack'], ['RA-MOT', 'MOTOR', 'Torque cap & cooling'],
    ['RA-CON', 'CONNECT', 'Store-and-forward failover'], ['RA-SEN', 'SENSOR', 'Channel re-sync'],
    ['RA-BRK', 'BRAKE', 'Regen blend reduction'], ['RA-TIR', 'TIRE', 'Speed cap & reroute'],
  ].map(([id, faultKey, label]) => ({ id, faultKey, label, requiresApproval: true })),
  SimulatorProfile: [
    ['SP-BAT', 'Battery thermal divergence', 'BATTERY', 1.0], ['SP-MOT', 'Drive motor overtemp', 'MOTOR', 1.0],
    ['SP-CON', 'IoT connectivity loss', 'CONNECT', 1.2], ['SP-SEN', 'Telematics sensor dropout', 'SENSOR', 1.2],
    ['SP-BRK', 'Regen brake anomaly', 'BRAKE', 0.8], ['SP-TIR', 'Tyre pressure loss', 'TIRE', 1.0],
  ].map(([id, name, faultKey, weight]) => ({ id, name, faultKey, weight })),
  SystemSetting: [
    { id: 'SET-FLEET', key: 'fleet_size', value: 50 }, { id: 'SET-AUTO', key: 'auto_approve', value: true },
    { id: 'SET-INT', key: 'sim_interval_ms', value: 2000 },
  ],
};

export async function runBootstrap({ seedFleet = false } = {}) {
  if (!db.Role) return { ok: false, reason: 'DB not connected — set DB_HOST and redeploy.' };
  const counts = {};
  for (const [model, rows] of Object.entries(REFERENCE)) {
    for (const row of rows) await db[model].upsert(row);
    counts[model] = rows.length;
  }
  if (seedFleet && db.Vehicle) {
    const fleet = fleetService.all();
    for (const v of fleet) {
      await db.Vehicle.upsert({ id: v.id, label: v.label, model: v.model, region: v.region, health: v.health, lat: v.lat, lng: v.lng });
      if (db.DeviceConfiguration) await db.DeviceConfiguration.upsert({ id: 'DC-' + v.id, vehicleId: v.id, firmware: 'fw-2.4.1', sampleRateMs: 2000, config: { protocol: 'mqtt' } });
    }
    counts.Vehicle = fleet.length; counts.DeviceConfiguration = fleet.length;
  }
  return { ok: true, seeded: counts };
}
