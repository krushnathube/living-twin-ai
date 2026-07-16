import { DataTypes } from 'sequelize';
// Audit record of a recovery execution (who approved, what ran, outcome).
export const defineRecoveryHistory = (sequelize) =>
  sequelize.define('RecoveryHistory', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.STRING(24), field: 'session_id' },
    vehicleId: { type: DataTypes.STRING(24), field: 'vehicle_id' },
    action: { type: DataTypes.TEXT },
    approvedBy: { type: DataTypes.STRING(64), field: 'approved_by' },
    autoApproved: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'auto_approved' },
    outcome: { type: DataTypes.STRING(24), defaultValue: 'healed' },
    durationSeconds: { type: DataTypes.FLOAT, field: 'duration_seconds' },
  }, { tableName: 'recovery_history', timestamps: true, underscored: true, indexes: [{ fields: ['vehicle_id'] }] });
