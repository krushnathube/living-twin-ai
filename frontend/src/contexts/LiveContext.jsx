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
};

function reducer(state, action) {
  switch (action.type) {
    case 'CONNECTED': return { ...state, connected: action.value };
    case 'FLEET': return { ...state, fleet: action.payload };
    case 'TELEMETRY': {
      const latest = { ...state.latest };
      for (const s of action.payload) latest[s.vehicleId] = s;
      return { ...state, latest };
    }
    case 'FEED': return { ...state, feed: [action.payload, ...state.feed].slice(0, 40) };
    case 'METRICS': return { ...state, metrics: action.payload };
    case 'INCIDENT_OPEN':
      return { ...state, incident: { ...action.payload, results: [], synthesis: null, status: 'diagnosing' } };
    case 'AGENT':
      if (!state.incident || state.incident.sessionId !== action.payload.sessionId) return state;
      return { ...state, incident: { ...state.incident, results: [...state.incident.results, action.payload] } };
    case 'DIAGNOSIS':
      if (!state.incident || state.incident.sessionId !== action.payload.sessionId) return state;
      return { ...state, incident: { ...state.incident, synthesis: action.payload, status: 'diagnosed' } };
    case 'AWAIT':
      if (!state.incident || state.incident.sessionId !== action.payload.sessionId) return state;
      return { ...state, incident: { ...state.incident, status: 'awaiting_approval' } };
    case 'HEALED':
      if (!state.incident || state.incident.sessionId !== action.payload.sessionId) return state;
      return { ...state, incident: { ...state.incident, status: 'healed', healed: action.payload } };
    case 'CLEAR_INCIDENT': return { ...state, incident: null };
    default: return state;
  }
}

export function LiveProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const healedTimer = useRef(null);

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
    socket.on('incident:healed', (p) => {
      dispatch({ type: 'HEALED', payload: p });
      clearTimeout(healedTimer.current);
      healedTimer.current = setTimeout(() => dispatch({ type: 'CLEAR_INCIDENT' }), 5000);
    });
    return () => socket.removeAllListeners();
  }, []);

  const BASE = import.meta.env.VITE_BACKEND_URL || '';
  const api = {
    inject: (faultKey) => fetch(`${BASE}/api/simulator/inject`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ faultKey }) }),
    approve: (sessionId) => fetch(`${BASE}/api/recovery/${sessionId}/approve`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ approvedBy: 'Booth Operator' }) }),
  };

  return <LiveContext.Provider value={{ ...state, api }}>{children}</LiveContext.Provider>;
}
