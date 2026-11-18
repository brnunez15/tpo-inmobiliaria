/**
 * src/utils/format.ts
 *
 * Funciones puras para mostrar datos: precios, superficies y fechas.
 * Usan Intl (del navegador), en castellano de Argentina.
 */
import type { Currency, OperationType } from "../api/types";

// "USD 400/mes" para alquileres, "USD 120.000" para ventas
export function formatPrice(price: string | number, currency: Currency, operation?: OperationType): string {
  const numero = Number(price).toLocaleString("es-AR", { maximumFractionDigits: 0 });
  return `${currency} ${numero}${operation === "RENT" ? "/mes" : ""}`;
}

// Superficie: "45 m²" (sin decimales si es entera)
export function formatM2(valor: string | number | null): string {
  if (valor === null) return "—";
  return `${Number(valor).toLocaleString("es-AR", { maximumFractionDigits: 2 })} m²`;
}

// "18/11/2026 15:30"
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

// "18/11/2026"
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR");
}

// "hace 10 min", "hace 2 h", "ayer", o la fecha si fue hace más de una semana
export function timeAgo(iso: string): string {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return "recién";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return formatDate(iso);
}

// Valor para un <input type="datetime-local" min=…>: ahora, en hora local
export function nowForDateTimeInput(): string {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 16);
}
