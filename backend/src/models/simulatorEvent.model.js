import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'simulator_events'. Extend fields/associations as the domain grows.
export const defineSimulatorEvent = (sequelize) =>
  sequelize.define('SimulatorEvent', {
    id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
    vehicleId:{type:DataTypes.STRING(24),field:'vehicle_id'},
    type:{type:DataTypes.STRING(32)},
    faultKey:{type:DataTypes.STRING(32),field:'fault_key'},
    payload:{type:DataTypes.JSON}
  }, {tableName:'simulator_events',timestamps:true,underscored:true,indexes:[{fields:['vehicle_id']}]});
