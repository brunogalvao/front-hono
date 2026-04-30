const configuredApiUrl = import.meta.env.VITE_API_URL?.trim() ?? '';

export const API_BASE_URL = configuredApiUrl !== ''
  ? configuredApiUrl
  : import.meta.env.DEV
    ? window.location.origin
    : 'https://api-hono-jet.vercel.app';
