import React from 'react';
import { LiveProvider } from './contexts/LiveContext.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <LiveProvider>
      <Dashboard />
    </LiveProvider>
  );
}
