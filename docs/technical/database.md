# Database

AWS RDS MySQL (optional). DB name: `hm_living_twin_ai`. When `DB_HOST` is set, Sequelize
connects and `sync` creates all tables; otherwise the app runs fully in-memory.

## Tables (26)
Auth/users: `users`, `roles`, `permissions`, `api_keys`, `activity_logs`, `audit_logs`.
Fleet: `fleets`, `vehicles`, `vehicle_status`, `device_configuration`, `health_scores`.
Telemetry: `telemetry`, `telemetry_history`.
Alerts: `alerts`, `alert_history`.
AI/recovery: `diagnostic_sessions`, `diagnostic_agents`, `agent_results`,
`recovery_actions`, `recovery_history`, `risk_assessments`, `incident_reports`.
Simulator/config: `simulator_profiles`, `simulator_events`, `system_settings`, `notifications`.

Every table has `created_at`, `updated_at`; soft-deletable ones also `deleted_at`.

## What actually persists today
Written at runtime: `telemetry`, `diagnostic_sessions`, `agent_results`, `recovery_history`.
Reference tables are populated by seeding (below). The live **fleet is generated in-memory**
each boot (it does not load from `vehicles` unless you extend `fleetService`).

## Option A — SQL bootstrap
Files in `backend/src/database/`:
- `schema.sql` — creates DB + 26 tables.
- `seed.sql` — reference data (roles, users, 8 agents, recovery actions, sim profiles, settings).
```bash
mysql -h <rds-endpoint> -u <user> -p < backend/src/database/schema.sql
mysql -h <rds-endpoint> -u <user> -p hm_living_twin_ai < backend/src/database/seed.sql
```
(A combined `hm_living_twin_ai_bootstrap.sql` runs both at once.)

## Option B — Bootstrap API (no SQL client needed)
```bash
curl -X POST https://<backend>.onrender.com/api/admin/bootstrap \
  -H "content-type: application/json" -d '{"seedFleet":true}'
```
Idempotent (upsert). `seedFleet:true` also writes the current fleet into `vehicles` and
`device_configuration`.

## Migrations
None yet — the app uses `sync({ alter: true })`. For production, adopt versioned migrations
(sequelize-cli / umzug) and disable auto-sync. The `users.password_hash` seed values are
placeholders; replace with real bcrypt hashes before enabling DB-backed auth.
