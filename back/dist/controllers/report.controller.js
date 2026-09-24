"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const report_service_1 = require("../services/report.service");
const ID_REGEX = /^\d+$/;
class ReportController {
    async resolveAgency(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return null;
        }
        return Number(id);
    }
    handleError(error, response) {
        if (error instanceof report_service_1.AgencyNotFoundError) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return;
        }
        if (error instanceof report_service_1.ReportForbiddenError) {
            response.status(403).json({ message: "No tenés permiso para ver estos reportes" });
            return;
        }
        throw error;
    }
    async statusSummary(request, response) {
        const agencyId = await this.resolveAgency(request, response);
        if (agencyId === null)
            return;
        try {
            const data = await report_service_1.reportService.statusSummary(agencyId, request.sellerId);
            response.json(data);
        }
        catch (error) {
            this.handleError(error, response);
        }
    }
    async monthly(request, response) {
        const agencyId = await this.resolveAgency(request, response);
        if (agencyId === null)
            return;
        try {
            const data = await report_service_1.reportService.monthly(agencyId, request.sellerId);
            response.json(data);
        }
        catch (error) {
            this.handleError(error, response);
        }
    }
    async avgTimeOnMarket(request, response) {
        const agencyId = await this.resolveAgency(request, response);
        if (agencyId === null)
            return;
        try {
            const data = await report_service_1.reportService.avgTimeOnMarket(agencyId, request.sellerId);
            response.json(data);
        }
        catch (error) {
            this.handleError(error, response);
        }
    }
}
exports.reportController = new ReportController();
//# sourceMappingURL=report.controller.js.map