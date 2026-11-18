import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Comentario } from "../entities/historial-comentarios";

class RepositorioComentario {
  private get repositorio(): Repository<Comentario> {
    return AppDataSource.getRepository(Comentario);
  }

  buscarPorId(id: number): Promise<Comentario | null> {
    return this.repositorio.findOne({
      where: { id },
      relations: { property: { agency: { seller: true } } },
    });
  }

  buscarPorPropiedadId(propiedadId: number): Promise<Comentario[]> {
    return this.repositorio.find({
      where: { property: { id: propiedadId } },
      order: { createdAt: "ASC" },
    });
  }

  crear(datos: {
    nombreAutor: string;
    contenido: string;
    propiedadId: number;
  }): Promise<Comentario> {
    const comentario = this.repositorio.create({
      authorName: datos.nombreAutor,
      content: datos.contenido,
      response: null,
      property: { id: datos.propiedadId },
    });
    return this.repositorio.save(comentario);
  }

  /** Consultas de todas las propiedades de una inmobiliaria (pantalla "Consultas" del vendedor). */
  buscarPorInmobiliariaId(inmobiliariaId: number, soloSinResponder: boolean): Promise<Comentario[]> {
    let consulta = this.repositorio
      .createQueryBuilder("comentario")
      .innerJoinAndSelect("comentario.property", "propiedad")
      .where("propiedad.agency_id = :inmobiliariaId", { inmobiliariaId });

    if (soloSinResponder) {
      consulta = consulta.andWhere("comentario.response IS NULL");
    }

    return consulta.orderBy("comentario.createdAt", "DESC").getMany();
  }

  /** Cuántas consultas sin responder tiene cada propiedad de una inmobiliaria. */
  contarSinResponderPorPropiedad(
    inmobiliariaId: number
  ): Promise<{ propiedadId: number; cantidad: string }[]> {
    return this.repositorio
      .createQueryBuilder("comentario")
      .innerJoin("comentario.property", "propiedad")
      .select("propiedad.id", "propiedadId")
      .addSelect("COUNT(*)", "cantidad")
      .where("propiedad.agency_id = :inmobiliariaId", { inmobiliariaId })
      .andWhere("comentario.response IS NULL")
      .groupBy("propiedad.id")
      .getRawMany();
  }

  async guardarRespuesta(comentario: Comentario, respuesta: string): Promise<Comentario> {
    comentario.response = respuesta;
    return this.repositorio.save(comentario);
  }
}

export const repositorioComentario = new RepositorioComentario();
