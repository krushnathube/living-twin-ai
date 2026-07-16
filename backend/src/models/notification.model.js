import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'notifications'. Extend fields/associations as the domain grows.
export const defineNotification = (sequelize) =>
  sequelize.define('Notification', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    channel:{type:DataTypes.STRING(24)},
    target:{type:DataTypes.STRING(128)},
    subject:{type:DataTypes.STRING(160)},
    body:{type:DataTypes.TEXT},
    status:{type:DataTypes.STRING(24),defaultValue:'queued'}
  }, {tableName:'notifications',timestamps:true,underscored:true,indexes:[{fields:['status']}]});
