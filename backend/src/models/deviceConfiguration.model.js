import { DataTypes } from 'sequelize';
// Auto-scaffolded model for 'device_configuration'. Extend fields/associations as the domain grows.
export const defineDeviceConfiguration = (sequelize) =>
  sequelize.define('DeviceConfiguration', {
    id:{type:DataTypes.STRING(24),primaryKey:true},
    vehicleId:{type:DataTypes.STRING(24),field:'vehicle_id'},
    firmware:{type:DataTypes.STRING(32)},
    sampleRateMs:{type:DataTypes.INTEGER,field:'sample_rate_ms'},
    config:{type:DataTypes.JSON}
  }, {tableName:'device_configuration',timestamps:true,underscored:true,indexes:[{fields:['vehicle_id']}]});
