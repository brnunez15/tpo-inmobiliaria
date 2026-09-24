import { repositorioComentario } from "../repositories/comment.repository";
import { repositorioPropiedad } from "../repositories/property.repository";
import { repositorioActividad } from "../repositories/activity.repository";

export class ErrorComentarioNoEncontrado extends Error {}
export class ErrorSinPermiso extends Error {}
export class ErrorPropiedadNoEncontrada extends Error {}

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

    return repositorioComentario.guardarRespuesta(comentario, respuesta);
  }

  async listarPorPropiedad(propiedadId: number) {
    const propiedad = await repositorioPropiedad.buscarPorId(propiedadId);
    if (!propiedad) throw new ErrorPropiedadNoEncontrada();
    return repositorioComentario.buscarPorPropiedadId(propiedadId);
  }
}

export const servicioComentario = new ServicioComentario();
