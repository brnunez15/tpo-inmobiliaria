/**
 * src/hooks/useLocalStorage.ts
 *
 * Un useState que sobrevive a la recarga. Acá se usa para recordar el nombre
 * y el email del interesado al dejar una consulta o pedir una visita.
 */
import { useEffect, useState } from "react";

export function useLocalStorage<T>(clave: string, inicial: T) {
  // El valor inicial se lee una sola vez: de localStorage, o el `inicial` si no hay nada
  const [valor, setValor] = useState<T>(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado === null ? inicial : (JSON.parse(guardado) as T);
    } catch {
      return inicial;
    }
  });

  // Cada vez que el valor cambia, se guarda
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      /* sin localStorage: queda solo en memoria */
    }
  }, [clave, valor]);

  return [valor, setValor] as const;
}