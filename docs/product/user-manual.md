# User Manual

Two pages, one app. The **Command Center** is the default view; the **Device Simulator** is a
tool page reached at `/simulator`.

## Command Center (`/`)
Monitoring only. What you see:
- **Top bar** — fleet online, avg health, active incidents, operator ratio, live clock, and a
  ☀/☾ **light/dark toggle** (top-right).
- **Telemetry stream (left)** — signals/sec, avg pack °C, avg signal, vehicle count, a
  **fleet-health donut + 2-min sparkline**, and a live event feed.
- **Fleet map (center)** — vehicles drift in real time, colored by health (green healthy,
  amber warning, red critical, cyan healing). Critical vehicles pulse; healed vehicles ripple.
- **AI Diagnostic Council (right)** — when an incident opens, specialist agents stream their
  findings, then a root-cause synthesis (confidence, risk, MTTR, business impact). The
  **✓ Approve & Heal** button is pinned at the bottom; the panel scrolls if reasoning is long.
- **Metrics (bottom)** — MTTR (sparkline), faults auto-diagnosed, field failures prevented,
  and **Est. cost avoided** (click it to open/edit the cost model).
- **Incident timeline (very bottom)** — recently resolved incidents. **Click any card** to
  open the full record: all agent findings, root cause, action taken, approver, MTTR.

## Device Simulator (`/simulator`)
Control panel for the simulated fleet.
- **Simulator controls (left)**:
  - **Random failures** toggle — fleet develops incidents on its own.
  - **Recovery approval** toggle — AUTO-APPROVE (heals automatically) vs MANUAL (waits for
    your Approve click on the Command Center).
  - **Inject random incident** and **Scheduled failure** (fault + delay).
- **Device grid (center)** — every vehicle as a card with live telemetry; click to select.
- **Device detail (right)** — full telemetry (energy, drivetrain, connectivity, compute,
  status, environment), plus controls:
  - **Mode**: Healthy / Warning / Critical / Offline / Auto.
  - **Sliders**: pin pack temp, motor temp, voltage, signal, tyre psi — drag until it faults.
  - **Failure injection**: device fault (drift), **Trigger AI Council**, **Force recovery**.

## Typical demo flow
1. On `/simulator`, set **Recovery approval → MANUAL**.
2. Go to Command Center; wait for (or inject) an incident.
3. Watch the council diagnose; click **✓ Approve & Heal**; vehicle returns to green.
4. Open the cost model tile; change fleet size to show scaling.
