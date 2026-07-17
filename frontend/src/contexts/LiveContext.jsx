// Central live-state store fed by the socket stream. Every dashboard component reads
// from here so there is one source of truth for fleet, telemetry, incident, metrics.
import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { socket } from '../api/socket.js';

const LiveContext = createContext(null);
export const useLive = () => useContext(LiveContext);

const initial = {
  connected: false,
  fleet: { vehicles: [], counts: {}, total: 0 },
  latest: {},                 // vehicleId -> telemetry
  feed: [],
  metrics: { mttrSeconds: 0, faultsDiagnosed: 0, failuresPrevented: 0, costAvoidedCr: 0, activeIncidents: 0, fleetHealthPct: 0, operatorRatio: '1 : 0' },
  incident: null,             // { sessionId, faultLabel, severity, agents:[], results:[], synthesis, status }
  resolved: [],               // recently resolved incidents (timeline)
  healthHistory: [],          // fleet health % samples (sparkline)
  mttrHistory: [],            // MTTR samples per resolution
  costHistory: [],            // cost-avoided samples per resolution
  criticalFlash: 0,           // bumps when a critical incident opens (screen flash)
};

function reducer(state, action) {
  switch (action.type) {
    case 'CONNECTED': return { ...state, connected: action.value };
    case 'FLEET': {
      const counts = action.payload.counts || {};
      const total = action.payload.total || 1;
      const pct = +(((counts.healthy || 0) / total) * 100).toFixed(1);
      const healthHistory = [...state.healthHistory, pct].slice(-60);
      return { ...state, fleet: action.payload, healthHistory };
    }
    case 'TELEMETRY': {
      const latest = { ...state.latest };
      for (const s of action.payload) latest[s.vehicleId] = s;
      return { ...state, latest };
    }
    case 'FEED': return { ...state, feed: [action.payload, ...state.feed].slice(0, 40) };
    case 'METRICS': {
      const mttrHistory = [...state.mttrHistory, action.payload.mttrSeconds].slice(-40);
      const costHistory = [...state.costHistory, action.payload.costAvoidedUsdM].slice(-40);
      return { ...state, metrics: action.payload, mttrHistory, costHistory };
    }
    case 'INCIDENT_OPEN':
      return { ...state, incident: { ...action.payload, results: [], synthesis: null, status: 'diagnosing' }, criticalFlash: action.payload.severity === 'critical' ? state.criticalFlash + 1 : state.criticalFlash };
    case 'AGENT':
      if (!state.incident || state.incident.sessionId !== action.payload.sessionId) return state;
      return { ...state, incident: { ...state.incident, results: [...state.incident.results, action.payload] } };
    case 'DIAGNOSIS':
      if (!state.incident || state.incident.sessionId !== action.payload.sessionId) return state;
      return { ...state, incident: { ...state.incident, synthesis: action.payload, status: 'diagnosed' } };
    case 'AWAIT':
      if (!state.incident || state.incident.sessionId !== action.payload.sessionId) return state;
      return { ...state, incident: { ...state.incident, status: 'awaiting_approval' } };
    case 'HEALED': {
      const resolved = [action.payload, ...state.resolved].slice(0, 16);
      if (!state.incident || state.incident.sessionId !== action.payload.sessionId) return { ...state, resolved };
      return { ...state, resolved, incident: { ...state.incident, status: 'healed', healed: action.payload } };
    }
    case 'INCIDENTS_SNAPSHOT': return { ...state, resolved: action.payload || [] };
    case 'CLEAR_INCIDENT': return { ...state, incident: null };
    default: return state;
  }
}

export function LiveProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const healedTimer = useRef(null);
  const [theme, setTheme] = React.useState(() => (typeof document !== 'undefined' && document.documentElement.dataset.theme) || 'dark');
  React.useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    socket.on('connect', () => dispatch({ type: 'CONNECTED', value: true }));
    socket.on('disconnect', () => dispatch({ type: 'CONNECTED', value: false }));
    socket.on('fleet:snapshot', (p) => dispatch({ type: 'FLEET', payload: p }));
    socket.on('telemetry:tick', (p) => dispatch({ type: 'TELEMETRY', payload: p }));
    socket.on('feed:event', (p) => dispatch({ type: 'FEED', payload: p }));
    socket.on('metrics:update', (p) => dispatch({ type: 'METRICS', payload: p }));
    socket.on('incident:open', (p) => dispatch({ type: 'INCIDENT_OPEN', payload: p }));
    socket.on('incident:agent', (p) => dispatch({ type: 'AGENT', payload: p }));
    socket.on('incident:diagnosis', (p) => dispatch({ type: 'DIAGNOSIS', payload: p }));
    socket.on('incident:await_approval', (p) => dispatch({ type: 'AWAIT', payload: p }));
    socket.on('incidents:snapshot', (p) => dispatch({ type: 'INCIDENTS_SNAPSHOT', payload: p }));
    socket.on('incident:healed', (p) => {
      dispatch({ type: 'HEALED', payload: p });
      clearTimeout(healedTimer.current);
      healedTimer.current = setTimeout(() => dispatch({ type: 'CLEAR_INCIDENT' }), 5000);
    });
    return () => socket.removeAllListeners();
  }, []);

  const BASE = import.meta.env.VITE_BACKEND_URL || '';
  const post = (path, body) => fetch(`${BASE}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) });
  const api = {
    inject: (faultKey, vehicleId) => post('/api/simulator/inject', { faultKey, vehicleId }),
    approve: (sessionId) => post(`/api/recovery/${sessionId}/approve`, { approvedBy: 'Booth Operator' }),
    random: (enabled) => post('/api/simulator/random', { enabled }),
    setAutoApprove: (enabled) => post('/api/simulator/auto-approve', { enabled }),
    schedule: (body) => post('/api/simulator/schedule', body),
    getCostModel: () => fetch(`${BASE}/api/dashboard/cost-model`).then((r) => r.json()),
    updateCostModel: (patch) => post('/api/dashboard/cost-model', patch).then((r) => r.json()),
    device: (id) => ({
      mode: (mode) => post(`/api/simulator/device/${id}/mode`, { mode }),
      override: (field, value) => post(`/api/simulator/device/${id}/override`, { field, value }),
      clearOverrides: () => post(`/api/simulator/device/${id}/override`, { clear: true }),
      fault: (faultKey) => post(`/api/simulator/device/${id}/fault`, { faultKey }),
      incident: (faultKey) => post(`/api/simulator/device/${id}/incident`, { faultKey }),
      recover: () => post(`/api/simulator/device/${id}/recover`, {}),
    }),
  };

  return <LiveContext.Provider value={{ ...state, api, theme, toggleTheme }}>{children}</LiveContext.Provider>;
}
