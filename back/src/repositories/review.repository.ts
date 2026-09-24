import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Reseña } from "../entities/historial-reseñas";

class RepositorioReseña {
  private get repositorio(): Repository<Reseña> {
    return AppDataSource.getRepository(Reseña);
  }

  buscarPorInmobiliariaId(inmobiliariaId: number): Promise<Reseña[]> {
    return this.repositorio.find({
      where: { agency: { id: inmobiliariaId } },
      order: { createdAt: "DESC" },
    });
  }

  crear(datos: {
    nombreAutor: string;
    contenido: string;
    calificacion: number;
    inmobiliariaId: number;
  }): Promise<Reseña> {
    const reseña = this.repositorio.create({
      authorName: datos.nombreAutor,
      content: datos.contenido,
      rating: datos.calificacion,
      agency: { id: datos.inmobiliariaId },
    });
    return this.repositorio.save(reseña);
  }
}

export const repositorioReseña = new RepositorioReseña();
