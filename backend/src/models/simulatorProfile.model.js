import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'simulator_profiles'. Extend fields/associations as the domain grows.
export const defineSimulatorProfile = (sequelize) =>
  sequelize.define('SimulatorProfile', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    name:{type:DataTypes.STRING(64)},
    faultKey:{type:DataTypes.STRING(32),field:'fault_key'},
    weight:{type:DataTypes.FLOAT,defaultValue:1},
    config:{type:DataTypes.JSON}
  }, {tableName:'simulator_profiles',timestamps:true,underscored:true});
