import { DataTypes } from 'sequelize';
// One incident lifecycle: detection → diagnosis → approval → heal.
export const defineDiagnosticSession = (sequelize) =>
  sequelize.define('DiagnosticSession', {
    id: { type: DataTypes.STRING(24), primaryKey: true },
    vehicleId: { type: DataTypes.STRING(24), allowNull: false, field: 'vehicle_id' },
    faultKey: { type: DataTypes.STRING(32), field: 'fault_key' },
    faultLabel: { type: DataTypes.STRING(96), field: 'fault_label' },
    severity: { type: DataTypes.STRING(16) },
    status: { type: DataTypes.STRING(24), defaultValue: 'detected' },
    rootCause: { type: DataTypes.TEXT, field: 'root_cause' },
    recommendedAction: { type: DataTypes.TEXT, field: 'recommended_action' },
    riskNote: { type: DataTypes.TEXT, field: 'risk_note' },
    confidence: { type: DataTypes.FLOAT },
    mttrSeconds: { type: DataTypes.FLOAT, field: 'mttr_seconds' },
    approvedBy: { type: DataTypes.STRING(64), field: 'approved_by' },
    resolvedAt: { type: DataTypes.DATE, field: 'resolved_at' },
  }, { tableName: 'diagnostic_sessions', timestamps: true, paranoid: true, underscored: true, indexes: [{ fields: ['vehicle_id'] }, { fields: ['status'] }] });
