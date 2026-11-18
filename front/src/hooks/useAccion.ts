/**
 * src/hooks/useAccion.ts
 *
 * El useAccion del integrador de la Clase 15: recibe una función async
 * (un PATCH, un DELETE…) y devuelve `ejecutar`, `pendiente` y `error`.
 * Cada componente que lo llama tiene su propio estado: si en una lista cada
 * fila usa su useAccion, al confirmar una solo esa queda deshabilitada y el
 * error aparece en esa fila.
 */
import { useState } from "react";
import { toApiError } from "../api/client";

export type Accion<A extends unknown[]> = {
  ejecutar: (...args: A) => Promise<void>;
  pendiente: boolean;
  error: string | null;
};

export function useAccion<A extends unknown[]>(accion: (...args: A) => Promise<void>): Accion<A> {
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ejecutar(...args: A) {
    setPendiente(true);
    setError(null);
    try {
      await accion(...args);
    } catch (e) {
      // El mensaje viene del back (por ej. "Para publicar, la propiedad tiene que tener al menos una foto")
      setError(toApiError(e).message);
    } finally {
      setPendiente(false);
    }
  }

  return { ejecutar, pendiente, error };
}
