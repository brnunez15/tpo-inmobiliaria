// La URL del back sale de una variable de entorno (Clase 14, comun/api.ts).
// Copiar .env.example a .env; si no hay .env, se usa el back local.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
