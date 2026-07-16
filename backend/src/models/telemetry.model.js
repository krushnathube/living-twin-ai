import { DataTypes } from 'sequelize';
// One telemetry sample from a vehicle. High-write table — index on (vehicle_id, created_at).
export const defineTelemetry = (sequelize) =>
  sequelize.define('Telemetry', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.STRING(24), allowNull: false, field: 'vehicle_id' },
    batterySoc: { type: DataTypes.FLOAT, field: 'battery_soc' },
    batteryVoltage: { type: DataTypes.FLOAT, field: 'battery_voltage' },
    batteryCurrent: { type: DataTypes.FLOAT, field: 'battery_current' },
    packTemp: { type: DataTypes.FLOAT, field: 'pack_temp' },
    motorTemp: { type: DataTypes.FLOAT, field: 'motor_temp' },
    cabinTemp: { type: DataTypes.FLOAT, field: 'cabin_temp' },
    speed: { type: DataTypes.FLOAT },
    signalStrength: { type: DataTypes.FLOAT, field: 'signal_strength' },
    packetLoss: { type: DataTypes.FLOAT, field: 'packet_loss' },
    tyrePsi: { type: DataTypes.FLOAT, field: 'tyre_psi' },
    healthScore: { type: DataTypes.FLOAT, field: 'health_score' },
    raw: { type: DataTypes.JSON },
  }, { tableName: 'telemetry', timestamps: true, underscored: true, indexes: [{ fields: ['vehicle_id', 'created_at'] }] });
