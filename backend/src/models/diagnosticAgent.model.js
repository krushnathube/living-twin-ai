import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'diagnostic_agents'. Extend fields/associations as the domain grows.
export const defineDiagnosticAgent = (sequelize) =>
  sequelize.define('DiagnosticAgent', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    key:{type:DataTypes.STRING(32),unique:true},
    name:{type:DataTypes.STRING(64)},
    domain:{type:DataTypes.STRING(48)},
    enabled:{type:DataTypes.BOOLEAN,defaultValue:true}
  }, {tableName:'diagnostic_agents',timestamps:true,underscored:true});
