import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'alerts'. Extend fields/associations as the domain grows.
export const defineAlert = (sequelize) =>
  sequelize.define('Alert', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    vehicleId:{type:DataTypes.STRING(24),field:'vehicle_id'},
    severity:{type:DataTypes.STRING(16)},
    code:{type:DataTypes.STRING(24)},
    message:{type:DataTypes.STRING(200)},
    acknowledged:{type:DataTypes.BOOLEAN,defaultValue:false}
  }, {tableName:'alerts',timestamps:true,underscored:true,indexes:[{fields:['vehicle_id']},{fields:['severity']}]});
