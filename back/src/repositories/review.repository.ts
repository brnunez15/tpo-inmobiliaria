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

  /** Promedio (con un decimal) y cantidad de reseñas de una inmobiliaria. */
  async resumenPorInmobiliariaId(
    inmobiliariaId: number
  ): Promise<{ average: number | null; count: number }> {
    const reseñas = await this.buscarPorInmobiliariaId(inmobiliariaId);
    if (reseñas.length === 0) return { average: null, count: 0 };

    const suma = reseñas.reduce((total, reseña) => total + Number(reseña.rating), 0);
    return {
      average: Math.round((suma / reseñas.length) * 10) / 10,
      count: reseñas.length,
    };
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