import type { Request, Response } from "express";
import { z } from "zod";
import {
  visitRequestService,
  VisitRequestNotFoundError,
  VisitRequestForbiddenError,
  VisitRequestInvalidTransitionError,
  PropertyNotFoundError,
  AgencyNotFoundError,
} from "../services/visit-request.service";
import { VisitRequestStatus } from "../entities/enums";

const ID_REGEX = /^\d+$/;

const createVisitSchema = z.object({
  requesterName: z.string().trim().min(1).max(120),
  requesterPhone: z.string().trim().min(1).max(40),
  proposedDate: z.string().datetime({ message: "proposedDate debe ser una fecha ISO 8601 válida" }),
  message: z.string().trim().max(1000).nullable().optional(),
});

const patchStatusSchema = z.object({
  status: z.nativeEnum(VisitRequestStatus),
});

class VisitRequestController {
  async create(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Propiedad no encontrada" });
      return;
    }

    const parseResult = createVisitSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
      return;
    }

    try {
      const visit = await visitRequestService.create(Number(id), {
        ...parseResult.data,
        proposedDate: new Date(parseResult.data.proposedDate),
      });
      response.status(201).json(visit);
    } catch (error) {
      if (error instanceof PropertyNotFoundError) {
        response.status(404).json({ message: "Propiedad no encontrada" });
        return;
      }
      const msg = (error as Error).message;
      response.status(400).json({ error: msg });
    }
  }

  async patchStatus(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Solicitud de visita no encontrada" });
      return;
    }

    const parseResult = patchStatusSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
      return;
    }

    try {
      const visit = await visitRequestService.changeStatus(
        Number(id),
        request.sellerId!,
        parseResult.data.status
      );
      response.json(visit);
    } catch (error) {
      if (error instanceof VisitRequestNotFoundError) {
        response.status(404).json({ message: "Solicitud de visita no encontrada" });
        return;
      }
      if (error instanceof VisitRequestForbiddenError) {
        response.status(403).json({ message: "No tenés permiso para modificar esta solicitud" });
        return;
      }
      if (error instanceof VisitRequestInvalidTransitionError) {
        response.status(400).json({ error: (error as Error).message });
        return;
      }
      throw error;
    }
  }

  async listByAgency(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }
    try {
      const visits = await visitRequestService.listByAgency(Number(id), request.sellerId!);
      response.json(visits);
    } catch (error) {
      if (error instanceof AgencyNotFoundError) {
        response.status(404).json({ message: "Inmobiliaria no encontrada" });
        return;
      }
      if (error instanceof VisitRequestForbiddenError) {
        response.status(403).json({ message: "No tenés permiso para ver estas solicitudes" });
        return;
      }
      throw error;
    }
  }
}

export const visitRequestController = new VisitRequestController();
