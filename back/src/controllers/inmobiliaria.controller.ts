import type { Request, Response } from "express";
import { z } from "zod";
import { agencyService } from "../services/inmobiliaria.service";
import { leerId, validar } from "./helpers";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  contactPhone: z.string().trim().min(1).max(40).optional(),
  contactEmail: z.string().email().max(255).optional(),
  officeAddress: z.string().trim().max(255).nullable().optional(),
});

class AgencyController {
  async getPublic(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const profile = await agencyService.getPublicProfile(id);
    response.json(profile);
  }

  async update(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const datos = validar(updateSchema, request.body);
    const profile = await agencyService.update(id, request.sellerId!, datos);
    response.json(profile);
  }

  async delete(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    await agencyService.delete(id, request.sellerId!);
    response.status(204).send();
  }

  async getProperties(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const properties = await agencyService.getProperties(id);
    response.json(properties);
  }

  // GET /agencies/:id/my-properties — "Mis propiedades" (solo el dueño)
  async getMyProperties(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const properties = await agencyService.obtenerMisPropiedades(id, request.sellerId!);
    response.json(properties);
  }

  // GET /agencies/:id/comments?pending=true — "Consultas" (solo el dueño)
  async getComments(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const soloSinResponder = request.query.pending === "true";
    const comments = await agencyService.obtenerConsultas(id, request.sellerId!, soloSinResponder);
    response.json(comments);
  }
}

export const agencyController = new AgencyController();