# Presentation Outline (BLITZ 2026)

Target: ~8–10 slides, 5–7 minutes, live demo in the middle.

1. **Title** — Living Twin AI: Self-Healing Fleet Command Center. One line: "what → why → fix."
2. **The problem** — telemetry everywhere, reasoning nowhere. Alert fatigue, slow MTTR,
   scarce experts. (One strong stat if you have it.)
3. **The idea** — a digital twin with an immune system. Observe → Detect → Diagnose →
   Recommend → Approve → Heal → Monitor.
4. **Maturity levels** — Twin → +Diagnosis → +Self-healing. We add 2 and 3, additively.
5. **LIVE DEMO** — Command Center: fleet goes red, AI Council diagnoses live (3 agents +
   synthesis), you click Approve, it heals to green, metrics tick up. Then flip to the
   Device Simulator to show it's driven by realistic IoT telemetry (sliders, faults, offline).
6. **How it works** — multi-agent council + supervisor + human-in-the-loop; explainable and
   auditable. One architecture diagram.
7. **Business value** — open the cost model live; change fleet size to show it scale.
8. **Beyond automotive** — one engine, many verticals (swap telemetry + agents).
9. **Ask / next steps** — pilot, target vertical, roadmap (real device ingestion via MQTT).

Demo tips: pre-warm the backend (`/health`) so it's awake; set approval to MANUAL to show
the human gate, or AUTO for a hands-off attractor loop; have the cost model open with real
numbers.
