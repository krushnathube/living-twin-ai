import React, { useState } from 'react';
import { useLive } from '../contexts/LiveContext.jsx';
import IncidentDetailModal from './IncidentDetailModal.jsx';

const SEV = { critical: '#ff4a5e', warning: '#ffb020' };
export default function IncidentTimeline() {
  const { resolved } = useLive();
  const [sel, setSel] = useState(null);
  return (
    <div className="timeline">
      <div className="tl-label">Incident timeline</div>
      <div className="tl-track">
        {resolved.length === 0 && <span className="tl-empty">No incidents resolved yet — the fleet is nominal.</span>}
        {resolved.map((r, i) => (
          <button key={r.sessionId || i} className="tl-card" style={{ borderColor: SEV[r.severity] || '#26374d' }} onClick={() => setSel(r)}>
            <span className="tl-dot" style={{ background: SEV[r.severity] || '#2fe08a' }} />
            <div className="tl-main">
              <div className="tl-top"><span className="tl-veh">{r.vehicleId}</span><span className="tl-mttr">{r.durationSeconds}s</span></div>
              <div className="tl-fault">{r.faultLabel}</div>
              <div className="tl-by">{r.autoApproved ? 'auto' : r.approvedBy} · {timeAgo(r.at)}</div>
            </div>
          </button>
        ))}
      </div>
      {sel && <IncidentDetailModal incident={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
function timeAgo(ts) { const s = Math.max(0, Math.floor((Date.now() - ts) / 1000)); return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`; }
