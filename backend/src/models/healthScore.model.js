import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'health_scores'. Extend fields/associations as the domain grows.
export const defineHealthScore = (sequelize) =>
  sequelize.define('HealthScore', {
    id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
    vehicleId:{type:DataTypes.STRING(24),field:'vehicle_id'},
    score:{type:DataTypes.FLOAT},
    band:{type:DataTypes.STRING(16)}
  }, {tableName:'health_scores',timestamps:true,underscored:true,indexes:[{fields:['vehicle_id']}]});
