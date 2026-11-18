import type { Request, Response } from "express";
import { reportService } from "../services/report.service";
import { leerId } from "./helpers";

class ReportController {
  async statusSummary(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const data = await reportService.statusSummary(id, request.sellerId!);
    response.json(data);
  }

  async monthly(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const data = await reportService.monthly(id, request.sellerId!);
    response.json(data);
  }

  async avgTimeOnMarket(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const data = await reportService.avgTimeOnMarket(id, request.sellerId!);
    response.json(data);
  }
}

export const reportController = new ReportController();
