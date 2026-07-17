// Rolling log of recently resolved incidents — feeds the dashboard incident timeline.
// Kept in memory (last N); persisted rows already live in diagnostic_sessions when a DB
// is connected, so this is just the fast display cache.
const MAX = 16;
class IncidentLog {
  constructor() { this.items = []; }
  push(item) { this.items.unshift({ ...item, at: item.at || Date.now() }); if (this.items.length > MAX) this.items.pop(); }
  list() { return this.items; }
}
export const incidentLog = new IncidentLog();
