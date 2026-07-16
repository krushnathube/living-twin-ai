// Minimal auth for the demo: issues a JWT for known demo users. Replace with a real
// user store + bcrypt password hashing for production (models are already defined).
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { ROLES } from '../../constants/index.js';

const DEMO_USERS = [
  { id: 'U-ADMIN', email: 'admin@livingtwin.ai', name: 'Fleet Admin', role: ROLES.ADMIN },
  { id: 'U-OPS', email: 'operator@livingtwin.ai', name: 'Ops Operator', role: ROLES.OPERATOR },
];
const DEMO_PASSWORD = 'living-twin';

export const authService = {
  login(email, password) {
    const user = DEMO_USERS.find((u) => u.email === email);
    if (!user || password !== DEMO_PASSWORD) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
    const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiresIn });
    return { token, user };
  },
  verify(token) { return jwt.verify(token, config.auth.jwtSecret); },
};
