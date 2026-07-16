import React from 'react';
import { useLive } from '../contexts/LiveContext.jsx';

// Booth controls: inject a specific fault on demand for judges. The continuous loop
// runs on the backend regardless; this just lets a presenter drive a scenario.
const FAULTS = [
  ['BATTERY', 'Battery thermal'], ['MOTOR', 'Motor overtemp'], ['CONNECT', 'Connectivity loss'],
  ['SENSOR', 'Sensor dropout'], ['BRAKE', 'Brake anomaly'], ['TIRE', 'Tyre pressure'],
];
export default function Controls() {
  const { api, incident } = useLive();
  const busy = incident && incident.status !== 'healed';
  return (
    <div className="controls">
      <span className="hint">Inject a scenario for judges — the fleet self-heals continuously on its own too.</span>
      <div className="spacer" />
      {FAULTS.map(([k, label]) => (
        <button key={k} className="ctl" disabled={busy} onClick={() => api.inject(k)}>{label}</button>
      ))}
    </div>
  );
}
