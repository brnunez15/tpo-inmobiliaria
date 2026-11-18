/**
 * src/api/types.ts
 *
 * La forma de lo que responde el back (ver back/src/entities y los services).
 * Los decimales (price, coveredAreaM2, totalAreaM2) llegan como string.
 * Las fechas llegan como string ISO ("2026-11-18T22:07:05.701Z").
 */

export type PropertyType = "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL";
export type OperationType = "SALE" | "RENT";
export type Currency = "ARS" | "USD";
export type PropertyStatus = "DRAFT" | "PUBLISHED" | "RESERVED" | "PAUSED" | "SOLD" | "RENTED" | "CANCELLED";
export type VisitStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
export type ActivityType = "COMMENT" | "VISIT_REQUEST" | "PROPERTY_STATUS_CHANGE" | "REVIEW";

// ── Listados paginados: GET /properties y GET /agencies/:id/my-properties ──
export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: Meta;
}

// ── Autenticación: POST /auth/login y POST /auth/register ──
export interface AuthSession {
  token: string;
  sellerId: number;
  agencyId: number | null; // null si el vendedor eliminó su inmobiliaria
}

// ── Inmobiliaria ──
// Lo que viene dentro del detalle de una propiedad (GET /properties/:id)
export interface AgencyPublic {
  id: number;
  name: string;
  description: string;
  logoUrl: string | null;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string | null;
}

// GET /agencies/:id (perfil público, con su calificación)
export interface AgencyProfile extends AgencyPublic {
  createdAt: string;
  rating: { average: number | null; count: number };
}

// ── Propiedad ──
export interface Property {
  id: number;
  title: string;
  description: string;
  type: PropertyType;
  operation: OperationType;
  price: string;
  currency: Currency;
  address: string;
  area: string; // localidad, zona o barrio
  coveredAreaM2: string | null;
  totalAreaM2: string;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  ageYears: number | null;
  tags: string[];
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  coverImageUrl?: string | null; // en los listados (GET /properties y my-properties)
  consultasSinResponder?: number; // solo en GET /agencies/:id/my-properties
}

export interface PropertyImage {
  id: number;
  url: string;
  position: number;
  isCover: boolean;
}

// GET /properties/:id
export interface PropertyDetail extends Property {
  agency: AgencyPublic;
  images: PropertyImage[];
}

// ── Comentarios ──
// GET /properties/:id/comments
export interface Comment {
  id: number;
  authorName: string;
  content: string;
  response: string | null; // null = sin responder
  createdAt: string;
}

// GET /agencies/:id/comments (pantalla Consultas del panel)
export interface AgencyComment extends Comment {
  property: { id: number; title: string };
}

// ── Reseñas: GET /agencies/:id/reviews ──
export interface Review {
  id: number;
  authorName: string;
  content: string;
  rating: number; // entero de 1 a 5
  createdAt: string;
}

// ── Solicitudes de visita: GET /agencies/:id/visit-requests ──
export interface VisitRequest {
  id: number;
  requesterName: string;
  requesterPhone: string;
  proposedDate: string;
  message: string | null;
  status: VisitStatus;
  property: Property;
  createdAt: string;
}

// ── Actividad: GET /agencies/:id/activity ──
export interface Activity {
  id: number;
  type: ActivityType;
  read: boolean;
  property: Property | null;
  comment: Comment | null;
  visitRequest: Omit<VisitRequest, "property"> | null;
  review: Review | null;
  createdAt: string;
}

// ── Reportes ──
// GET /agencies/:id/reports/status-summary
export interface StatusSummaryItem {
  status: PropertyStatus;
  count: number;
}

// GET /agencies/:id/reports/monthly → month: "2026-11"
export interface MonthlyItem {
  month: string;
  published: number;
  closed: number; // vendidas + alquiladas en ese mes
}

// GET /agencies/:id/reports/avg-time-on-market
export interface AvgTimeOnMarket {
  avgDaysOnMarket: number | null; // null si todavía no hay ninguna cerrada
  samplesCount: number;
}
