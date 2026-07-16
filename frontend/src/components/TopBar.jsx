import React, { useEffect, useState } from 'react';
import { useLive } from '../contexts/LiveContext.jsx';

export default function TopBar() {
  const { metrics, fleet, connected } = useLive();
  const [clock, setClock] = useState('--:--:--');
  useEffect(() => { const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB')), 1000); return () => clearInterval(t); }, []);
  const c = fleet.counts || {};
  return (
    <header className="topbar">
      <div className="brand">
        <span className="dot" />
        <div><b>Living Twin</b> <span className="sub">SELF-HEALING FLEET COMMAND CENTER</span></div>
      </div>
      <div className="title">AI Ops</div>
      <div className="kpi-strip">
        <Kpi k="Fleet online" v={fleet.total || 0} cls="good" />
        <Kpi k="Avg health" v={`${metrics.fleetHealthPct ?? 0}%`} cls={metrics.fleetHealthPct >= 95 ? 'good' : 'warn'} />
        <Kpi k="Active incidents" v={metrics.activeIncidents || 0} cls={metrics.activeIncidents ? 'bad' : ''} />
        <Kpi k="Operator ratio" v={metrics.operatorRatio || `1 : ${fleet.total || 0}`} />
        <div className={`live ${connected ? '' : 'off'}`}><span className="pulse" />{connected ? 'LIVE' : 'OFFLINE'}</div>
        <div className="clock">{clock}</div>
      </div>
    </header>
  );
}
const Kpi = ({ k, v, cls = '' }) => (
  <div className="kpi"><span className="k">{k}</span><span className={`v ${cls}`}>{v}</span></div>
);
