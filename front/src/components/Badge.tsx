/**
 * src/components/Badge.tsx
 *
 * La "pastilla" de color con el estado, como BadgeEstado de la Clase 15:
 * el color sale de una clase del CSS Module con el mismo nombre que el estado.
 */
import type { PropertyStatus, VisitStatus } from "../api/types";
import { STATUS_LABELS, VISIT_STATUS_LABELS } from "../utils/labels";
import estilos from "./Badge.module.css";

export function BadgeEstadoPropiedad({ status }: { status: PropertyStatus }) {
  return <span className={`${estilos.badge} ${estilos[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function BadgeEstadoVisita({ status }: { status: VisitStatus }) {
  return <span className={`${estilos.badge} ${estilos[status]}`}>{VISIT_STATUS_LABELS[status]}</span>;
}
