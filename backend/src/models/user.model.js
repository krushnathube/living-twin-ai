import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'users'. Extend fields/associations as the domain grows.
export const defineUser = (sequelize) =>
  sequelize.define('User', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    email:{type:DataTypes.STRING(128),unique:true,allowNull:false},
    passwordHash:{type:DataTypes.STRING(128),field:'password_hash'},
    name:{type:DataTypes.STRING(96)},
    roleId:{type:DataTypes.STRING(24),field:'role_id'},
    lastLoginAt:{type:DataTypes.DATE,field:'last_login_at'},
    active:{type:DataTypes.BOOLEAN,defaultValue:true}
  }, {tableName:'users',timestamps:true,paranoid:true,underscored:true});
