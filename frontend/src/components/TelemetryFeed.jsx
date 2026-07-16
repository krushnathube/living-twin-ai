import React from 'react';
import { useLive } from '../contexts/LiveContext.jsx';

export default function TelemetryFeed() {
  const { feed, latest, fleet } = useLive();
  const samples = Object.values(latest);
  const avg = (k) => samples.length ? (samples.reduce((s, x) => s + (x[k] || 0), 0) / samples.length) : 0;
  return (
    <aside className="col left">
      <div className="panel-h"><span className="sq" />Telemetry stream</div>
      <div className="kpigrid">
        <Cell lab="Signals / sec" val={(samples.length ? samples.length * 12 : 0).toLocaleString('en-IN')} cls="cyan" />
        <Cell lab="Avg pack °C" val={avg('packTemp').toFixed(1)} />
        <Cell lab="Avg signal" val={`${avg('signalStrength').toFixed(0)}%`} cls="good" />
        <Cell lab="Vehicles" val={fleet.total || 0} />
      </div>
      <div className="feed">
        {feed.map((f, i) => (
          <div key={i} className={`feed-row ${f.level || ''}`}>
            <span className="t">{new Date(f.ts || Date.now()).toLocaleTimeString('en-GB')}</span>
            <span className="id">{f.vehicleId}</span>
            <span>{f.text}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
const Cell = ({ lab, val, cls = '' }) => (
  <div className="kpicell"><div className="lab">{lab}</div><div className={`num ${cls}`}>{val}</div></div>
);
