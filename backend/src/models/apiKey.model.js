import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'api_keys'. Extend fields/associations as the domain grows.
export const defineApiKey = (sequelize) =>
  sequelize.define('ApiKey', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    label:{type:DataTypes.STRING(64)},
    hashedKey:{type:DataTypes.STRING(128),field:'hashed_key'},
    scopes:{type:DataTypes.JSON},
    revoked:{type:DataTypes.BOOLEAN,defaultValue:false}
  }, {tableName:'api_keys',timestamps:true,underscored:true});
