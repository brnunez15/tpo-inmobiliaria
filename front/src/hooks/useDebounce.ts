/**
 * src/hooks/useDebounce.ts
 *
 * El useDebounce de la Clase 15: devuelve el mismo valor, pero recién
 * cuando dejó de cambiar durante `ms`. Sirve para la búsqueda de texto:
 * no se pide a la API por cada letra.
 */
import { useEffect, useState } from "react";

export function useDebounce<T>(valor: T, ms: number): T {
  const [demorado, setDemorado] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setDemorado(valor), ms);
    return () => clearTimeout(timer);
  }, [valor, ms]);

  return demorado;
}
