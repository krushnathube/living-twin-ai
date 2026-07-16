import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'telemetry_history'. Extend fields/associations as the domain grows.
export const defineTelemetryHistory = (sequelize) =>
  sequelize.define('TelemetryHistory', {
    id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
    vehicleId:{type:DataTypes.STRING(24),field:'vehicle_id'},
    bucket:{type:DataTypes.STRING(24)},
    aggregate:{type:DataTypes.JSON}
  }, {tableName:'telemetry_history',timestamps:true,underscored:true,indexes:[{fields:['vehicle_id','bucket']}]});
