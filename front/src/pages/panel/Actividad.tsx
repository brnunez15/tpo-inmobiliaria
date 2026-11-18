/**
 * src/pages/panel/Actividad.tsx
 *
 * El feed de novedades de la inmobiliaria (enunciado): nueva consulta, nueva
 * solicitud de visita, cambio de estado de una propiedad y nueva reseña.
 * Al abrir una novedad se marca como leída y lleva a la sección que corresponde.
 *
 * PIDE A LA API:
 *   - GET /agencies/:agencyId/activity
 *   - PATCH /activity/:id/read
 *   - PATCH /agencies/:agencyId/activity/read-all
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, toApiError } from "../../api/client";
import type { Activity } from "../../api/types";
import { getAgencyId } from "../../auth/sesion";
import { Alerta } from "../../components/Alerta";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { useFetch } from "../../hooks/useFetch";
import { timeAgo } from "../../utils/format";
import { ACTIVITY_LABELS, STATUS_LABELS } from "../../utils/labels";

// Texto de la novedad y la sección del panel a la que lleva
function describir(a: Activity): { texto: string; detalle?: string; destino: string } {
  const titulo = a.property ? `"${a.property.title}"` : "";
  switch (a.type) {
    case "COMMENT":
      return { texto: `${ACTIVITY_LABELS.COMMENT} en ${titulo}`, detalle: a.comment?.content, destino: "/panel/consultas" };
    case "VISIT_REQUEST":
      return {
        texto: `${ACTIVITY_LABELS.VISIT_REQUEST} — ${titulo}`,
        detalle: a.visitRequest ? `${a.visitRequest.requesterName} · ${a.visitRequest.requesterPhone}` : undefined,
        destino: "/panel/visitas",
      };
    case "PROPERTY_STATUS_CHANGE":
      return {
        texto: `${titulo} pasó a ${a.property ? STATUS_LABELS[a.property.status] : "otro estado"}`,
        destino: "/panel/propiedades",
      };
    case "REVIEW":
      return {
        texto: `${ACTIVITY_LABELS.REVIEW} de ${a.review?.authorName ?? "un interesado"}`,
        detalle: a.review ? `${"★".repeat(a.review.rating)} “${a.review.content}”` : undefined,
        destino: "/panel/inmobiliaria",
      };
  }
}

export default function Actividad() {
  const agencyId = getAgencyId();
  const navigate = useNavigate();
  const { datos: novedades, setDatos: setNovedades, cargando, error, recargar } = useFetch<Activity[]>(
    `/agencies/${agencyId}/activity`,
  );
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  if (cargando) return <Cargando texto="Cargando novedades…" />;
  if (error || !novedades) return <ErrorCarga error={`No se pudieron cargar las novedades: ${error}`} onReintentar={recargar} />;

  const sinLeer = novedades.filter((a) => !a.read).length;

  async function abrir(a: Activity, destino: string) {
    setErrorAccion(null);
    try {
      if (!a.read) await apiFetch(`/activity/${a.id}/read`, { method: "PATCH" });
      navigate(destino);
    } catch (e) {
      setErrorAccion(toApiError(e).message);
    }
  }

  async function marcarTodas() {
    setErrorAccion(null);
    try {
      await apiFetch(`/agencies/${agencyId}/activity/read-all`, { method: "PATCH" });
      setNovedades((lista) => lista && lista.map((a) => ({ ...a, read: true })));
    } catch (e) {
      setErrorAccion(toApiError(e).message);
    }
  }

  return (
    <>
      <div className="titulo-con-accion">
        <h1>Actividad {sinLeer > 0 && <small>🔔 {sinLeer} nuevas</small>}</h1>
        <button type="button" className="boton" disabled={sinLeer === 0} onClick={marcarTodas}>
          Marcar todas como leídas
        </button>
      </div>
      <Alerta>{errorAccion}</Alerta>
      {novedades.length === 0 && <Vacio texto="Todavía no hay novedades." />}
      {novedades.map((a) => {
        const { texto, detalle, destino } = describir(a);
        return (
          <div
            key={a.id}
            className={a.read ? "item" : "item no-leida"}
            onClick={() => abrir(a, destino)}
            style={{ cursor: "pointer" }}
          >
            <p>
              {a.read ? "○" : "●"} {texto} <small>({timeAgo(a.createdAt)})</small>
            </p>
            {detalle && <small>{detalle}</small>}
          </div>
        );
      })}
    </>
  );
}
