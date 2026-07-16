import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'vehicle_status'. Extend fields/associations as the domain grows.
export const defineVehicleStatus = (sequelize) =>
  sequelize.define('VehicleStatus', {
    id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
    vehicleId:{type:DataTypes.STRING(24),field:'vehicle_id'},
    health:{type:DataTypes.STRING(16)},
    healthScore:{type:DataTypes.FLOAT,field:'health_score'},
    note:{type:DataTypes.STRING(160)}
  }, {tableName:'vehicle_status',timestamps:true,underscored:true,indexes:[{fields:['vehicle_id']}]});
