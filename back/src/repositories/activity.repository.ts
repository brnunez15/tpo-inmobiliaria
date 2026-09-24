import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Actividad } from "../entities/actividad";
import { ActivityType } from "../entities/enums";

class RepositorioActividad {
  private get repositorio(): Repository<Actividad> {
    return AppDataSource.getRepository(Actividad);
  }

  buscarPorId(id: number): Promise<Actividad | null> {
    return this.repositorio.findOne({
      where: { id },
      relations: { agency: { seller: true } },
    });
  }

  buscarPorInmobiliariaId(inmobiliariaId: number): Promise<Actividad[]> {
    return this.repositorio.find({
      where: { agency: { id: inmobiliariaId } },
      relations: { comment: true, visitRequest: true, review: true, property: true },
      order: { createdAt: "DESC" },
    });
  }

  contarNoLeidasPorInmobiliariaId(inmobiliariaId: number): Promise<number> {
    return this.repositorio.count({
      where: { agency: { id: inmobiliariaId }, read: false },
    });
  }

  crearPorComentario(
    inmobiliariaId: number,
    propiedadId: number,
    comentarioId: number
  ): Promise<Actividad> {
    const actividad = this.repositorio.create({
      type: ActivityType.COMMENT,
      read: false,
      agency: { id: inmobiliariaId },
      property: { id: propiedadId },
      comment: { id: comentarioId },
      visitRequest: null,
      review: null,
    });
    return this.repositorio.save(actividad);
  }

  crearPorVisita(
    inmobiliariaId: number,
    propiedadId: number,
    visitaId: number
  ): Promise<Actividad> {
    const actividad = this.repositorio.create({
      type: ActivityType.VISIT_REQUEST,
      read: false,
      agency: { id: inmobiliariaId },
      property: { id: propiedadId },
      comment: null,
      visitRequest: { id: visitaId },
      review: null,
    });
    return this.repositorio.save(actividad);
  }

  crearPorReseña(inmobiliariaId: number, reseñaId: number): Promise<Actividad> {
    const actividad = this.repositorio.create({
      type: ActivityType.REVIEW,
      read: false,
      agency: { id: inmobiliariaId },
      property: null,
      comment: null,
      visitRequest: null,
      review: { id: reseñaId },
    });
    return this.repositorio.save(actividad);
  }

  async marcarLeida(actividad: Actividad): Promise<Actividad> {
    actividad.read = true;
    return this.repositorio.save(actividad);
  }

  findById(id: number) {
    return this.buscarPorId(id);
  }

  findByAgencyId(agencyId: number) {
    return this.buscarPorInmobiliariaId(agencyId);
  }

  countUnreadByAgencyId(agencyId: number) {
    return this.contarNoLeidasPorInmobiliariaId(agencyId);
  }

  markAsRead(actividad: Actividad) {
    return this.marcarLeida(actividad);
  }
}

export const repositorioActividad = new RepositorioActividad();
export const activityRepository = repositorioActividad;

