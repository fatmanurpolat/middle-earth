// Resolves the dashboard URL from the Vite env, with a dev default.
export const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL ?? 'http://localhost:5174';
