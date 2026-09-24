"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositorioReseña = void 0;
const data_source_1 = require("../config/data-source");
const historial_rese_as_1 = require("../entities/historial-rese\u00F1as");
class RepositorioReseña {
    get repositorio() {
        return data_source_1.AppDataSource.getRepository(historial_rese_as_1.Reseña);
    }
    buscarPorInmobiliariaId(inmobiliariaId) {
        return this.repositorio.find({
            where: { agency: { id: inmobiliariaId } },
            order: { createdAt: "DESC" },
        });
    }
    crear(datos) {
        const reseña = this.repositorio.create({
            authorName: datos.nombreAutor,
            content: datos.contenido,
            rating: datos.calificacion,
            agency: { id: datos.inmobiliariaId },
        });
        return this.repositorio.save(reseña);
    }
}
exports.repositorioReseña = new RepositorioReseña();
//# sourceMappingURL=review.repository.js.map