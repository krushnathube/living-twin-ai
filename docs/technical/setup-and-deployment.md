# Setup & Deployment

## Local
```bash
# backend  → http://localhost:4000
cd backend && npm install && npm start
# frontend → http://localhost:5173 (proxies /api + /socket.io to :4000)
cd frontend && npm install && npm run dev
```
Open http://localhost:5173 (dashboard) and http://localhost:5173/simulator.

## Environment (backend)
See `backend/.env.example`. Key vars: `PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `FLEET_SIZE`,
`AUTO_APPROVE`, `AUTO_APPROVE_DELAY_MS`, `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD/DB_SSL`,
`LLM_API_KEY`, `LLM_MODEL`. Leave `DB_HOST` empty to run fully in-memory.

## Render (two services, one repo)
**Backend — Web Service**
- Root Directory: `backend`
- Build: `npm install` · Start: `node server.js` · Health Check: `/health`
- Env: paste from `.env.example`; set `CORS_ORIGIN` to the frontend URL.

**Frontend — Static Site**
- Root Directory: `frontend`
- Build: `npm install && npm run build` · Publish Directory: `dist`
- Env: `VITE_BACKEND_URL=https://<backend>.onrender.com`
- Rewrite rule: Source `/*` → Destination `/index.html` → **Rewrite** (so `/simulator` works)

Free tier sleeps after inactivity; hit `/health` to wake before a demo.

## Database
Connected automatically when `DB_HOST` is set (Sequelize `sync` creates tables). To seed
reference data, either run the SQL bootstrap or call the bootstrap API — see database.md.
