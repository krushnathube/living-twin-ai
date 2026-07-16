# Living Twin AI — Self-Healing Fleet Command Center

A digital twin with an immune system. It watches a connected-vehicle fleet, and when a
vehicle degrades, an **AI Diagnostic Council** of specialist agents diagnoses the root
cause, proposes a fix, waits for human approval, and heals the vehicle back to green —
then keeps monitoring. Built for the BLITZ 2026 booth demo, structured as a real product.

The loop: **Observe → Detect → Diagnose → Recommend → (Human) Approve → Heal → Monitor.**

## Monorepo layout

```
living-twin/
├── backend/          Node.js (ESM) + Express + Socket.io + Sequelize
│   └── src/
│       ├── config/         env + logger
│       ├── constants/      shared enums + socket event names
│       ├── database/       Sequelize init (DB-optional) + schema.sql (26 tables)
│       ├── models/         one Sequelize model file per table + registry
│       ├── modules/        feature modules, each self-contained:
│       │   ├── fleet/          in-memory fleet state (source of truth)
│       │   ├── simulator/      realistic telemetry generator + fault profiles
│       │   ├── telemetry/      live ring-buffer engine (+ best-effort persist)
│       │   ├── ai/             specialist agents + council supervisor + LLM provider
│       │   ├── recovery/       approved-recovery execution + audit
│       │   ├── dashboard/      aggregate KPI metrics
│       │   ├── auth/           minimal JWT (demo users)
│       │   └── notification/   pluggable channels (stub)
│       ├── orchestrator/   boothLoop.js — drives the whole incident lifecycle
│       ├── socket/         Socket.io transport (bridges the domain event bus)
│       ├── routes/         mounts every module under /api
│       └── utils/          response envelope, event bus, async handler
└── frontend/         React (Vite) live dashboard
    └── src/
        ├── api/socket.js       shared socket connection
        ├── contexts/           LiveContext — single live-state store
        ├── components/         TopBar, FleetMap, TelemetryFeed, AICouncil, Metrics, Controls
        └── pages/Dashboard.jsx
```

## Run locally

Two terminals:

```bash
# 1) backend  → http://localhost:4000
cd backend && npm install && npm start

# 2) frontend → http://localhost:5173  (dev-proxies /api + /socket.io to :4000)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173. The fleet turns over on its own; use the bottom buttons to
inject a specific scenario for judges.

## Database — optional by design

The platform runs **fully in-memory** with no database, so it boots instantly on a booth
laptop or a fresh Render deploy. To persist to **AWS RDS MySQL**, set the `DB_*` env vars
(see `backend/.env.example`). On connect, Sequelize creates all 26 tables (`sync`) or you
can provision manually from `backend/src/database/schema.sql`. Telemetry, diagnostic
sessions, agent findings, and recovery history then persist automatically.

## Deploy on Render

Push to GitHub, then in Render: **New + → Blueprint**, point at the repo. `render.yaml`
provisions the backend web service and the frontend static site. After the backend is
live, set the frontend's `VITE_BACKEND_URL` env var to the backend URL and redeploy.

## Optional: live LLM diagnosis

Set `LLM_API_KEY` (and `LLM_MODEL`) on the backend to have the council generate diagnosis
text from a real model. Left blank, it uses the built-in reasoning engine (fast, offline,
booth-safe).

## Demo credentials

`admin@livingtwin.ai` / `operator@livingtwin.ai`, password `living-twin` (JWT via
`POST /api/auth/login`). Auth is wired but not enforced on demo endpoints.

## What's fully wired vs. scaffolded

**Fully working and verified end-to-end:**
- Realistic multi-vehicle telemetry simulator streaming over Socket.io
- 6 fault scenarios × 8 specialist agents + supervisor synthesis (root cause, action,
  risk score, confidence, MTTR estimate, business impact)
- Full incident lifecycle with human-in-the-loop approval (REST) or booth auto-approve
- Recovery execution + live KPI metrics + fleet map health transitions
- All 26 tables as individual Sequelize models; DB-optional persistence
- REST API with a standard `{success,message,data,errors}` envelope; Render + Docker deploy

**Scaffolded with clear extension points (models/hooks exist, logic is minimal):**
- Auth is a minimal JWT with demo users — swap in a real user store + bcrypt
- Notifications log + emit events — implement real email/Slack/SMS senders
- Historical playback reads the in-memory ring — point it at `telemetry_history` for long windows
- No automated test suite yet — services are isolated and testable (Jest recommended)

## A note on the numbers

The headline figures (₹ cost avoided, failures prevented, etc.) are **illustrative
placeholders**. Replace them with a defensible baseline before presenting — Business Value
is 30% of BLITZ judging, so a real per-incident cost and fleet size will land far better
than a round number.

## API quick reference

```
GET  /health
POST /api/auth/login               { email, password }
GET  /api/fleet                    fleet snapshot (counts + vehicles)
GET  /api/fleet/:id                one vehicle + latest + history
GET  /api/telemetry                latest sample per vehicle
GET  /api/telemetry/:vehicleId     recent history
GET  /api/ai/agents                specialist council roster
GET  /api/ai/sessions              active diagnostic sessions
POST /api/simulator/inject         { faultKey? }  inject an incident
GET  /api/simulator/faults         available scenarios
POST /api/recovery/:sessionId/approve   human approval → heal
GET  /api/dashboard/metrics        headline KPIs
GET  /api/dashboard/overview       metrics + fleet + active sessions
```
