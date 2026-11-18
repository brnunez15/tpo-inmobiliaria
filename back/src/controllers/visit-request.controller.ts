import type { Request, Response } from "express";
import { z } from "zod";
import { visitRequestService } from "../services/visit-request.service";
import { VisitRequestStatus } from "../entities/enums";
import { leerId, validar } from "./helpers";

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
    const id = leerId(request, "Propiedad no encontrada");
    const datos = validar(createVisitSchema, request.body);
    const visit = await visitRequestService.create(id, {
      ...datos,
      proposedDate: new Date(datos.proposedDate),
    });
    response.status(201).json(visit);
  }

  async patchStatus(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Solicitud de visita no encontrada");
    const { status } = validar(patchStatusSchema, request.body);
    const visit = await visitRequestService.changeStatus(id, request.sellerId!, status);
    response.json(visit);
  }

  async listByAgency(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const visits = await visitRequestService.listByAgency(id, request.sellerId!);
    response.json(visits);
  }
}

export const visitRequestController = new VisitRequestController();
