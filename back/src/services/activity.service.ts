import { ErrorNoEncontrado, ErrorProhibido } from "../errors/dominio.errors";
import { activityRepository } from "../repositories/activity.repository";
import { agencyRepository } from "../repositories/inmobiliaria.repositorio";

export class ActivityNotFoundError extends ErrorNoEncontrado {
  constructor(mensaje = "Actividad no encontrada") {
    super(mensaje);
  }
}
export class ActivityForbiddenError extends ErrorProhibido {
  constructor(mensaje = "No tenés permiso para ver esta actividad") {
    super(mensaje);
  }
}
export class AgencyNotFoundError extends ErrorNoEncontrado {
  constructor(mensaje = "Inmobiliaria no encontrada") {
    super(mensaje);
  }
}

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

    const guardada = await activityRepository.markAsRead(activity);
    // Se devuelve sin la inmobiliaria: venía cargada con el vendedor (y su passwordHash)
    const { agency, ...datos } = guardada;
    return { ...datos, agencyId: agency.id };
  }

  async markAllAsRead(agencyId: number, sellerId: number): Promise<{ updated: number }> {
    const agency = await agencyRepository.findById(agencyId);
    if (!agency) throw new AgencyNotFoundError();
    if (agency.seller.id !== sellerId) throw new ActivityForbiddenError();

    const updated = await activityRepository.markAllAsRead(agencyId);
    return { updated };
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