import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Le agregamos a Request un campo nuevo para guardar quién está logueado.
declare global {
  namespace Express {
    interface Request {
      sellerId?: number;
    }
  }
}

export function requireAuth(request: Request, response: Response, next: NextFunction): void {
  const header = request.headers.authorization; // "Bearer <token>"
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    response.status(401).json({ error: "Falta el token" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sellerId: number };
    request.sellerId = payload.sellerId;
    next(); // "está todo bien, dejalo pasar al controller"
  } catch {
    response.status(401).json({ error: "Token inválido o expirado" });
  }
}