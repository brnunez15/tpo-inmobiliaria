import { ErrorNoEncontrado, ErrorProhibido } from "../errors/dominio.errors";
import { repositorioComentario } from "../repositories/comment.repository";
import { repositorioPropiedad } from "../repositories/property.repository";
import { repositorioActividad } from "../repositories/activity.repository";

export class ErrorComentarioNoEncontrado extends ErrorNoEncontrado {
  constructor(mensaje = "Comentario no encontrado") {
    super(mensaje);
  }
}
export class ErrorSinPermiso extends ErrorProhibido {
  constructor(mensaje = "No tenés permiso para responder este comentario") {
    super(mensaje);
  }
}
export class ErrorPropiedadNoEncontrada extends ErrorNoEncontrado {
  constructor(mensaje = "Propiedad no encontrada") {
    super(mensaje);
  }
}

export {
  ErrorComentarioNoEncontrado as CommentNotFoundError,
  ErrorSinPermiso as CommentForbiddenError,
  ErrorPropiedadNoEncontrada as PropertyNotFoundError,
};

class ServicioComentario {
  async crear(propiedadId: number, nombreAutor: string, contenido: string) {
    const propiedad = await repositorioPropiedad.buscarPorId(propiedadId);
    if (!propiedad) throw new ErrorPropiedadNoEncontrada();

    const comentario = await repositorioComentario.crear({
      nombreAutor,
      contenido,
      propiedadId,
    });

    await repositorioActividad.crearPorComentario(
      propiedad.agency.id,
      propiedadId,
      comentario.id
    );

    return comentario;
  }

  async responder(comentarioId: number, vendedorId: number, respuesta: string) {
    const comentario = await repositorioComentario.buscarPorId(comentarioId);
    if (!comentario) throw new ErrorComentarioNoEncontrado();
    if (comentario.property.agency.seller.id !== vendedorId) throw new ErrorSinPermiso();

    const guardado = await repositorioComentario.guardarRespuesta(comentario, respuesta);
    // Se devuelve sin la propiedad: venía cargada con el vendedor (y su passwordHash)
    const { property, ...datos } = guardado;
    return { ...datos, propertyId: property.id };
  }

  async listarPorPropiedad(propiedadId: number) {
    const propiedad = await repositorioPropiedad.buscarPorId(propiedadId);
    if (!propiedad) throw new ErrorPropiedadNoEncontrada();
    return repositorioComentario.buscarPorPropiedadId(propiedadId);
  }

  create(propiedadId: number, authorName: string, content: string) {
    return this.crear(propiedadId, authorName, content);
  }

  reply(comentarioId: number, vendedorId: number, reply: string) {
    return this.responder(comentarioId, vendedorId, reply);
  }

  listByProperty(propiedadId: number) {
    return this.listarPorPropiedad(propiedadId);
  }
}

export const servicioComentario = new ServicioComentario();
export const commentService = servicioComentario;
