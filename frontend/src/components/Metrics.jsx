import React from 'react';
import { useLive } from '../contexts/LiveContext.jsx';

export default function Metrics() {
  const { metrics: m } = useLive();
  return (
    <div className="metrics">
      <Metric hl k="Mean time to resolution" v={m.mttrSeconds} u="sec" />
      <Metric k="Faults auto-diagnosed" v={(m.faultsDiagnosed || 0).toLocaleString('en-IN')} />
      <Metric k="Field failures prevented" v={m.failuresPrevented} />
      <Metric k="Est. cost avoided (yr)" v={`₹${m.costAvoidedCr}`} u="Cr" />
    </div>
  );
}
const Metric = ({ k, v, u, hl }) => (
  <div className={`metric ${hl ? 'hl' : ''}`}><span className="k">{k}</span><span className="v">{v}{u && <span className="u">{u}</span>}</span></div>
);
