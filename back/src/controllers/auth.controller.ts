import type { Request, Response } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service";
import { validar } from "./helpers";

const registerSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(6),
  phone: z.string().trim().max(40).nullable().optional(), // teléfono del vendedor (opcional)
  agencyName: z.string().trim().min(1),
  contactPhone: z.string().trim().min(1),
  contactEmail: z.string().trim().email(),
  description: z.string().trim().min(1),
  officeAddress: z.string().trim().max(255).nullable().optional(), // opcional
  logoUrl: z.string().url().max(500).nullable().optional(), // opcional
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

class AuthController {
  async register(request: Request, response: Response): Promise<void> {
    const datos = validar(registerSchema, request.body);
    const created = await authService.register(datos);
    response.status(201).json(created);
  }

  async login(request: Request, response: Response): Promise<void> {
    const { email, password } = validar(loginSchema, request.body);
    const result = await authService.login(email, password);
    response.json(result);
  }

  // GET /auth/me — el front lo usa al recargar la página para saber quién está logueado
  async me(request: Request, response: Response): Promise<void> {
    const perfil = await authService.obtenerPerfil(request.sellerId!);
    response.json(perfil);
  }
}

export const authController = new AuthController();