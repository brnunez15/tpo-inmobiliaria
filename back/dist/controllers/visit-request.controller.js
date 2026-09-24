"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitRequestController = void 0;
const zod_1 = require("zod");
const visit_request_service_1 = require("../services/visit-request.service");
const enums_1 = require("../entities/enums");
const ID_REGEX = /^\d+$/;
const createVisitSchema = zod_1.z.object({
    requesterName: zod_1.z.string().trim().min(1).max(120),
    requesterPhone: zod_1.z.string().trim().min(1).max(40),
    proposedDate: zod_1.z.string().datetime({ message: "proposedDate debe ser una fecha ISO 8601 válida" }),
    message: zod_1.z.string().trim().max(1000).nullable().optional(),
});
const patchStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enums_1.VisitRequestStatus),
});
class VisitRequestController {
    async create(request, response) {
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
            const visit = await visit_request_service_1.visitRequestService.create(Number(id), {
                ...parseResult.data,
                proposedDate: new Date(parseResult.data.proposedDate),
            });
            response.status(201).json(visit);
        }
        catch (error) {
            if (error instanceof visit_request_service_1.PropertyNotFoundError) {
                response.status(404).json({ message: "Propiedad no encontrada" });
                return;
            }
            const msg = error.message;
            response.status(400).json({ error: msg });
        }
    }
    async patchStatus(request, response) {
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
            const visit = await visit_request_service_1.visitRequestService.changeStatus(Number(id), request.sellerId, parseResult.data.status);
            response.json(visit);
        }
        catch (error) {
            if (error instanceof visit_request_service_1.VisitRequestNotFoundError) {
                response.status(404).json({ message: "Solicitud de visita no encontrada" });
                return;
            }
            if (error instanceof visit_request_service_1.VisitRequestForbiddenError) {
                response.status(403).json({ message: "No tenés permiso para modificar esta solicitud" });
                return;
            }
            if (error instanceof visit_request_service_1.VisitRequestInvalidTransitionError) {
                response.status(400).json({ error: error.message });
                return;
            }
            throw error;
        }
    }
    async listByAgency(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return;
        }
        try {
            const visits = await visit_request_service_1.visitRequestService.listByAgency(Number(id), request.sellerId);
            response.json(visits);
        }
        catch (error) {
            if (error instanceof visit_request_service_1.AgencyNotFoundError) {
                response.status(404).json({ message: "Inmobiliaria no encontrada" });
                return;
            }
            if (error instanceof visit_request_service_1.VisitRequestForbiddenError) {
                response.status(403).json({ message: "No tenés permiso para ver estas solicitudes" });
                return;
            }
            throw error;
        }
    }
}
exports.visitRequestController = new VisitRequestController();
//# sourceMappingURL=visit-request.controller.js.map