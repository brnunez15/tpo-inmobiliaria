import type { Request, Response, NextFunction } from "express";
import {
  ErrorDatosInvalidos,
  ErrorReglaNegocio,
  ErrorNoAutenticado,
  ErrorProhibido,
  ErrorNoEncontrado,
  ErrorConflicto,
} from "../errors/dominio.errors";

// Middleware de errores centralizado (clases 5, 6 y 9).
// Express lo reconoce por tener 4 parámetros y lo usa cuando un controller
// lanza un error. Se monta al final de index.ts, después de las rutas.
//
// Formato ÚNICO de error en toda la API:  { error: string, details?: ... }
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Va primero: es un caso particular de ErrorReglaNegocio que además trae el detalle de zod
  if (err instanceof ErrorDatosInvalidos) {
    res.status(400).json({ error: err.message, details: err.details });
    return;
  }
  if (err instanceof ErrorReglaNegocio) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof ErrorNoAutenticado) {
    res.status(401).json({ error: err.message });
    return;
  }
  if (err instanceof ErrorProhibido) {
    res.status(403).json({ error: err.message });
    return;
  }
  if (err instanceof ErrorNoEncontrado) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof ErrorConflicto) {
    res.status(409).json({ error: err.message });
    return;
  }

  // Error inesperado (bug, base caída...): se loguea completo en la consola,
  // pero al cliente no se le muestra el detalle interno.
  console.error("Error no controlado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
}
