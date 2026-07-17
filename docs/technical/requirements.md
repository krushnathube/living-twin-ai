# Requirements

## Functional
- Ingest/simulate real-time telemetry from a connected fleet (24-field frames, ~2s cadence).
- Detect anomalies via thresholds and fault signatures.
- Diagnose with a multi-agent council + supervisor (root cause, action, risk, confidence,
  MTTR estimate, business impact).
- Require human-in-the-loop approval before recovery (configurable auto/manual).
- Execute recovery, return asset to healthy, record an audit trail.
- Operator control: mode overrides, telemetry sliders, manual/scheduled/random failures,
  per-device incident trigger and recovery.
- Broadcast live state over WebSocket; expose REST with a standard envelope.
- Persist telemetry, sessions, agent findings, recovery history when a DB is attached.
- Support multi-vertical reuse (swap telemetry source + agents; core unchanged).

## Non-functional
- **Reliability**: DB-optional; graceful fallback to in-memory; `/health` check.
- **Performance**: sub-second event propagation; bounded ring buffers; rate-limited API.
- **Scalability**: event-bus-decoupled services; ingestion separable from platform layer.
- **Security**: Helmet, CORS, JWT scaffold, parameterized ORM, no hardcoded secrets.
- **Maintainability**: feature-modular; one model file per table; pluggable agents/faults.
- **Auditability**: evidence, risk, approver, and duration recorded per recovery.
- **Observability**: structured logging; incident timeline + metrics surface.
- **Usability**: dense, booth-legible UI; light/dark themes; two purpose-built views.

## Known gaps (be honest for judging)
No enforced login flow; no automated tests; notifications/alerts/audit tables partially
unused; no versioned migrations; simulated (not physical) devices; single active incident
at a time; cost defaults are illustrative.
