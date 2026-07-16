// Model registry: imports every per-table model, initializes them against the
// Sequelize instance, and wires associations. Called only when a DB is connected.
import { defineVehicle } from './vehicle.model.js';
import { defineTelemetry } from './telemetry.model.js';
import { defineDiagnosticSession } from './diagnosticSession.model.js';
import { defineAgentResult } from './agentResult.model.js';
import { defineRecoveryHistory } from './recoveryHistory.model.js';
import { defineUser } from './user.model.js';
import { defineRole } from './role.model.js';
import { definePermission } from './permission.model.js';
import { defineFleet } from './fleet.model.js';
import { defineVehicleStatus } from './vehicleStatus.model.js';
import { defineTelemetryHistory } from './telemetryHistory.model.js';
import { defineAlert } from './alert.model.js';
import { defineAlertHistory } from './alertHistory.model.js';
import { defineDiagnosticAgent } from './diagnosticAgent.model.js';
import { defineRecoveryAction } from './recoveryAction.model.js';
import { defineAuditLog } from './auditLog.model.js';
import { defineNotification } from './notification.model.js';
import { defineSystemSetting } from './systemSetting.model.js';
import { defineSimulatorProfile } from './simulatorProfile.model.js';
import { defineSimulatorEvent } from './simulatorEvent.model.js';
import { defineHealthScore } from './healthScore.model.js';
import { defineRiskAssessment } from './riskAssessment.model.js';
import { defineIncidentReport } from './incidentReport.model.js';
import { defineDeviceConfiguration } from './deviceConfiguration.model.js';
import { defineApiKey } from './apiKey.model.js';
import { defineActivityLog } from './activityLog.model.js';

export const db = {};

export function initModels(sequelize) {
  db.Vehicle = defineVehicle(sequelize);
  db.Telemetry = defineTelemetry(sequelize);
  db.DiagnosticSession = defineDiagnosticSession(sequelize);
  db.AgentResult = defineAgentResult(sequelize);
  db.RecoveryHistory = defineRecoveryHistory(sequelize);
  db.User = defineUser(sequelize);
  db.Role = defineRole(sequelize);
  db.Permission = definePermission(sequelize);
  db.Fleet = defineFleet(sequelize);
  db.VehicleStatus = defineVehicleStatus(sequelize);
  db.TelemetryHistory = defineTelemetryHistory(sequelize);
  db.Alert = defineAlert(sequelize);
  db.AlertHistory = defineAlertHistory(sequelize);
  db.DiagnosticAgent = defineDiagnosticAgent(sequelize);
  db.RecoveryAction = defineRecoveryAction(sequelize);
  db.AuditLog = defineAuditLog(sequelize);
  db.Notification = defineNotification(sequelize);
  db.SystemSetting = defineSystemSetting(sequelize);
  db.SimulatorProfile = defineSimulatorProfile(sequelize);
  db.SimulatorEvent = defineSimulatorEvent(sequelize);
  db.HealthScore = defineHealthScore(sequelize);
  db.RiskAssessment = defineRiskAssessment(sequelize);
  db.IncidentReport = defineIncidentReport(sequelize);
  db.DeviceConfiguration = defineDeviceConfiguration(sequelize);
  db.ApiKey = defineApiKey(sequelize);
  db.ActivityLog = defineActivityLog(sequelize);

  // --- Associations ---
  db.Fleet.hasMany(db.Vehicle, { foreignKey: 'fleet_id' });
  db.Vehicle.belongsTo(db.Fleet, { foreignKey: 'fleet_id' });
  db.Vehicle.hasMany(db.Telemetry, { foreignKey: 'vehicle_id' });
  db.Telemetry.belongsTo(db.Vehicle, { foreignKey: 'vehicle_id' });
  db.Vehicle.hasMany(db.DiagnosticSession, { foreignKey: 'vehicle_id' });
  db.DiagnosticSession.belongsTo(db.Vehicle, { foreignKey: 'vehicle_id' });
  db.DiagnosticSession.hasMany(db.AgentResult, { foreignKey: 'session_id' });
  db.AgentResult.belongsTo(db.DiagnosticSession, { foreignKey: 'session_id' });
  db.DiagnosticSession.hasMany(db.RecoveryHistory, { foreignKey: 'session_id' });
  db.Role.hasMany(db.Permission, { foreignKey: 'role_id' });
  db.Role.hasMany(db.User, { foreignKey: 'role_id' });
  db.User.belongsTo(db.Role, { foreignKey: 'role_id' });

  return db;
}
