import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'permissions'. Extend fields/associations as the domain grows.
export const definePermission = (sequelize) =>
  sequelize.define('Permission', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    roleId:{type:DataTypes.STRING(24),field:'role_id'},
    resource:{type:DataTypes.STRING(48)},
    action:{type:DataTypes.STRING(24)}
  }, {tableName:'permissions',timestamps:true,underscored:true,indexes:[{fields:['role_id']}]});
