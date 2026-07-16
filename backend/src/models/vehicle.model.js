import { DataTypes } from 'sequelize';
// A connected asset in the fleet. Generic enough to represent any monitored unit.
export const defineVehicle = (sequelize) =>
  sequelize.define('Vehicle', {
    id: { type: DataTypes.STRING(24), primaryKey: true },
    fleetId: { type: DataTypes.STRING(24), allowNull: true, field: 'fleet_id' },
    label: { type: DataTypes.STRING(64) },
    model: { type: DataTypes.STRING(64) },
    region: { type: DataTypes.STRING(48), defaultValue: 'west' },
    health: { type: DataTypes.STRING(16), defaultValue: 'healthy' },
    lat: { type: DataTypes.DOUBLE },
    lng: { type: DataTypes.DOUBLE },
  }, { tableName: 'vehicles', timestamps: true, paranoid: true, underscored: true, indexes: [{ fields: ['fleet_id'] }, { fields: ['health'] }] });
