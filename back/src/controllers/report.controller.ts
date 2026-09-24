import type { Request, Response } from "express";
import {
  reportService,
  AgencyNotFoundError,
  ReportForbiddenError,
} from "../services/report.service";

const ID_REGEX = /^\d+$/;

class ReportController {
  private async resolveAgency(
    request: Request,
    response: Response
  ): Promise<number | null> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return null;
    }
    return Number(id);
  }

  private handleError(error: unknown, response: Response): void {
    if (error instanceof AgencyNotFoundError) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }
    if (error instanceof ReportForbiddenError) {
      response.status(403).json({ message: "No tenés permiso para ver estos reportes" });
      return;
    }
    throw error;
  }

  async statusSummary(request: Request, response: Response): Promise<void> {
    const agencyId = await this.resolveAgency(request, response);
    if (agencyId === null) return;
    try {
      const data = await reportService.statusSummary(agencyId, request.sellerId!);
      response.json(data);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  async monthly(request: Request, response: Response): Promise<void> {
    const agencyId = await this.resolveAgency(request, response);
    if (agencyId === null) return;
    try {
      const data = await reportService.monthly(agencyId, request.sellerId!);
      response.json(data);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  async avgTimeOnMarket(request: Request, response: Response): Promise<void> {
    const agencyId = await this.resolveAgency(request, response);
    if (agencyId === null) return;
    try {
      const data = await reportService.avgTimeOnMarket(agencyId, request.sellerId!);
      response.json(data);
    } catch (error) {
      this.handleError(error, response);
    }
  }
}

export const reportController = new ReportController();
