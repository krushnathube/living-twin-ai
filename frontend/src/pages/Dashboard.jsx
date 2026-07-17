import React from 'react';
import TopBar from '../components/TopBar.jsx';
import FleetMap from '../components/FleetMap.jsx';
import TelemetryFeed from '../components/TelemetryFeed.jsx';
import AICouncil from '../components/AICouncil.jsx';
import Metrics from '../components/Metrics.jsx';
import IncidentTimeline from '../components/IncidentTimeline.jsx';
import { useLive } from '../contexts/LiveContext.jsx';

// The Command Center is monitoring-only. All control lives in the Device Simulator page.
export default function Dashboard() {
  const { criticalFlash } = useLive();
  return (
    <div className="app">
      <div key={criticalFlash} className={criticalFlash ? 'crit-flash' : ''} />
      <TopBar />
      <div className="grid">
        <TelemetryFeed />
        <main className="col center"><FleetMap /></main>
        <AICouncil />
      </div>
      <Metrics />
      <IncidentTimeline />
    </div>
  );
}
