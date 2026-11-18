/**
 * src/api/client.ts
 *
 * La única función que habla con el back: apiFetch. Es el fetch de la
 * Clase 14 (res.ok, AbortController) en un solo lugar, para no repetirlo
 * en cada pantalla:
 *   - arma la URL con API_URL,
 *   - manda el body como JSON,
 *   - si hay sesión, agrega el token: Authorization: Bearer <token> (Clase 9),
 *   - si el back responde con error, tira un ApiError con el mensaje que
 *     manda el back. El back responde siempre { error, details? }.
 */
import { API_URL } from "../config";
import { cerrarSesion, getToken } from "../auth/sesion";

// Un error de validación de zod, tal como viene en `details` de un 400
export interface FieldIssue {
  path: (string | number)[];
  message: string;
}

// Error de la API (o de red, con status 0). Lleva el mensaje listo para mostrar.
export class ApiError extends Error {
  status: number;
  details: FieldIssue[];

  constructor(status: number, mensaje: string, details: FieldIssue[] = []) {
    super(mensaje);
    this.status = status;
    this.details = details;
  }
}

export type QueryValue = string | number | boolean | null | undefined;

// { a: 1, b: "", c: undefined } → "?a=1" (los vacíos no se mandan)
export function toQuery(params: Record<string, QueryValue>): string {
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      query.set(clave, String(valor));
    }
  }
  const texto = query.toString();
  return texto === "" ? "" : `?${texto}`;
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal; // para cancelar el request desde el cleanup del useEffect
}

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (e) {
    // Si se canceló a propósito (cleanup del effect), se deja pasar tal cual
    if (options.signal?.aborted) throw e;
    throw new ApiError(0, "No se pudo conectar con el servidor");
  }

  // 401 con sesión abierta = el token venció (dura 2 h): se cierra la sesión
  // y se vuelve al login. Sin sesión (por ej. en el login) es solo un error.
  if (res.status === 401 && token) {
    cerrarSesion();
    window.location.assign("/ingresar");
  }

  if (!res.ok) {
    let cuerpo: { error?: string; details?: FieldIssue[] } = {};
    try {
      cuerpo = await res.json();
    } catch {
      // la respuesta no era JSON
    }
    throw new ApiError(res.status, cuerpo.error ?? `Error ${res.status}`, cuerpo.details ?? []);
  }

  // 204 No Content (por ej. DELETE): no hay cuerpo para leer
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

// Convierte cualquier cosa que se haya tirado en un ApiError listo para mostrar
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) return new ApiError(0, error.message);
  return new ApiError(0, "Error desconocido");
}

// { campo: "mensaje" } a partir de los `details` de un 400 (path[0] es el campo)
export function fieldErrors(error: ApiError): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const issue of error.details) {
    const campo = String(issue.path[0] ?? "");
    if (campo !== "" && !(campo in errores)) errores[campo] = issue.message;
  }
  return errores;
}
