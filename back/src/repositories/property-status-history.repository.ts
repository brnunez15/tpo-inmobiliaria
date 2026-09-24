import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { HistorialEstadoPropiedad } from "../entities/historial-estado-propiedad";
import { PropertyStatus } from "../entities/enums";

class RepositorioHistorialEstado {
  private get repositorio(): Repository<HistorialEstadoPropiedad> {
    return AppDataSource.getRepository(HistorialEstadoPropiedad);
  }

  crear(datos: {
    propiedadId: number;
    estadoAnterior: PropertyStatus;
    estadoNuevo: PropertyStatus;
  }): Promise<HistorialEstadoPropiedad> {
    const registro = this.repositorio.create({
      fromStatus: datos.estadoAnterior,
      toStatus: datos.estadoNuevo,
      property: { id: datos.propiedadId },
    });
    return this.repositorio.save(registro);
  }

  buscarPorPropiedadId(propiedadId: number): Promise<HistorialEstadoPropiedad[]> {
    return this.repositorio.find({
      where: { property: { id: propiedadId } },
      order: { createdAt: "ASC" },
    });
  }

  /** Fecha en que una propiedad pasó a un estado específico por primera vez. */
  buscarPrimeraTransicionA(
    propiedadId: number,
    estadoDestino: PropertyStatus
  ): Promise<HistorialEstadoPropiedad | null> {
    return this.repositorio.findOne({
      where: { property: { id: propiedadId }, toStatus: estadoDestino },
      order: { createdAt: "ASC" },
    });
  }
}

export const repositorioHistorialEstado = new RepositorioHistorialEstado();
