# Value Proposition

## Three maturity levels
1. **Digital Twin (visibility)** — shows telemetry and status. Humans do everything else.
2. **+ Diagnosis (reasoning)** — AI explains *why* an asset is degrading and what to do.
3. **+ Self-healing (action)** — with human approval, the fix is applied and verified.

Living Twin delivers levels 2 and 3 on top of a level-1 twin — additive, not rip-and-replace.

## Differentiation
| Traditional twin | Living Twin |
|---|---|
| Passive dashboards | Active diagnosis + guided recovery |
| Threshold alerts | Multi-agent root-cause synthesis |
| Human investigates | AI investigates, human approves |
| No audit of reasoning | Evidence + risk recorded per incident |

## Cost model (defensible, editable)
The "estimated cost avoided / year" is computed, not hand-waved:

```
annual_incidents      = fleet_size × faults_per_vehicle_per_month × 12
prevented_failures    = annual_incidents × prevention_rate
field_failure_avoided = prevented_failures × weighted_avg(per-fault field-failure cost)
downtime_avoided      = annual_incidents × (manual_MTTR − livingtwin_MTTR)h × downtime_$/h
total                 = field_failure_avoided + downtime_avoided
```

Example (defaults, 50 vehicles): ~$1.44M/yr. At 500 vehicles: ~$14.4M/yr. Every input is
editable live in the dashboard (`Est. cost avoided` tile → assumptions), so the number is
transparent and scalable. **Replace defaults with your real figures before presenting.**

## KPIs shown
Mean time to resolution, faults auto-diagnosed, field failures prevented, estimated cost
avoided, fleet health %, active incidents, operator ratio.
