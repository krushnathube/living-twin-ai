import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'fleets'. Extend fields/associations as the domain grows.
export const defineFleet = (sequelize) =>
  sequelize.define('Fleet', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    name:{type:DataTypes.STRING(96)},
    industry:{type:DataTypes.STRING(48),defaultValue:'connected_fleet'},
    region:{type:DataTypes.STRING(48)},
    operatorId:{type:DataTypes.STRING(24),field:'operator_id'}
  }, {tableName:'fleets',timestamps:true,paranoid:true,underscored:true});
