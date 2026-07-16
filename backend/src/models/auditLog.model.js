import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'audit_logs'. Extend fields/associations as the domain grows.
export const defineAuditLog = (sequelize) =>
  sequelize.define('AuditLog', {
    id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
    actor:{type:DataTypes.STRING(64)},
    action:{type:DataTypes.STRING(48)},
    resource:{type:DataTypes.STRING(48)},
    resourceId:{type:DataTypes.STRING(48),field:'resource_id'},
    meta:{type:DataTypes.JSON}
  }, {tableName:'audit_logs',timestamps:true,underscored:true,indexes:[{fields:['actor']},{fields:['resource']}]});
