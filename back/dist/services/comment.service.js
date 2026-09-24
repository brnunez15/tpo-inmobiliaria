"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.servicioComentario = exports.PropertyNotFoundError = exports.CommentForbiddenError = exports.CommentNotFoundError = exports.ErrorPropiedadNoEncontrada = exports.ErrorSinPermiso = exports.ErrorComentarioNoEncontrado = void 0;
const comment_repository_1 = require("../repositories/comment.repository");
const property_repository_1 = require("../repositories/property.repository");
const activity_repository_1 = require("../repositories/activity.repository");
class ErrorComentarioNoEncontrado extends Error {
}
exports.ErrorComentarioNoEncontrado = ErrorComentarioNoEncontrado;
exports.CommentNotFoundError = ErrorComentarioNoEncontrado;
class ErrorSinPermiso extends Error {
}
exports.ErrorSinPermiso = ErrorSinPermiso;
exports.CommentForbiddenError = ErrorSinPermiso;
class ErrorPropiedadNoEncontrada extends Error {
}
exports.ErrorPropiedadNoEncontrada = ErrorPropiedadNoEncontrada;
exports.PropertyNotFoundError = ErrorPropiedadNoEncontrada;
class ServicioComentario {
    async crear(propiedadId, nombreAutor, contenido) {
        const propiedad = await property_repository_1.repositorioPropiedad.buscarPorId(propiedadId);
        if (!propiedad)
            throw new ErrorPropiedadNoEncontrada();
        const comentario = await comment_repository_1.repositorioComentario.crear({
            nombreAutor,
            contenido,
            propiedadId,
        });
        await activity_repository_1.repositorioActividad.crearPorComentario(propiedad.agency.id, propiedadId, comentario.id);
        return comentario;
    }
    async responder(comentarioId, vendedorId, respuesta) {
        const comentario = await comment_repository_1.repositorioComentario.buscarPorId(comentarioId);
        if (!comentario)
            throw new ErrorComentarioNoEncontrado();
        if (comentario.property.agency.seller.id !== vendedorId)
            throw new ErrorSinPermiso();
        return comment_repository_1.repositorioComentario.guardarRespuesta(comentario, respuesta);
    }
    async listarPorPropiedad(propiedadId) {
        const propiedad = await property_repository_1.repositorioPropiedad.buscarPorId(propiedadId);
        if (!propiedad)
            throw new ErrorPropiedadNoEncontrada();
        return comment_repository_1.repositorioComentario.buscarPorPropiedadId(propiedadId);
    }
    create(propiedadId, authorName, content) {
        return this.crear(propiedadId, authorName, content);
    }
    reply(comentarioId, vendedorId, reply) {
        return this.responder(comentarioId, vendedorId, reply);
    }
    listByProperty(propiedadId) {
        return this.listarPorPropiedad(propiedadId);
    }
}
exports.servicioComentario = new ServicioComentario();
exports.commentService = exports.servicioComentario;
//# sourceMappingURL=comment.service.js.map