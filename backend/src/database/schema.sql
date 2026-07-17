-- Living Twin AI — reference DDL (MySQL 8 / AWS RDS).
-- Sequelize sync() creates these automatically; this file is for manual provisioning/review.
-- All tables carry created_at, updated_at; soft-deletable tables also carry deleted_at.

-- Create/select the database (RDS users often create the DB via the console instead):
CREATE DATABASE IF NOT EXISTS hm_living_twin_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hm_living_twin_ai;

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(24) PRIMARY KEY, `key` VARCHAR(32) UNIQUE, name VARCHAR(64), description VARCHAR(160),
  created_at DATETIME, updated_at DATETIME
);
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(24) PRIMARY KEY, role_id VARCHAR(24), resource VARCHAR(48), action VARCHAR(24),
  created_at DATETIME, updated_at DATETIME, INDEX(role_id)
);
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(24) PRIMARY KEY, email VARCHAR(128) UNIQUE NOT NULL, password_hash VARCHAR(128),
  name VARCHAR(96), role_id VARCHAR(24), last_login_at DATETIME, active BOOLEAN DEFAULT TRUE,
  created_at DATETIME, updated_at DATETIME, deleted_at DATETIME
);
CREATE TABLE IF NOT EXISTS fleets (
  id VARCHAR(24) PRIMARY KEY, name VARCHAR(96), industry VARCHAR(48) DEFAULT 'connected_fleet',
  region VARCHAR(48), operator_id VARCHAR(24), created_at DATETIME, updated_at DATETIME, deleted_at DATETIME
);
CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR(24) PRIMARY KEY, fleet_id VARCHAR(24), label VARCHAR(64), model VARCHAR(64),
  region VARCHAR(48) DEFAULT 'west', health VARCHAR(16) DEFAULT 'healthy', lat DOUBLE, lng DOUBLE,
  created_at DATETIME, updated_at DATETIME, deleted_at DATETIME, INDEX(fleet_id), INDEX(health)
);
CREATE TABLE IF NOT EXISTS vehicle_status (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, vehicle_id VARCHAR(24), health VARCHAR(16),
  health_score FLOAT, note VARCHAR(160), created_at DATETIME, updated_at DATETIME, INDEX(vehicle_id)
);
CREATE TABLE IF NOT EXISTS telemetry (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, vehicle_id VARCHAR(24) NOT NULL,
  battery_soc FLOAT, battery_voltage FLOAT, battery_current FLOAT, pack_temp FLOAT,
  motor_temp FLOAT, cabin_temp FLOAT, speed FLOAT, signal_strength FLOAT, packet_loss FLOAT,
  tyre_psi FLOAT, health_score FLOAT, raw JSON, created_at DATETIME, updated_at DATETIME,
  INDEX(vehicle_id, created_at)
);
CREATE TABLE IF NOT EXISTS telemetry_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, vehicle_id VARCHAR(24), bucket VARCHAR(24), aggregate JSON,
  created_at DATETIME, updated_at DATETIME, INDEX(vehicle_id, bucket)
);
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(24) PRIMARY KEY, vehicle_id VARCHAR(24), severity VARCHAR(16), code VARCHAR(24),
  message VARCHAR(200), acknowledged BOOLEAN DEFAULT FALSE, created_at DATETIME, updated_at DATETIME,
  INDEX(vehicle_id), INDEX(severity)
);
CREATE TABLE IF NOT EXISTS alert_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, alert_id VARCHAR(24), state VARCHAR(24), actor VARCHAR(64),
  created_at DATETIME, updated_at DATETIME, INDEX(alert_id)
);
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id VARCHAR(24) PRIMARY KEY, vehicle_id VARCHAR(24) NOT NULL, fault_key VARCHAR(32), fault_label VARCHAR(96),
  severity VARCHAR(16), status VARCHAR(24) DEFAULT 'detected', root_cause TEXT, recommended_action TEXT,
  risk_note TEXT, confidence FLOAT, mttr_seconds FLOAT, approved_by VARCHAR(64), resolved_at DATETIME,
  created_at DATETIME, updated_at DATETIME, deleted_at DATETIME, INDEX(vehicle_id), INDEX(status)
);
CREATE TABLE IF NOT EXISTS diagnostic_agents (
  id VARCHAR(24) PRIMARY KEY, `key` VARCHAR(32) UNIQUE, name VARCHAR(64), domain VARCHAR(48),
  enabled BOOLEAN DEFAULT TRUE, created_at DATETIME, updated_at DATETIME
);
CREATE TABLE IF NOT EXISTS agent_results (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, session_id VARCHAR(24) NOT NULL, agent_key VARCHAR(32),
  agent_name VARCHAR(64), finding TEXT, confidence FLOAT, created_at DATETIME, updated_at DATETIME, INDEX(session_id)
);
CREATE TABLE IF NOT EXISTS recovery_actions (
  id VARCHAR(24) PRIMARY KEY, fault_key VARCHAR(32), label VARCHAR(96), steps JSON,
  requires_approval BOOLEAN DEFAULT TRUE, created_at DATETIME, updated_at DATETIME, INDEX(fault_key)
);
CREATE TABLE IF NOT EXISTS recovery_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, session_id VARCHAR(24), vehicle_id VARCHAR(24), action TEXT,
  approved_by VARCHAR(64), auto_approved BOOLEAN DEFAULT FALSE, outcome VARCHAR(24) DEFAULT 'healed',
  duration_seconds FLOAT, created_at DATETIME, updated_at DATETIME, INDEX(vehicle_id)
);
CREATE TABLE IF NOT EXISTS risk_assessments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, session_id VARCHAR(24), score FLOAT, factors JSON,
  created_at DATETIME, updated_at DATETIME, INDEX(session_id)
);
CREATE TABLE IF NOT EXISTS health_scores (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, vehicle_id VARCHAR(24), score FLOAT, band VARCHAR(16),
  created_at DATETIME, updated_at DATETIME, INDEX(vehicle_id)
);
CREATE TABLE IF NOT EXISTS incident_reports (
  id VARCHAR(24) PRIMARY KEY, session_id VARCHAR(24), vehicle_id VARCHAR(24), summary TEXT,
  business_impact TEXT, created_at DATETIME, updated_at DATETIME, deleted_at DATETIME, INDEX(vehicle_id)
);
CREATE TABLE IF NOT EXISTS simulator_profiles (
  id VARCHAR(24) PRIMARY KEY, name VARCHAR(64), fault_key VARCHAR(32), weight FLOAT DEFAULT 1, config JSON,
  created_at DATETIME, updated_at DATETIME
);
CREATE TABLE IF NOT EXISTS simulator_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, vehicle_id VARCHAR(24), type VARCHAR(32), fault_key VARCHAR(32),
  payload JSON, created_at DATETIME, updated_at DATETIME, INDEX(vehicle_id)
);
CREATE TABLE IF NOT EXISTS device_configuration (
  id VARCHAR(24) PRIMARY KEY, vehicle_id VARCHAR(24), firmware VARCHAR(32), sample_rate_ms INT, config JSON,
  created_at DATETIME, updated_at DATETIME, INDEX(vehicle_id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(24) PRIMARY KEY, channel VARCHAR(24), target VARCHAR(128), subject VARCHAR(160), body TEXT,
  status VARCHAR(24) DEFAULT 'queued', created_at DATETIME, updated_at DATETIME, INDEX(status)
);
CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR(24) PRIMARY KEY, `key` VARCHAR(64) UNIQUE, value JSON, created_at DATETIME, updated_at DATETIME
);
CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(24) PRIMARY KEY, label VARCHAR(64), hashed_key VARCHAR(128), scopes JSON,
  revoked BOOLEAN DEFAULT FALSE, created_at DATETIME, updated_at DATETIME
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, actor VARCHAR(64), action VARCHAR(48), resource VARCHAR(48),
  resource_id VARCHAR(48), meta JSON, created_at DATETIME, updated_at DATETIME, INDEX(actor), INDEX(resource)
);
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, actor VARCHAR(64), event VARCHAR(64), meta JSON,
  created_at DATETIME, updated_at DATETIME, INDEX(actor)
);
