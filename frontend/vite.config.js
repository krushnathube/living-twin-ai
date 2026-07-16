import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Dev proxy sends /api and /socket.io to the backend on :4000.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:4000', '/socket.io': { target: 'http://localhost:4000', ws: true } } },
  build: { outDir: 'dist' },
});
