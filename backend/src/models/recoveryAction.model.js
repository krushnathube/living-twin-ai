import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'recovery_actions'. Extend fields/associations as the domain grows.
export const defineRecoveryAction = (sequelize) =>
  sequelize.define('RecoveryAction', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    faultKey:{type:DataTypes.STRING(32),field:'fault_key'},
    label:{type:DataTypes.STRING(96)},
    steps:{type:DataTypes.JSON},
    requiresApproval:{type:DataTypes.BOOLEAN,defaultValue:true,field:'requires_approval'}
  }, {tableName:'recovery_actions',timestamps:true,underscored:true,indexes:[{fields:['fault_key']}]});
