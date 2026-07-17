import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LiveProvider } from './contexts/LiveContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Simulator from './pages/Simulator.jsx';

// No top nav: the Command Center is the default view. The Device Simulator is a tool
// page reachable directly at /simulator.
export default function App() {
  return (
    <LiveProvider>
      <BrowserRouter>
        <div className="shell">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulator" element={<Simulator />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LiveProvider>
  );
}
