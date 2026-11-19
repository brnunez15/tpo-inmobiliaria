/**
 * src/pages/panel/FilaPropiedad.tsx
 *
 * Una propiedad de "Mis propiedades" con sus acciones. Cada fila tiene su
 * propio useAccion (integrador de la Clase 15): mientras se cambia el estado
 * de una, solo sus botones quedan deshabilitados, y si el back la rechaza
 * (por ej. "publicar sin foto") el error aparece en esa fila.
 */
import { Link } from "react-router";
import { apiFetch } from "../../api/client";
import type { Property, PropertyStatus } from "../../api/types";
import { BadgeEstadoPropiedad } from "../../components/Badge";
import { useAccion } from "../../hooks/useAccion";
import { formatPrice } from "../../utils/format";
import { OPERATION_LABELS, TYPE_LABELS } from "../../utils/labels";

interface Accion {
  texto: string;
  estado: PropertyStatus;
  destructiva?: boolean; // pide confirmación antes (criterio de UX del enunciado)
}

const DAR_DE_BAJA: Accion = { texto: "Dar de baja", estado: "CANCELLED", destructiva: true };

// Acciones disponibles según el estado (el back valida igual cada transición)
function accionesPara(p: Property): Accion[] {
  switch (p.status) {
    case "DRAFT":
      return [{ texto: "Publicar", estado: "PUBLISHED" }, DAR_DE_BAJA];
    case "PUBLISHED":
      return [{ texto: "Pausar", estado: "PAUSED" }, { texto: "Marcar reservada", estado: "RESERVED" }, DAR_DE_BAJA];
    case "PAUSED":
      return [{ texto: "Republicar", estado: "PUBLISHED" }, DAR_DE_BAJA];
    case "RESERVED":
      return [
        { texto: "Volver a publicar", estado: "PUBLISHED" },
        p.operation === "SALE"
          ? { texto: "Marcar vendida", estado: "SOLD", destructiva: true }
          : { texto: "Marcar alquilada", estado: "RENTED", destructiva: true },
        DAR_DE_BAJA,
      ];
    default:
      return []; // Vendida, Alquilada y Cancelada ya no cambian
  }
}

// Vendida, Alquilada o Cancelada ya no se editan (enunciado)
function esEditable(p: Property): boolean {
  return p.status !== "SOLD" && p.status !== "RENTED" && p.status !== "CANCELLED";
}

export default function FilaPropiedad({ propiedad: p, onCambio }: { propiedad: Property; onCambio: () => void }) {
  const cambiarEstado = useAccion(async (estado: PropertyStatus) => {
    await apiFetch(`/properties/${p.id}/status`, { method: "PATCH", body: { status: estado } });
    onCambio(); // la lista se vuelve a pedir: con un filtro activo, la propiedad puede dejar de aparecer
  });

  function pedirAccion(accion: Accion) {
    if (accion.destructiva && !window.confirm(`¿${accion.texto} "${p.title}"? No se puede deshacer.`)) return;
    cambiarEstado.ejecutar(accion.estado);
  }

  return (
    <article className="fila">
      {p.coverImageUrl ? <img src={p.coverImageUrl} alt="" /> : <div className="sin-foto">Sin foto</div>}
      <div>
        <h2>{p.title}</h2>
        <p>
          {TYPE_LABELS[p.type]} · {OPERATION_LABELS[p.operation]} · {formatPrice(p.price, p.currency, p.operation)} ·{" "}
          {p.area}
        </p>
        {p.consultasSinResponder !== undefined && p.consultasSinResponder > 0 && (
          <p>
            <Link to="/panel/consultas?unanswered=true" className="alerta">
              {p.consultasSinResponder} consulta(s) sin responder
            </Link>
          </p>
        )}
        <div className="botones">
          {esEditable(p) && (
            <Link to={`/panel/propiedades/${p.id}/editar`} className="boton">
              Editar
            </Link>
          )}
          {accionesPara(p).map((accion) => (
            <button
              key={accion.estado}
              type="button"
              className={accion.destructiva ? "boton peligro" : "boton"}
              disabled={cambiarEstado.pendiente}
              onClick={() => pedirAccion(accion)}
            >
              {accion.texto}
            </button>
          ))}
        </div>
        {cambiarEstado.error && <p className="error">{cambiarEstado.error}</p>}
      </div>
      <BadgeEstadoPropiedad status={p.status} />
    </article>
  );
}
