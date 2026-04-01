const isDevelopment = import.meta.env.DEV;
const hasApiUrl =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '';

export const API_BASE_URL = hasApiUrl
  ? import.meta.env.VITE_API_URL
  : isDevelopment
    ? window.location.origin
    : 'https://api-hono-jet.vercel.app';
