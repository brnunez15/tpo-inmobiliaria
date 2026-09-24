import { activityRepository } from "../repositories/activity.repository";
import { agencyRepository } from "../repositories/inmobiliaria.repositorio";

export class ActivityNotFoundError extends Error {}
export class ActivityForbiddenError extends Error {}
export class AgencyNotFoundError extends Error {}

class ActivityService {
  async listByAgency(agencyId: number, sellerId: number) {
    const agency = await agencyRepository.findById(agencyId);
    if (!agency) throw new AgencyNotFoundError();
    if (agency.seller.id !== sellerId) throw new ActivityForbiddenError();

    return activityRepository.findByAgencyId(agencyId);
  }

  async markAsRead(activityId: number, sellerId: number) {
    const activity = await activityRepository.findById(activityId);
    if (!activity) throw new ActivityNotFoundError();
    if (activity.agency.seller.id !== sellerId) throw new ActivityForbiddenError();

    return activityRepository.markAsRead(activity);
  }

  async unreadCount(agencyId: number, sellerId: number): Promise<{ count: number }> {
    const agency = await agencyRepository.findById(agencyId);
    if (!agency) throw new AgencyNotFoundError();
    if (agency.seller.id !== sellerId) throw new ActivityForbiddenError();

    const count = await activityRepository.countUnreadByAgencyId(agencyId);
    return { count };
  }
}

export const activityService = new ActivityService();
