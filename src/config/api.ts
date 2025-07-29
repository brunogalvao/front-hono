export const API_BASE_URL =
  import.meta.env.VITE_API_URL || window.location.origin;

console.log('🌐 API_BASE_URL:', API_BASE_URL);
console.log('🌐 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🌐 window.location.origin:', window.location.origin);
