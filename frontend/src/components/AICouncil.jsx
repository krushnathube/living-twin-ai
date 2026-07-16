import React from 'react';
import { useLive } from '../contexts/LiveContext.jsx';

// AI Diagnostic Council panel: streams specialist findings, supervisor synthesis, and
// the human-in-the-loop approval control (or the auto-heal confirmation in booth mode).
export default function AICouncil() {
  const { incident, api } = useLive();

  return (
    <section className="col right">
      <div className="panel-h"><span className="sq" />AI Diagnostic Council · Live reasoning</div>
      <div className="council">
        {!incident && (
          <div className="empty">
            <b>Diagnostics on standby</b>
            Fleet nominal. No active incidents.<br /><br />
            The Council watches every vehicle's telemetry. When a fault emerges, specialist agents diagnose the root cause, propose a fix, and recovery runs on your approval.
          </div>
        )}
        {incident && <IncidentCard incident={incident} api={api} />}
      </div>
    </section>
  );
}

function IncidentCard({ incident, api }) {
  const s = incident.synthesis;
  const healed = incident.status === 'healed';
  return (
    <div className={`inc-card ${healed ? 'healed' : ''}`}>
      <div className="inc-head">
        <div className="veh">◉ {incident.vehicleId} · region west · {(incident.severity || '').toUpperCase()}</div>
        <div className="fault">{incident.faultLabel}</div>
        <div className="meta">
          anomaly score {(incident.anomalyScore ?? 0).toFixed(2)} · {(incident.agents || []).length} agents engaged
          {s?.engine && <> · {s.engine}</>}
        </div>
      </div>

      <div className="agents">
        {incident.results.map((r, i) => (
          <div key={i} className="agent done">
            <div className="an"><span>▸ {r.agentName}</span><span className="st">confirmed</span></div>
            <div className="txt">{r.finding}</div>
          </div>
        ))}
        {incident.status === 'diagnosing' && <div className="agent active"><div className="an"><span>▸ analysing…</span></div></div>}
      </div>

      {s && (
        <div className="synth">
          <div className="lab">◆ Root cause synthesis <span className="conf">confidence {s.confidence}%</span></div>
          <div className="rc">{s.rootCause}</div>
          <div className="act"><div className="k">Recommended action</div><div className="v">{s.recommendedAction}</div></div>
          <div className="grid2">
            <span className="chip">Risk {s.riskScore}</span>
            <span className="chip">Est. MTTR {s.mttrEstimate}s</span>
          </div>
          <div className="risk">⚠ {s.riskNote}</div>
          {s.businessImpact && <div className="impact">💡 {s.businessImpact}</div>}
        </div>
      )}

      {incident.status === 'awaiting_approval' && (
        <div className="approve">
          <button className="btn approve-glow" onClick={() => api.approve(incident.sessionId)}>✓ Approve &amp; heal</button>
        </div>
      )}
      {healed && (
        <div className="healed-note">
          <span className="big">✓ Healed in {incident.healed?.durationSeconds}s</span><br />
          {incident.healed?.autoApproved ? 'Auto-remediated' : `Approved by ${incident.healed?.approvedBy}`} · vehicle returned to service.
        </div>
      )}
    </div>
  );
}
