// Single shared socket connection. In dev, Vite proxies to the backend; in prod set
// VITE_BACKEND_URL to the deployed backend origin.
import { io } from 'socket.io-client';
const url = import.meta.env.VITE_BACKEND_URL || undefined; // undefined => same origin
export const socket = io(url, { transports: ['websocket', 'polling'], autoConnect: true });
