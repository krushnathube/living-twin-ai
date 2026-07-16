// Central configuration. All env access funnels through here (12-factor).
import dotenv from 'dotenv';
dotenv.config();

const bool = (v, d = false) => (v == null ? d : String(v).toLowerCase() === 'true');
const int = (v, d) => (v == null || v === '' ? d : parseInt(v, 10));

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: int(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  },

  db: {
    host: process.env.DB_HOST || '',
    port: int(process.env.DB_PORT, 3306),
    name: process.env.DB_NAME || 'living_twin',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    ssl: bool(process.env.DB_SSL, true),
    // DB is optional: when host is blank the platform runs fully in-memory.
    enabled: !!(process.env.DB_HOST && process.env.DB_HOST.trim()),
  },

  simulator: {
    intervalMs: int(process.env.SIM_INTERVAL_MS, 2000),
    fleetSize: int(process.env.FLEET_SIZE, 50),
    incidentMinGapMs: int(process.env.INCIDENT_MIN_GAP_MS, 7000),
    incidentMaxGapMs: int(process.env.INCIDENT_MAX_GAP_MS, 13000),
    autoApprove: bool(process.env.AUTO_APPROVE, true),
    autoApproveDelayMs: int(process.env.AUTO_APPROVE_DELAY_MS, 3000),
  },

  llm: {
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'claude-sonnet-4-6',
    enabled: !!(process.env.LLM_API_KEY && process.env.LLM_API_KEY.trim()),
  },
};
