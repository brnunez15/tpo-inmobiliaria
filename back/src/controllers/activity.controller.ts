import type { Request, Response } from "express";
import {
  activityService,
  ActivityNotFoundError,
  ActivityForbiddenError,
  AgencyNotFoundError,
} from "../services/activity.service";

const ID_REGEX = /^\d+$/;

class ActivityController {
  async listByAgency(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }
    try {
      const activities = await activityService.listByAgency(Number(id), request.sellerId!);
      response.json(activities);
    } catch (error) {
      if (error instanceof AgencyNotFoundError) {
        response.status(404).json({ message: "Inmobiliaria no encontrada" });
        return;
      }
      if (error instanceof ActivityForbiddenError) {
        response.status(403).json({ message: "No tenés permiso para ver esta actividad" });
        return;
      }
      throw error;
    }
  }

  async markAsRead(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    try {
      const activity = await activityService.markAsRead(Number(id), request.sellerId!);
      response.json(activity);
    } catch (error) {
      if (error instanceof ActivityNotFoundError) {
        response.status(404).json({ message: "Actividad no encontrada" });
        return;
      }
      if (error instanceof ActivityForbiddenError) {
        response.status(403).json({ message: "No tenés permiso para marcar esta actividad" });
        return;
      }
      throw error;
    }
  }

  async unreadCount(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }
    try {
      const result = await activityService.unreadCount(Number(id), request.sellerId!);
      response.json(result);
    } catch (error) {
      if (error instanceof AgencyNotFoundError) {
        response.status(404).json({ message: "Inmobiliaria no encontrada" });
        return;
      }
      if (error instanceof ActivityForbiddenError) {
        response.status(403).json({ message: "No tenés permiso" });
        return;
      }
      throw error;
    }
  }
}

export const activityController = new ActivityController();
