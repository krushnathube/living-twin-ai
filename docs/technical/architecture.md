# Architecture

## Overview
Monorepo: `backend/` (Node.js ESM + Express + Socket.io + Sequelize) and `frontend/`
(React + Vite). A domain **event bus** decouples business logic from transport (sockets)
and storage (DB).

## Core loop
`Observe → Detect → Diagnose → Recommend → Approve → Heal → Monitor`, driven by the
orchestrator (`backend/src/orchestrator/boothLoop.js`).

## Backend modules (`backend/src/modules/`)
- **fleet** — in-memory fleet state (source of truth for the live view).
- **simulator** — realistic telemetry generator + fault profiles + device controls.
- **telemetry** — live ring-buffer engine; best-effort DB persistence.
- **ai** — 8 specialist agents + supervisor synthesis + optional live-LLM provider.
- **recovery** — executes approved recovery; records audit.
- **dashboard** — KPI metrics, incident log, cost model.
- **auth** — minimal JWT (demo users).
- **admin** — programmatic DB bootstrap.
- **notification** — pluggable channels (stub).

## Data flow
1. `simulator` emits a telemetry batch every ~2s onto the bus.
2. `telemetry` engine ingests (ring buffer) and persists best-effort.
3. `socket` layer forwards telemetry + fleet snapshots to all dashboards.
4. `orchestrator` opens an incident → `ai` council diagnoses (agents stream) → awaits
   approval → `recovery` heals → `metrics`/`incidentLog` update → next incident scheduled.
5. Every step is a bus event; sockets and persistence subscribe independently.

## Health authority
The **simulator owns each vehicle's health per tick**, derived in priority order:
manual mode → healing window → active AI incident → device fault → live thresholds
(so console sliders can push a device into warning/critical).

## Frontend
- `LiveContext` — single live-state store fed by the socket; also holds theme + API helpers.
- Components: TopBar, FleetMap (canvas), TelemetryFeed, AICouncil, Metrics (+ CostModelModal),
  IncidentTimeline (+ IncidentDetailModal), Spark (sparkline/donut).
- Pages: Dashboard (`/`), Simulator (`/simulator`).

## Deployment
Backend = Render Web Service (Node). Frontend = Render Static Site. DB = AWS RDS MySQL
(optional). See setup-and-deployment.md.
