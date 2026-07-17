import React, { useState } from 'react';
import { useLive } from '../contexts/LiveContext.jsx';
import { Sparkline } from './Spark.jsx';
import CostModelModal from './CostModelModal.jsx';

export default function Metrics() {
  const { metrics: m, mttrHistory } = useLive();
  const [showCost, setShowCost] = useState(false);
  return (
    <>
      <div className="metrics">
        <Metric hl k="Mean time to resolution" v={m.mttrSeconds} u="sec" spark={mttrHistory} color="#3ad6ff" />
        <Metric k="Faults auto-diagnosed" v={(m.faultsDiagnosed || 0).toLocaleString('en-IN')} />
        <Metric k="Field failures prevented" v={m.failuresPrevented} />
        <div className="metric clickable" onClick={() => setShowCost(true)} title="View / edit the cost model">
          <span className="k">Est. cost avoided (yr) <span className="metric-info">ⓘ</span></span>
          <span className="v">${m.costAvoidedUsdM}<span className="u">M</span></span>
          <span className="metric-hint">tap for assumptions</span>
        </div>
      </div>
      {showCost && <CostModelModal onClose={() => setShowCost(false)} />}
    </>
  );
}
const Metric = ({ k, v, u, hl, spark, color }) => (
  <div className={`metric ${hl ? 'hl' : ''}`}>
    <span className="k">{k}</span>
    <span className="v">{v}{u && <span className="u">{u}</span>}</span>
    {spark && <div className="metric-spark"><Sparkline data={spark} color={color} w={150} h={22} /></div>}
  </div>
);
