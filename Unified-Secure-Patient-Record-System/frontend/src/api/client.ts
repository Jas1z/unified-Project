import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/** Vite proxy on desktop; direct backend URL for WebView / LAN / emulator */
function resolveApiBase(): string {
  const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envBase) return envBase.replace(/\/$/, '');

  if (typeof window === 'undefined') return '/api';

  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api';
  }

  // Same machine as Vite (emulator 10.0.2.2, LAN IP, device) → backend port 8000
  return `http://${hostname}:8000`;
}

const client = axios.create({
  baseURL: resolveApiBase(),
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default client;
