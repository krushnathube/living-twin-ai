import React from 'react';
import { useLive } from '../contexts/LiveContext.jsx';
import { Sparkline, Donut } from './Spark.jsx';

export default function HealthTrend() {
  const { healthHistory, metrics } = useLive();
  const pct = metrics.fleetHealthPct ?? 100;
  return (
    <div className="health-trend">
      <Donut pct={pct} />
      <div className="ht-body">
        <div className="ht-label">Fleet health · last 2 min</div>
        <Sparkline data={healthHistory} color={pct >= 95 ? '#2fe08a' : '#ffb020'} w={190} h={30} />
      </div>
    </div>
  );
}
