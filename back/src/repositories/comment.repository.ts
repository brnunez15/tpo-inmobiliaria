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

  async guardarRespuesta(comentario: Comentario, respuesta: string): Promise<Comentario> {
    comentario.response = respuesta;
    return this.repositorio.save(comentario);
  }
}

export const repositorioComentario = new RepositorioComentario();
