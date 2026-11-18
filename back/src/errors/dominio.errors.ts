// Errores de dominio (clase 6, errors/propiedades.errors.ts).
// El service los lanza; el middleware de errores centralizado
// (middlewares/error-handler.ts) los traduce a un status HTTP.
// El controller no hace try/catch: Express 5 manda solo el error de
// una función async al middleware de errores.
//
// Cada service define sus errores propios heredando de uno de estos:
// el middleware mira la clase base para elegir el status.

/** 400 — Se rompe una regla de negocio (precio <= 0, fecha pasada, transición inválida...). */
export class ErrorReglaNegocio extends Error {}

/** 401 — No se pudo identificar al usuario (credenciales inválidas). */
export class ErrorNoAutenticado extends Error {}

/** 403 — El usuario está identificado pero el recurso no es suyo. */
export class ErrorProhibido extends Error {}

/** 404 — El recurso no existe. */
export class ErrorNoEncontrado extends Error {}

/** 409 — Choca con algo que ya existe (email duplicado, propiedades activas...). */
export class ErrorConflicto extends Error {}

/** 400 — El body o los params no pasan la validación de zod. Lleva el detalle. */
export class ErrorDatosInvalidos extends ErrorReglaNegocio {
  constructor(public details: unknown, mensaje = "Datos inválidos") {
    super(mensaje);
  }
}
