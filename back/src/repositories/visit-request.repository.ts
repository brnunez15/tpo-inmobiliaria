import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { SolicitudVisita } from "../entities/visitas";
import { VisitRequestStatus } from "../entities/enums";

class RepositorioSolicitudVisita {
  private get repositorio(): Repository<SolicitudVisita> {
    return AppDataSource.getRepository(SolicitudVisita);
  }

  buscarPorId(id: number): Promise<SolicitudVisita | null> {
    return this.repositorio.findOne({
      where: { id },
      relations: { property: { agency: { seller: true } } },
    });
  }

  buscarPorInmobiliariaId(inmobiliariaId: number): Promise<SolicitudVisita[]> {
    return this.repositorio.find({
      where: { property: { agency: { id: inmobiliariaId } } },
      relations: { property: true },
      order: { createdAt: "DESC" },
    });
  }

  /** Verifica si hay alguna visita Confirmada aún no realizada sobre una propiedad. */
  tieneConfirmadaPendiente(propiedadId: number): Promise<boolean> {
    return this.repositorio.existsBy({
      property: { id: propiedadId },
      status: VisitRequestStatus.CONFIRMED,
    });
  }

  crear(datos: {
    nombreSolicitante: string;
    telefonoSolicitante: string;
    fechaPropuesta: Date;
    mensaje?: string | null;
    propiedadId: number;
  }): Promise<SolicitudVisita> {
    const visita = this.repositorio.create({
      requesterName: datos.nombreSolicitante,
      requesterPhone: datos.telefonoSolicitante,
      proposedDate: datos.fechaPropuesta,
      message: datos.mensaje ?? null,
      status: VisitRequestStatus.PENDING,
      property: { id: datos.propiedadId },
    });
    return this.repositorio.save(visita);
  }

  async actualizarEstado(
    visita: SolicitudVisita,
    nuevoEstado: VisitRequestStatus
  ): Promise<SolicitudVisita> {
    visita.status = nuevoEstado;
    return this.repositorio.save(visita);
  }
}

export const repositorioSolicitudVisita = new RepositorioSolicitudVisita();
