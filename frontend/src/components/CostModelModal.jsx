import React, { useEffect, useState } from 'react';
import { useLive } from '../contexts/LiveContext.jsx';

// Interactive, defensible cost-avoidance breakdown. Opens over the dashboard; edits push
// to the backend and the headline number updates live (great for "what if 500 vehicles?").
const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
const FIELDS = [
  ['fleetSize', 'Fleet size', 'vehicles', 1],
  ['faultsPerVehiclePerMonth', 'Faults / vehicle / month', '', 0.1],
  ['preventionRate', 'Prevention rate', '(0–1)', 0.05],
  ['downtimeCostPerHour', 'Downtime cost / hr', 'USD', 5],
  ['manualMttrHours', 'Manual MTTR', 'hrs', 0.25],
  ['livingTwinMttrHours', 'Living Twin MTTR', 'hrs', 0.25],
];

export default function CostModelModal({ onClose }) {
  const { api } = useLive();
  const [model, setModel] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.getCostModel().then((r) => setModel(r.data)).catch(() => {}); }, []);

  const patch = async (key, value) => {
    setSaving(true);
    const r = await api.updateCostModel({ [key]: value });
    setModel(r.data); setSaving(false);
  };
  const resetModel = async () => { setSaving(true); const r = await api.updateCostModel({ reset: true }); setModel(r.data); setSaving(false); };

  if (!model) return null;
  const i = model.inputs;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal cost-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>Cost-avoidance model <span className="modal-sub">estimated annual value</span></div>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="cost-headline">
          <span className="ch-num">${model.costAvoidedUsdM}<span className="ch-u">M / yr</span></span>
          <span className="ch-sub">{usd(model.annualCostAvoidedUsd)} · {model.annualIncidents} incidents/yr · {model.preventedFailures} field failures prevented</span>
        </div>

        <div className="cost-grid">
          <div className="cost-inputs">
            <div className="cm-label">Assumptions (editable)</div>
            {FIELDS.map(([key, label, unit, step]) => (
              <div className="cm-row" key={key}>
                <label>{label} {unit && <span className="cm-unit">{unit}</span>}</label>
                <input type="number" step={step} value={i[key]}
                  onChange={(e) => patch(key, +e.target.value)} />
              </div>
            ))}
            <button className="btn-sim ghost small" onClick={resetModel}>Reset to defaults</button>
          </div>

          <div className="cost-breakdown">
            <div className="cm-label">How it's calculated</div>
            <Line k="Annual incidents detected" v={`${model.annualIncidents}`} note={`${i.fleetSize} vehicles × ${i.faultsPerVehiclePerMonth}/mo × 12`} />
            <Line k="Would-be field failures" v={`${model.preventedFailures}`} note={`× ${(i.preventionRate * 100).toFixed(0)}% prevention rate`} />
            <Line k="Avg field-failure cost avoided" v={usd(model.fieldAvoidedPerIncident)} note="weighted by fault mix" />
            <div className="cm-div" />
            <Line k="Field-failure cost avoided" v={usd(model.breakdown.fieldFailureAvoided)} strong />
            <Line k="Downtime cost avoided" v={usd(model.breakdown.downtimeAvoided)} note={`${model.downtimeHoursSavedPerIncident} h saved × ${usd(i.downtimeCostPerHour)}/h × ${model.annualIncidents}`} strong />
            <div className="cm-div" />
            <Line k="Total estimated / yr" v={usd(model.annualCostAvoidedUsd)} total />
            <p className="cm-note">Illustrative defaults — edit to your real figures. Change fleet size to see it scale.{saving ? ' · saving…' : ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
const Line = ({ k, v, note, strong, total }) => (
  <div className={`cm-line ${total ? 'total' : ''} ${strong ? 'strong' : ''}`}>
    <div className="cm-k">{k}{note && <span className="cm-note-inline">{note}</span>}</div>
    <div className="cm-v">{v}</div>
  </div>
);
