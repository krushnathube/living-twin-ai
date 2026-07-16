import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'alert_history'. Extend fields/associations as the domain grows.
export const defineAlertHistory = (sequelize) =>
  sequelize.define('AlertHistory', {
    id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
    alertId:{type:DataTypes.STRING(24),field:'alert_id'},
    state:{type:DataTypes.STRING(24)},
    actor:{type:DataTypes.STRING(64)}
  }, {tableName:'alert_history',timestamps:true,underscored:true,indexes:[{fields:['alert_id']}]});
