// Minimal structured logger (no dependency). Swap for pino/winston in production.
const ts = () => new Date().toISOString();
const line = (level, msg, meta) =>
  `[${ts()}] ${level.padEnd(5)} ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`;

export const logger = {
  info: (m, meta) => console.log(line('INFO', m, meta)),
  warn: (m, meta) => console.warn(line('WARN', m, meta)),
  error: (m, meta) => console.error(line('ERROR', m, meta)),
  debug: (m, meta) => process.env.NODE_ENV !== 'production' && console.log(line('DEBUG', m, meta)),
};
