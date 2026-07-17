# API Reference

Base URL: the backend service (e.g. `https://<backend>.onrender.com`).
All responses use the envelope: `{ "success": bool, "message": string, "data": object, "errors": [] }`.

## Health
- `GET /health` → `{ status, env, db: "connected"|"in-memory", ts }`

## Auth
- `POST /api/auth/login` — body `{ email, password }` → `{ token, user }`
  (demo users: `admin@livingtwin.ai` / `operator@livingtwin.ai`, password `living-twin`)

## Fleet
- `GET /api/fleet` → snapshot `{ vehicles[], counts, total }`
- `GET /api/fleet/:id` → `{ vehicle, latest, history }`

## Telemetry
- `GET /api/telemetry` → `{ latest[] }` (latest sample per vehicle)
- `GET /api/telemetry/:vehicleId` → `{ vehicleId, history[] }`

## AI
- `GET /api/ai/agents` → `{ agents[] }` (council roster)
- `GET /api/ai/sessions` → `{ sessions[] }` (active diagnostic sessions)

## Recovery
- `POST /api/recovery/:sessionId/approve` — body `{ approvedBy? }` → recovery record (heals)

## Simulator
- `GET /api/simulator/faults` → `{ faults[] }`
- `GET /api/simulator/state` → `{ devices[], auto, autoApprove }`
- `POST /api/simulator/inject` — `{ faultKey?, vehicleId? }`
- `POST /api/simulator/random` — `{ enabled }` (toggle random failures)
- `POST /api/simulator/auto-approve` — `{ enabled }` (AUTO vs MANUAL approval)
- `POST /api/simulator/schedule` — `{ delayMs, faultKey?, vehicleId?, kind? }`
- `POST /api/simulator/device/:id/mode` — `{ mode }` (healthy|warning|critical|offline|auto)
- `POST /api/simulator/device/:id/override` — `{ field, value }` or `{ clear: true }`
- `POST /api/simulator/device/:id/fault` — `{ faultKey }` (simulator drift, no AI)
- `POST /api/simulator/device/:id/incident` — `{ faultKey? }` (trigger AI council on device)
- `POST /api/simulator/device/:id/recover` — heal this device

## Dashboard
- `GET /api/dashboard/metrics` → KPI snapshot
- `GET /api/dashboard/overview` → `{ metrics, fleet, activeSessions, recentIncidents }`
- `GET /api/dashboard/incidents` → `{ incidents[] }` (timeline, with agents + synthesis)
- `GET /api/dashboard/cost-model` → inputs + computed breakdown
- `POST /api/dashboard/cost-model` — inputs patch (or `{ reset: true }`) → recompute + push live

## Admin
- `POST /api/admin/bootstrap` — `{ seedFleet? }` → upserts reference data (+ optional fleet)

## WebSocket (Socket.io) — server → client events
- `fleet:snapshot` — full fleet state (each tick)
- `telemetry:tick` — batch of latest telemetry frames
- `feed:event` — one telemetry feed line
- `incident:open` — new incident detected
- `incident:agent` — one specialist finding (streamed)
- `incident:diagnosis` — supervisor synthesis
- `incident:await_approval` — waiting for human approval
- `incident:healed` — resolved
- `metrics:update` — KPI update
- `incidents:snapshot` — recent resolved incidents (on connect)

Telemetry frame fields: batterySoc, batteryVoltage, batteryCurrent, packTemp, motorTemp,
cabinTemp, speed, acceleration, lat/lng, gpsSats, connectivity, network, signalStrength,
packetLoss, cpu, memory, sensorStatus, doorStatus, chargingState, powerConsumptionKw,
tyrePsi, tripStatus, weatherImpact, roadCondition, alerts[], faultCodes[], healthScore, health.
