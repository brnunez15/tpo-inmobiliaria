import type { Request, Response } from "express";
import { activityService } from "../services/activity.service";
import { leerId } from "./helpers";

class ActivityController {
  async listByAgency(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const activities = await activityService.listByAgency(id, request.sellerId!);
    response.json(activities);
  }

  async markAsRead(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Actividad no encontrada");
    const activity = await activityService.markAsRead(id, request.sellerId!);
    response.json(activity);
  }

  async markAllAsRead(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const result = await activityService.markAllAsRead(id, request.sellerId!);
    response.json(result);
  }

  async unreadCount(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const result = await activityService.unreadCount(id, request.sellerId!);
    response.json(result);
  }
}

export const activityController = new ActivityController();