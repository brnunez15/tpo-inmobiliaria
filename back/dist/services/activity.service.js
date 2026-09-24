"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityService = exports.AgencyNotFoundError = exports.ActivityForbiddenError = exports.ActivityNotFoundError = void 0;
const activity_repository_1 = require("../repositories/activity.repository");
const inmobiliaria_repositorio_1 = require("../repositories/inmobiliaria.repositorio");
class ActivityNotFoundError extends Error {
}
exports.ActivityNotFoundError = ActivityNotFoundError;
class ActivityForbiddenError extends Error {
}
exports.ActivityForbiddenError = ActivityForbiddenError;
class AgencyNotFoundError extends Error {
}
exports.AgencyNotFoundError = AgencyNotFoundError;
class ActivityService {
    async listByAgency(agencyId, sellerId) {
        const agency = await inmobiliaria_repositorio_1.agencyRepository.findById(agencyId);
        if (!agency)
            throw new AgencyNotFoundError();
        if (agency.seller.id !== sellerId)
            throw new ActivityForbiddenError();
        return activity_repository_1.activityRepository.findByAgencyId(agencyId);
    }
    async markAsRead(activityId, sellerId) {
        const activity = await activity_repository_1.activityRepository.findById(activityId);
        if (!activity)
            throw new ActivityNotFoundError();
        if (activity.agency.seller.id !== sellerId)
            throw new ActivityForbiddenError();
        return activity_repository_1.activityRepository.markAsRead(activity);
    }
    async unreadCount(agencyId, sellerId) {
        const agency = await inmobiliaria_repositorio_1.agencyRepository.findById(agencyId);
        if (!agency)
            throw new AgencyNotFoundError();
        if (agency.seller.id !== sellerId)
            throw new ActivityForbiddenError();
        const count = await activity_repository_1.activityRepository.countUnreadByAgencyId(agencyId);
        return { count };
    }
}
exports.activityService = new ActivityService();
//# sourceMappingURL=activity.service.js.map