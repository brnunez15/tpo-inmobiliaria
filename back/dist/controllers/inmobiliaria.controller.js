"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agencyController = void 0;
const zod_1 = require("zod");
const inmobiliaria_service_1 = require("../services/inmobiliaria.service");
const ID_REGEX = /^\d+$/;
const updateSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(120).optional(),
    description: zod_1.z.string().trim().min(1).optional(),
    logoUrl: zod_1.z.string().url().max(500).nullable().optional(),
    contactPhone: zod_1.z.string().trim().min(1).max(40).optional(),
    contactEmail: zod_1.z.string().email().max(255).optional(),
    officeAddress: zod_1.z.string().trim().max(255).nullable().optional(),
});
class AgencyController {
    async getPublic(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return;
        }
        try {
            const profile = await inmobiliaria_service_1.agencyService.getPublicProfile(Number(id));
            response.json(profile);
        }
        catch (error) {
            if (error instanceof inmobiliaria_service_1.AgencyNotFoundError) {
                response.status(404).json({ message: "Inmobiliaria no encontrada" });
                return;
            }
            throw error;
        }
    }
    async update(request, response) {
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
            const profile = await inmobiliaria_service_1.agencyService.update(Number(id), request.sellerId, parseResult.data);
            response.json(profile);
        }
        catch (error) {
            if (error instanceof inmobiliaria_service_1.AgencyNotFoundError) {
                response.status(404).json({ message: "Inmobiliaria no encontrada" });
                return;
            }
            if (error instanceof inmobiliaria_service_1.AgencyForbiddenError) {
                response.status(403).json({ message: "No tenés permiso para editar esta inmobiliaria" });
                return;
            }
            throw error;
        }
    }
    async delete(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return;
        }
        try {
            await inmobiliaria_service_1.agencyService.delete(Number(id), request.sellerId);
            response.status(204).send();
        }
        catch (error) {
            if (error instanceof inmobiliaria_service_1.AgencyNotFoundError) {
                response.status(404).json({ message: "Inmobiliaria no encontrada" });
                return;
            }
            if (error instanceof inmobiliaria_service_1.AgencyForbiddenError) {
                response.status(403).json({ message: "No tenés permiso para eliminar esta inmobiliaria" });
                return;
            }
            if (error instanceof inmobiliaria_service_1.AgencyHasActivePropertiesError) {
                response.status(409).json({
                    message: "No se puede eliminar la inmobiliaria porque tiene propiedades Publicadas o Reservadas",
                });
                return;
            }
            throw error;
        }
    }
    async getProperties(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return;
        }
        try {
            const properties = await inmobiliaria_service_1.agencyService.getProperties(Number(id));
            response.json(properties);
        }
        catch (error) {
            if (error instanceof inmobiliaria_service_1.AgencyNotFoundError) {
                response.status(404).json({ message: "Inmobiliaria no encontrada" });
                return;
            }
            throw error;
        }
    }
}
exports.agencyController = new AgencyController();
//# sourceMappingURL=inmobiliaria.controller.js.map