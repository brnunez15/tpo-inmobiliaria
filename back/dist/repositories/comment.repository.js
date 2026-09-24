"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositorioComentario = void 0;
const data_source_1 = require("../config/data-source");
const historial_comentarios_1 = require("../entities/historial-comentarios");
class RepositorioComentario {
    get repositorio() {
        return data_source_1.AppDataSource.getRepository(historial_comentarios_1.Comentario);
    }
    buscarPorId(id) {
        return this.repositorio.findOne({
            where: { id },
            relations: { property: { agency: { seller: true } } },
        });
    }
    buscarPorPropiedadId(propiedadId) {
        return this.repositorio.find({
            where: { property: { id: propiedadId } },
            order: { createdAt: "ASC" },
        });
    }
    crear(datos) {
        const comentario = this.repositorio.create({
            authorName: datos.nombreAutor,
            content: datos.contenido,
            response: null,
            property: { id: datos.propiedadId },
        });
        return this.repositorio.save(comentario);
    }
    async guardarRespuesta(comentario, respuesta) {
        comentario.response = respuesta;
        return this.repositorio.save(comentario);
    }
}
exports.repositorioComentario = new RepositorioComentario();
//# sourceMappingURL=comment.repository.js.map