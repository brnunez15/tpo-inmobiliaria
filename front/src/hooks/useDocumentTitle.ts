/**
 * src/hooks/useDocumentTitle.ts
 *
 * Pone el título de la pestaña del navegador mientras la pantalla está
 * montada y lo restaura al salir.
 */
import { useEffect } from "react";

export function useDocumentTitle(titulo: string) {
  useEffect(() => {
    const anterior = document.title;
    document.title = `${titulo} · Casa a Casa`;
    // El cleanup corre al desmontar la pantalla (o si cambia el título)
    return () => {
      document.title = anterior;
    };
  }, [titulo]);
}
