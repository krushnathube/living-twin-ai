import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'activity_logs'. Extend fields/associations as the domain grows.
export const defineActivityLog = (sequelize) =>
  sequelize.define('ActivityLog', {
    id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
    actor:{type:DataTypes.STRING(64)},
    event:{type:DataTypes.STRING(64)},
    meta:{type:DataTypes.JSON}
  }, {tableName:'activity_logs',timestamps:true,underscored:true,indexes:[{fields:['actor']}]});
