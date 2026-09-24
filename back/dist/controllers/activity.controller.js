"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityController = void 0;
const activity_service_1 = require("../services/activity.service");
const ID_REGEX = /^\d+$/;
class ActivityController {
    async listByAgency(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return;
        }
        try {
            const activities = await activity_service_1.activityService.listByAgency(Number(id), request.sellerId);
            response.json(activities);
        }
        catch (error) {
            if (error instanceof activity_service_1.AgencyNotFoundError) {
                response.status(404).json({ message: "Inmobiliaria no encontrada" });
                return;
            }
            if (error instanceof activity_service_1.ActivityForbiddenError) {
                response.status(403).json({ message: "No tenés permiso para ver esta actividad" });
                return;
            }
            throw error;
        }
    }
    async markAsRead(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Actividad no encontrada" });
            return;
        }
        try {
            const activity = await activity_service_1.activityService.markAsRead(Number(id), request.sellerId);
            response.json(activity);
        }
        catch (error) {
            if (error instanceof activity_service_1.ActivityNotFoundError) {
                response.status(404).json({ message: "Actividad no encontrada" });
                return;
            }
            if (error instanceof activity_service_1.ActivityForbiddenError) {
                response.status(403).json({ message: "No tenés permiso para marcar esta actividad" });
                return;
            }
            throw error;
        }
    }
    async unreadCount(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return;
        }
        try {
            const result = await activity_service_1.activityService.unreadCount(Number(id), request.sellerId);
            response.json(result);
        }
        catch (error) {
            if (error instanceof activity_service_1.AgencyNotFoundError) {
                response.status(404).json({ message: "Inmobiliaria no encontrada" });
                return;
            }
            if (error instanceof activity_service_1.ActivityForbiddenError) {
                response.status(403).json({ message: "No tenés permiso" });
                return;
            }
            throw error;
        }
    }
}
exports.activityController = new ActivityController();
//# sourceMappingURL=activity.controller.js.map