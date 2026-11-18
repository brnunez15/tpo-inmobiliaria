/**
 * src/components/Paginacion.tsx
 *
 * ◀ 1 … 4 5 6 … 12 ▶  — Usa el `meta` que devuelven los listados paginados
 * del back ({ total, page, limit, totalPages }). No guarda estado: la página
 * vive en la URL (?page=), y este componente solo avisa cuál se eligió.
 */
import type { Meta } from "../api/types";

// Páginas visibles: siempre la primera, la última y las vecinas a la actual
function paginasVisibles(actual: number, total: number): (number | "…")[] {
  const paginas: (number | "…")[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - actual) <= 1) {
      paginas.push(p);
    } else if (paginas[paginas.length - 1] !== "…") {
      paginas.push("…");
    }
  }
  return paginas;
}

export function Paginacion({ meta, onCambiar }: { meta: Meta; onCambiar: (pagina: number) => void }) {
  if (meta.totalPages <= 1) return null;

  return (
    <nav className="chips" aria-label="Paginación">
      <button type="button" className="chip" disabled={meta.page === 1} onClick={() => onCambiar(meta.page - 1)}>
        ◀
      </button>
      {paginasVisibles(meta.page, meta.totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`puntos-${i}`}>…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={p === meta.page ? "chip activo" : "chip"}
            onClick={() => onCambiar(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="chip"
        disabled={meta.page === meta.totalPages}
        onClick={() => onCambiar(meta.page + 1)}
      >
        ▶
      </button>
    </nav>
  );
}
