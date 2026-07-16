import React from 'react';
import TopBar from '../components/TopBar.jsx';
import FleetMap from '../components/FleetMap.jsx';
import TelemetryFeed from '../components/TelemetryFeed.jsx';
import AICouncil from '../components/AICouncil.jsx';
import Metrics from '../components/Metrics.jsx';
import Controls from '../components/Controls.jsx';

export default function Dashboard() {
  return (
    <div className="app">
      <TopBar />
      <div className="grid">
        <TelemetryFeed />
        <main className="col center"><FleetMap /></main>
        <AICouncil />
      </div>
      <Metrics />
      <Controls />
    </div>
  );
}
