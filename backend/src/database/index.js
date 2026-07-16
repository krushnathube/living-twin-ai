// Sequelize bootstrap. DB is OPTIONAL: if config.db.enabled is false the platform
// runs fully in-memory (ideal for a booth laptop or a fresh Render deploy with no RDS yet).
import { Sequelize } from 'sequelize';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';

let sequelize = null;

export const getSequelize = () => sequelize;

export async function initDatabase() {
  if (!config.db.enabled) {
    logger.warn('DB disabled (DB_HOST empty) — running in-memory. Set RDS env vars to persist.');
    return null;
  }
  sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: false,
    dialectOptions: config.db.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  });
  try {
    await sequelize.authenticate();
    logger.info('Connected to AWS RDS MySQL', { host: config.db.host, db: config.db.name });
    const { initModels } = await import('../models/index.js');
    initModels(sequelize);
    await sequelize.sync({ alter: true }); // dev-friendly; use migrations in prod
    logger.info('Models synced');
    return sequelize;
  } catch (e) {
    logger.error('DB init failed — falling back to in-memory', { msg: e.message });
    sequelize = null;
    return null;
  }
}
