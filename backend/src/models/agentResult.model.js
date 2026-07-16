import { DataTypes } from 'sequelize';
// Finding produced by one specialist agent within a diagnostic session.
export const defineAgentResult = (sequelize) =>
  sequelize.define('AgentResult', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.STRING(24), allowNull: false, field: 'session_id' },
    agentKey: { type: DataTypes.STRING(32), field: 'agent_key' },
    agentName: { type: DataTypes.STRING(64), field: 'agent_name' },
    finding: { type: DataTypes.TEXT },
    confidence: { type: DataTypes.FLOAT },
  }, { tableName: 'agent_results', timestamps: true, underscored: true, indexes: [{ fields: ['session_id'] }] });
