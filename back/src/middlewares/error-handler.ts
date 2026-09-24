import type { Request, Response, NextFunction } from "express";
import {
  ErrorEmailDuplicado,
  ErrorNombreInmobiliariaDuplicado,
  ErrorCredencialesInvalidas,
} from "../services/auth.service";
import { ErrorComentarioNoEncontrado } from "../services/comment.service";
import {
  ErrorInmobiliariaNoEncontrada,
  ErrorInmobiliariaConPropiedadesActivas,
} from "../services/inmobiliaria.service";
import {
  ErrorTransicionEstadoInvalida,
  ErrorPropiedadNoEncontrada,
  ErrorSinPermiso,
} from "../services/property-status.service";
import {
  ErrorVisitaNoEncontrada,
  ErrorTransicionVisitaInvalida,
} from "../services/visit-request.service";
import {
  ActivityNotFoundError,
  ActivityForbiddenError,
} from "../services/activity.service";
import { ReportForbiddenError } from "../services/report.service";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (
    err instanceof ErrorEmailDuplicado ||
    err instanceof ErrorNombreInmobiliariaDuplicado ||
    err instanceof ErrorInmobiliariaConPropiedadesActivas
  ) {
    res.status(409).json({ error: (err as Error).message || "Conflicto con recurso existente" });
    return;
  }

  if (err instanceof ErrorCredencialesInvalidas) {
    res.status(401).json({ error: (err as Error).message || "Credenciales inválidas" });
    return;
  }

  if (
    err instanceof ErrorSinPermiso ||
    err instanceof ActivityForbiddenError ||
    err instanceof ReportForbiddenError
  ) {
    res.status(403).json({ error: (err as Error).message || "Sin permiso para realizar esta acción" });
    return;
  }

  if (
    err instanceof ErrorComentarioNoEncontrado ||
    err instanceof ErrorInmobiliariaNoEncontrada ||
    err instanceof ErrorPropiedadNoEncontrada ||
    err instanceof ErrorVisitaNoEncontrada ||
    err instanceof ActivityNotFoundError
  ) {
    res.status(404).json({ error: (err as Error).message || "Recurso no encontrado" });
    return;
  }

  if (
    err instanceof ErrorTransicionEstadoInvalida ||
    err instanceof ErrorTransicionVisitaInvalida
  ) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }

  console.error("Unhandled Error:", err);
  const message = err instanceof Error ? err.message : "Error interno del servidor";
  res.status(500).json({ error: message });
}
