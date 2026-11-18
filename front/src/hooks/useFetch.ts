/**
 * src/hooks/useFetch.ts
 *
 * El useFetch de la Clase 15 (2.1-use-fetch), usando apiFetch para que
 * mande el token. Pide `path` cada vez que cambia y cancela el request
 * anterior con AbortController (Clase 14).
 *   - path = null: no pide nada (útil cuando todavía falta un dato, como el id).
 *   - Un 404 no es un error: es "no existe", y deja datos en null.
 *   - setDatos: para reflejar un cambio sin volver a pedir (por ej. después de un PATCH).
 *   - recargar(): vuelve a pedir lo mismo (por ej. después de cambiar un estado).
 */
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { apiFetch, toApiError } from "../api/client";

export type Carga<T> = {
  datos: T | null;
  setDatos: Dispatch<SetStateAction<T | null>>;
  cargando: boolean;
  error: string | null;
  recargar: () => void;
};

export function useFetch<T>(path: string | null): Carga<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(path !== null);
  const [error, setError] = useState<string | null>(null);
  // Cambiar este número vuelve a correr el effect: es lo que hace recargar()
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (path === null) {
      setCargando(false);
      return;
    }
    const controller = new AbortController();

    async function cargar(url: string) {
      setCargando(true);
      setError(null);
      try {
        setDatos(await apiFetch<T>(url, { signal: controller.signal }));
        setCargando(false);
      } catch (e) {
        if (controller.signal.aborted) return;
        const apiError = toApiError(e);
        if (apiError.status === 404) {
          setDatos(null);
        } else {
          setError(apiError.message);
        }
        setCargando(false);
      }
    }
    cargar(path);

    return () => controller.abort();
  }, [path, version]);

  return { datos, setDatos, cargando, error, recargar: () => setVersion((v) => v + 1) };
}
