/**
 * src/hooks/useNovedadesSinLeer.ts
 *
 * El contador 🔔 del menú del panel. Es el useConsultasSinResponder de la
 * Clase 15 (polling): pide la cantidad de novedades sin leer al montar y
 * después cada `cadaMs`, con setInterval. El cleanup corta el intervalo y
 * cancela el request en curso.
 */
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export function useNovedadesSinLeer(agencyId: number | null, cadaMs: number): number {
  const [sinLeer, setSinLeer] = useState(0);

  useEffect(() => {
    if (agencyId === null) return;
    const controller = new AbortController();

    async function consultar() {
      try {
        const { count } = await apiFetch<{ count: number }>(`/agencies/${agencyId}/activity/unread-count`, {
          signal: controller.signal,
        });
        setSinLeer(count);
      } catch {
        // Un error puntual no rompe el panel: queda el último valor conocido.
      }
    }
    consultar();
    const intervalo = setInterval(consultar, cadaMs);

    return () => {
      clearInterval(intervalo);
      controller.abort();
    };
  }, [agencyId, cadaMs]);

  return sinLeer;
}
