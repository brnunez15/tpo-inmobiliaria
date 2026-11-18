/**
 * src/auth/sesion.ts
 *
 * La sesión del vendedor, como en la Clase 13 (3.3-protegidas/sesion.ts):
 * funciones simples sobre localStorage. "token" es el JWT que devuelve
 * POST /auth/login o POST /auth/register (Clase 9); "agencyId" es la
 * inmobiliaria del vendedor, que el panel usa en casi todas sus URLs.
 */
const CLAVE_TOKEN = "token";
const CLAVE_AGENCIA = "agencyId";

export function haySesion(): boolean {
  return localStorage.getItem(CLAVE_TOKEN) !== null;
}

// Se llama con la respuesta del login o del registro: { token, sellerId, agencyId }
export function iniciarSesion(token: string, agencyId: number | null) {
  localStorage.setItem(CLAVE_TOKEN, token);
  if (agencyId === null) {
    // El vendedor eliminó su inmobiliaria: puede entrar, pero no tiene panel de inmobiliaria
    localStorage.removeItem(CLAVE_AGENCIA);
  } else {
    localStorage.setItem(CLAVE_AGENCIA, String(agencyId));
  }
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_AGENCIA);
}

export function getToken(): string | null {
  return localStorage.getItem(CLAVE_TOKEN);
}

// null si no hay sesión o si el vendedor no tiene inmobiliaria
export function getAgencyId(): number | null {
  const valor = localStorage.getItem(CLAVE_AGENCIA);
  return valor === null ? null : Number(valor);
}
