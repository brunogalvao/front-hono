// Detecta o ambiente e configura a URL da API adequadamente
const isDevelopment = import.meta.env.DEV;
const hasApiUrl =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '';

export const API_BASE_URL = hasApiUrl
  ? import.meta.env.VITE_API_URL
  : isDevelopment
    ? window.location.origin // Usa proxy local em desenvolvimento
    : 'https://api-hono-jet.vercel.app'; // Fallback para produção

console.log('🌐 Ambiente:', isDevelopment ? 'development' : 'production');
console.log('🌐 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🌐 hasApiUrl:', hasApiUrl);
console.log('🌐 API_BASE_URL final:', API_BASE_URL);
console.log('🌐 window.location.origin:', window.location.origin);
