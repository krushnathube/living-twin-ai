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
