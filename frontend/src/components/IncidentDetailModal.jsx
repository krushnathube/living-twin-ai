import React from 'react';
// Full resolved-incident record: agent findings, root-cause synthesis, action, approver.
const SEV = { critical: '#ff4a5e', warning: '#ffb020' };
export default function IncidentDetailModal({ incident: r, onClose }) {
  if (!r) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{ color: SEV[r.severity] || 'inherit' }}>◉ {r.vehicleId} · {r.faultLabel}
            <span className="modal-sub">{(r.severity || '').toUpperCase()} · resolved</span></div>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="dm-body">
          <div className="dm-stats">
            <Stat k="Healed in" v={`${r.durationSeconds}s`} />
            <Stat k="Approved by" v={r.autoApproved ? 'auto' : (r.approvedBy || '—')} />
            <Stat k="Confidence" v={r.confidence != null ? `${r.confidence}%` : '—'} />
            <Stat k="Risk score" v={r.riskScore ?? '—'} />
            <Stat k="Anomaly" v={r.anomalyScore != null ? Number(r.anomalyScore).toFixed(2) : '—'} />
            <Stat k="Engine" v={r.engine || 'built-in'} />
          </div>

          {r.agents?.length > 0 && (
            <div className="dm-section">
              <div className="dm-label">Specialist findings</div>
              {r.agents.map((a, i) => (
                <div key={i} className="dm-agent"><span className="dm-an">▸ {a.agentName}</span><div className="dm-af">{a.finding}</div></div>
              ))}
            </div>
          )}

          {r.rootCause && (
            <div className="dm-section synth">
              <div className="dm-label cyan">◆ Root cause</div>
              <div className="dm-rc">{r.rootCause}</div>
              {r.recommendedAction && (<><div className="dm-label" style={{ marginTop: 10 }}>Action taken</div><div className="dm-act">{r.recommendedAction}</div></>)}
              {r.riskNote && <div className="dm-risk">⚠ {r.riskNote}</div>}
              {r.businessImpact && <div className="dm-impact">💡 {r.businessImpact}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const Stat = ({ k, v }) => (<div className="dm-stat"><span className="dm-sv">{v}</span><span className="dm-sk">{k}</span></div>);
