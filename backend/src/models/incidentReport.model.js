import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'incident_reports'. Extend fields/associations as the domain grows.
export const defineIncidentReport = (sequelize) =>
  sequelize.define('IncidentReport', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    sessionId:{type:DataTypes.STRING(24),field:'session_id'},
    vehicleId:{type:DataTypes.STRING(24),field:'vehicle_id'},
    summary:{type:DataTypes.TEXT},
    businessImpact:{type:DataTypes.TEXT,field:'business_impact'}
  }, {tableName:'incident_reports',timestamps:true,paranoid:true,underscored:true,indexes:[{fields:['vehicle_id']}]});
