// Shared enums / constants used across modules.
export const HEALTH = Object.freeze({
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
  OFFLINE: 'offline',
  HEALING: 'healing',
});

export const INCIDENT_STATUS = Object.freeze({
  DETECTED: 'detected',
  DIAGNOSING: 'diagnosing',
  AWAITING_APPROVAL: 'awaiting_approval',
  HEALING: 'healing',
  RESOLVED: 'resolved',
});

export const SOCKET_EVENTS = Object.freeze({
  FLEET_SNAPSHOT: 'fleet:snapshot',
  TELEMETRY: 'telemetry:tick',
  FEED: 'feed:event',
  INCIDENT_OPEN: 'incident:open',
  AGENT_RESULT: 'incident:agent',
  DIAGNOSIS: 'incident:diagnosis',
  AWAIT_APPROVAL: 'incident:await_approval',
  HEALED: 'incident:healed',
  METRICS: 'metrics:update',
  INCIDENTS: 'incidents:snapshot',
});

export const ROLES = Object.freeze({ ADMIN: 'admin', OPERATOR: 'operator', VIEWER: 'viewer' });
