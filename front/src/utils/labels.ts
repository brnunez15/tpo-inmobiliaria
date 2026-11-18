/**
 * src/utils/labels.ts
 *
 * El back usa los valores en inglés (HOUSE, PUBLISHED…); en pantalla se
 * muestran en castellano. Record<Tipo, string> obliga a tener un texto
 * para cada valor: si falta uno, TypeScript avisa.
 */
import type { ActivityType, OperationType, PropertyStatus, PropertyType, VisitStatus } from "../api/types";

export const TYPE_LABELS: Record<PropertyType, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  LAND: "Terreno",
  COMMERCIAL: "Local",
};

export const OPERATION_LABELS: Record<OperationType, string> = {
  SALE: "Venta",
  RENT: "Alquiler",
};

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicada",
  RESERVED: "Reservada",
  PAUSED: "Pausada",
  SOLD: "Vendida",
  RENTED: "Alquilada",
  CANCELLED: "Cancelada",
};

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Realizada",
  CANCELLED: "Cancelada",
  REJECTED: "Rechazada",
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  COMMENT: "Nueva consulta",
  VISIT_REQUEST: "Nueva solicitud de visita",
  PROPERTY_STATUS_CHANGE: "Cambio de estado",
  REVIEW: "Nueva reseña",
};

// Amenities que se ofrecen para filtrar y para cargar propiedades (los del enunciado)
export const AMENITIES = ["pileta", "cochera", "apto profesional", "admite mascotas", "balcón", "patio", "parrilla", "aire acondicionado"];

// Cuántos resultados por página piden los listados
export const PAGE_SIZE = 10;
