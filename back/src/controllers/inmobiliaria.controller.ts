import type { Request, Response } from "express";
import { z } from "zod";
import {
  agencyService,
  AgencyNotFoundError,
  AgencyForbiddenError,
  AgencyHasActivePropertiesError,
} from "../services/inmobiliaria.service";

const ID_REGEX = /^\d+$/;

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
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }
    try {
      const profile = await agencyService.getPublicProfile(Number(id));
      response.json(profile);
    } catch (error) {
      if (error instanceof AgencyNotFoundError) {
        response.status(404).json({ message: "Inmobiliaria no encontrada" });
        return;
      }
      throw error;
    }
  }

  async update(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }

    const parseResult = updateSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ message: "Body inválido", issues: parseResult.error.issues });
      return;
    }

    try {
      const profile = await agencyService.update(
        Number(id),
        request.sellerId!,
        parseResult.data,
      );
      response.json(profile);
    } catch (error) {
      if (error instanceof AgencyNotFoundError) {
        response.status(404).json({ message: "Inmobiliaria no encontrada" });
        return;
      }
      if (error instanceof AgencyForbiddenError) {
        response.status(403).json({ message: "No tenés permiso para editar esta inmobiliaria" });
        return;
      }
      throw error;
    }
  }

  async delete(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }

    try {
      await agencyService.delete(Number(id), request.sellerId!);
      response.status(204).send();
    } catch (error) {
      if (error instanceof AgencyNotFoundError) {
        response.status(404).json({ message: "Inmobiliaria no encontrada" });
        return;
      }
      if (error instanceof AgencyForbiddenError) {
        response.status(403).json({ message: "No tenés permiso para eliminar esta inmobiliaria" });
        return;
      }
      if (error instanceof AgencyHasActivePropertiesError) {
        response.status(409).json({
          message: "No se puede eliminar la inmobiliaria porque tiene propiedades Publicadas o Reservadas",
        });
        return;
      }
      throw error;
    }
  }

  async getProperties(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }

    try {
      const properties = await agencyService.getProperties(Number(id));
      response.json(properties);
    } catch (error) {
      if (error instanceof AgencyNotFoundError) {
        response.status(404).json({ message: "Inmobiliaria no encontrada" });
        return;
      }
      throw error;
    }
  }
}

export const agencyController = new AgencyController();