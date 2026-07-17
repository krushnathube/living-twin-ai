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


-- ================= SEED / REFERENCE DATA =================

-- Living Twin AI — reference/seed data for hm_living_twin_ai.
-- Run AFTER schema.sql:  mysql -h <host> -u <user> -p hm_living_twin_ai < seed.sql
-- Idempotent: uses INSERT ... ON DUPLICATE KEY UPDATE so re-running is safe.
USE hm_living_twin_ai;
SET @now = NOW();

-- ---- Roles ----
INSERT INTO roles (id, `key`, name, description, created_at, updated_at) VALUES
  ('ROLE-ADMIN','admin','Fleet Admin','Full access to fleet, config, and recovery',@now,@now),
  ('ROLE-OPS','operator','Operator','Monitors fleet and approves recovery actions',@now,@now),
  ('ROLE-VIEW','viewer','Viewer','Read-only dashboard access',@now,@now)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), updated_at=@now;

-- ---- Permissions (resource:action) ----
INSERT INTO permissions (id, role_id, resource, action, created_at, updated_at) VALUES
  ('PERM-1','ROLE-ADMIN','*','*',@now,@now),
  ('PERM-2','ROLE-OPS','recovery','approve',@now,@now),
  ('PERM-3','ROLE-OPS','simulator','inject',@now,@now),
  ('PERM-4','ROLE-OPS','fleet','read',@now,@now),
  ('PERM-5','ROLE-VIEW','fleet','read',@now,@now),
  ('PERM-6','ROLE-VIEW','dashboard','read',@now,@now)
ON DUPLICATE KEY UPDATE action=VALUES(action), updated_at=@now;

-- ---- Users (password_hash is a PLACEHOLDER — replace with a real bcrypt hash before
--      enabling DB-backed auth; the demo login uses in-code users, not these rows) ----
INSERT INTO users (id, email, password_hash, name, role_id, active, created_at, updated_at) VALUES
  ('U-ADMIN','admin@livingtwin.ai','$2b$10$REPLACE_WITH_REAL_BCRYPT_HASH','Fleet Admin','ROLE-ADMIN',1,@now,@now),
  ('U-OPS','operator@livingtwin.ai','$2b$10$REPLACE_WITH_REAL_BCRYPT_HASH','Ops Operator','ROLE-OPS',1,@now,@now)
ON DUPLICATE KEY UPDATE name=VALUES(name), role_id=VALUES(role_id), updated_at=@now;

-- ---- Diagnostic agents (mirrors backend/src/modules/ai/agents) ----
INSERT INTO diagnostic_agents (id, `key`, name, domain, enabled, created_at, updated_at) VALUES
  ('AG-BAT','battery','Battery / Thermal','energy',1,@now,@now),
  ('AG-PWR','powertrain','Powertrain','drivetrain',1,@now,@now),
  ('AG-CON','connectivity','Connectivity','network',1,@now,@now),
  ('AG-THM','thermal','Thermal','cooling',1,@now,@now),
  ('AG-SEN','sensor','Sensor Integrity','sensing',1,@now,@now),
  ('AG-SAF','safety','Safety Systems','safety',1,@now,@now),
  ('AG-CHS','chassis','Chassis / Tyres','chassis',1,@now,@now),
  ('AG-TEL','telemetry','Telemetry Integrity','data',1,@now,@now)
ON DUPLICATE KEY UPDATE name=VALUES(name), domain=VALUES(domain), updated_at=@now;

-- ---- Recovery actions (one per fault scenario) ----
INSERT INTO recovery_actions (id, fault_key, label, steps, requires_approval, created_at, updated_at) VALUES
  ('RA-BAT','BATTERY','Throttle & isolate pack','["throttle_charge_0.5C","isolate_cell_group","route_to_depot"]',1,@now,@now),
  ('RA-MOT','MOTOR','Torque cap & cooling','["apply_torque_cap","coolant_pump_max","reprofile_route"]',1,@now,@now),
  ('RA-CON','CONNECT','Store-and-forward failover','["enable_store_forward","pin_strongest_carrier","backfill_gap"]',1,@now,@now),
  ('RA-SEN','SENSOR','Channel re-sync','["force_channel_resync","failover_redundant_feed","flag_ota_check"]',1,@now,@now),
  ('RA-BRK','BRAKE','Regen blend reduction','["reduce_regen_blend","bias_friction_braking","schedule_calibration"]',1,@now,@now),
  ('RA-TIR','TIRE','Speed cap & reroute','["alert_driver","cap_speed","route_service_point"]',1,@now,@now)
ON DUPLICATE KEY UPDATE label=VALUES(label), steps=VALUES(steps), updated_at=@now;

-- ---- Simulator profiles (fault weighting for random injection) ----
INSERT INTO simulator_profiles (id, name, fault_key, weight, config, created_at, updated_at) VALUES
  ('SP-BAT','Battery thermal divergence','BATTERY',1.0,'{"severity":"critical"}',@now,@now),
  ('SP-MOT','Drive motor overtemp','MOTOR',1.0,'{"severity":"critical"}',@now,@now),
  ('SP-CON','IoT connectivity loss','CONNECT',1.2,'{"severity":"warning"}',@now,@now),
  ('SP-SEN','Telematics sensor dropout','SENSOR',1.2,'{"severity":"warning"}',@now,@now),
  ('SP-BRK','Regen brake anomaly','BRAKE',0.8,'{"severity":"critical"}',@now,@now),
  ('SP-TIR','Tyre pressure loss','TIRE',1.0,'{"severity":"warning"}',@now,@now)
ON DUPLICATE KEY UPDATE weight=VALUES(weight), config=VALUES(config), updated_at=@now;

-- ---- System settings ----
INSERT INTO system_settings (id, `key`, value, created_at, updated_at) VALUES
  ('SET-FLEET','fleet_size','50',@now,@now),
  ('SET-AUTO','auto_approve','true',@now,@now),
  ('SET-INT','sim_interval_ms','2000',@now,@now)
ON DUPLICATE KEY UPDATE value=VALUES(value), updated_at=@now;
