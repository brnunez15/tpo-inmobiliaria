import type { Request } from "express";
import type { z } from "zod";
import { ErrorDatosInvalidos, ErrorNoEncontrado } from "../errors/dominio.errors";

const ID_REGEX = /^\d+$/;

/**
 * Lee un id numérico de la URL (request.params).
 * Si no es un número válido responde lo mismo que si no existiera: 404.
 */
export function leerId(request: Request, mensajeNoEncontrado: string, nombre = "id"): number {
  const valor = request.params[nombre];
  if (typeof valor !== "string" || !ID_REGEX.test(valor)) {
    throw new ErrorNoEncontrado(mensajeNoEncontrado);
  }
  return Number(valor);
}

/**
 * Valida el body con un schema de zod (clase 2, safeParse).
 * Si no pasa, lanza ErrorDatosInvalidos → 400 { error, details }.
 */
export function validar<T extends z.ZodTypeAny>(schema: T, datos: unknown): z.infer<T> {
  const resultado = schema.safeParse(datos);
  if (!resultado.success) {
    throw new ErrorDatosInvalidos(resultado.error.issues);
  }
  return resultado.data;
}
