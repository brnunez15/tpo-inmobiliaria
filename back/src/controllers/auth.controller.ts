import type { Request, Response } from "express";
import { z } from "zod";
import {
  authService,
  EmailAlreadyExistsError,
  AgencyNameAlreadyExistsError,
  InvalidCredentialsError,
} from "../services/auth.service";

const registerSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(6),
  agencyName: z.string().trim().min(1),
  contactPhone: z.string().trim().min(1),
  contactEmail: z.string().trim().email(),
  description: z.string().trim().min(1),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

class AuthController {
  async register(request: Request, response: Response): Promise<void> {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Datos inválidos", details: parseResult.error.issues });
      return;
    }

    try {
      const created = await authService.register(parseResult.data);
      response.status(201).json(created);
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        response.status(409).json({ error: "El email ya está registrado" });
        return;
      }
      if (error instanceof AgencyNameAlreadyExistsError) {
        response.status(409).json({ error: "El nombre de fantasía ya existe" });
        return;
      }
      throw error; // lo agarra el middleware de errores (tarea 11)
    }
  }

  async login(request: Request, response: Response): Promise<void> {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Datos inválidos", details: parseResult.error.issues });
      return;
    }

    try {
      const result = await authService.login(parseResult.data.email, parseResult.data.password);
      response.json(result);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        response.status(401).json({ error: "Credenciales inválidas" });
        return;
      }
      throw error;
    }
  }
}

export const authController = new AuthController();