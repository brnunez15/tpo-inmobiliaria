/**
 * src/pages/panel/TarjetaVisita.tsx
 *
 * Una solicitud de visita, con sus acciones (TarjetaSolicitud del integrador
 * de la Clase 15). Tiene su propio useAccion: al confirmar una, solo sus
 * botones quedan deshabilitados y las demás se pueden responder a la vez.
 */
import { apiFetch } from "../../api/client";
import type { VisitRequest, VisitStatus } from "../../api/types";
import { BadgeEstadoVisita } from "../../components/Badge";
import { useAccion } from "../../hooks/useAccion";
import { formatDateTime } from "../../utils/format";
import estilos from "./Visitas.module.css";

interface Accion {
  texto: string;
  estado: VisitStatus;
  destructiva?: boolean;
}

// Pendiente → Confirmada → Realizada; Rechazada o Cancelada en cualquier momento (enunciado)
function accionesPara(v: VisitRequest): Accion[] {
  if (v.status === "PENDING") {
    return [{ texto: "Confirmar", estado: "CONFIRMED" }, { texto: "Rechazar", estado: "REJECTED", destructiva: true }];
  }
  if (v.status === "CONFIRMED") {
    return [{ texto: "Marcar realizada", estado: "COMPLETED" }, { texto: "Cancelar", estado: "CANCELLED", destructiva: true }];
  }
  return [];
}

export default function TarjetaVisita({
  visita: v,
  onRespondida,
}: {
  visita: VisitRequest;
  onRespondida: (id: number, estado: VisitStatus) => void;
}) {
  const responder = useAccion(async (estado: VisitStatus) => {
    await apiFetch(`/visit-requests/${v.id}/status`, { method: "PATCH", body: { status: estado } });
    // Se avisa al padre para que actualice la lista sin volver a pedirla
    onRespondida(v.id, estado);
  });

  function pedirAccion(accion: Accion) {
    if (accion.destructiva && !window.confirm(`¿${accion.texto} la visita de ${v.requesterName}?`)) return;
    responder.ejecutar(accion.estado);
  }

  return (
    <div className={`${estilos.solicitud} ${estilos[v.status]}`}>
      <p>
        <strong>{v.requesterName}</strong> · 📞 {v.requesterPhone} · {formatDateTime(v.proposedDate)}{" "}
        <BadgeEstadoVisita status={v.status} />
      </p>
      {v.message && <small>“{v.message}”</small>}
      <div className="botones">
        {accionesPara(v).map((accion) => (
          <button
            key={accion.estado}
            type="button"
            className={accion.destructiva ? "boton peligro" : "boton"}
            disabled={responder.pendiente}
            onClick={() => pedirAccion(accion)}
          >
            {accion.texto}
          </button>
        ))}
      </div>
      {responder.error && <p className="error">No se pudo responder: {responder.error}</p>}
    </div>
  );
}
