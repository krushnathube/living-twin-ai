import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'roles'. Extend fields/associations as the domain grows.
export const defineRole = (sequelize) =>
  sequelize.define('Role', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    key:{type:DataTypes.STRING(32),unique:true},
    name:{type:DataTypes.STRING(64)},
    description:{type:DataTypes.STRING(160)}
  }, {tableName:'roles',timestamps:true,underscored:true});
