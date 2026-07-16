import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'risk_assessments'. Extend fields/associations as the domain grows.
export const defineRiskAssessment = (sequelize) =>
  sequelize.define('RiskAssessment', {
    id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
    sessionId:{type:DataTypes.STRING(24),field:'session_id'},
    score:{type:DataTypes.FLOAT},
    factors:{type:DataTypes.JSON}
  }, {tableName:'risk_assessments',timestamps:true,underscored:true,indexes:[{fields:['session_id']}]});
