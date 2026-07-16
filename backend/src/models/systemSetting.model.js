import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'system_settings'. Extend fields/associations as the domain grows.
export const defineSystemSetting = (sequelize) =>
  sequelize.define('SystemSetting', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    key:{type:DataTypes.STRING(64),unique:true},
    value:{type:DataTypes.JSON}
  }, {tableName:'system_settings',timestamps:true,underscored:true});
