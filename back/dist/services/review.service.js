"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = exports.servicioReseña = exports.AgencyNotFoundError = exports.ErrorInmobiliariaNoEncontrada = void 0;
const review_repository_1 = require("../repositories/review.repository");
const inmobiliaria_repositorio_1 = require("../repositories/inmobiliaria.repositorio");
const activity_repository_1 = require("../repositories/activity.repository");
class ErrorInmobiliariaNoEncontrada extends Error {
}
exports.ErrorInmobiliariaNoEncontrada = ErrorInmobiliariaNoEncontrada;
exports.AgencyNotFoundError = ErrorInmobiliariaNoEncontrada;
class ServicioReseña {
    async crear(inmobiliariaId, datos) {
        const inmobiliaria = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(inmobiliariaId);
        if (!inmobiliaria)
            throw new ErrorInmobiliariaNoEncontrada();
        const reseña = await review_repository_1.repositorioReseña.crear({ ...datos, inmobiliariaId });
        await activity_repository_1.repositorioActividad.crearPorReseña(inmobiliariaId, reseña.id);
        return reseña;
    }
    async listarPorInmobiliaria(inmobiliariaId) {
        const inmobiliaria = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(inmobiliariaId);
        if (!inmobiliaria)
            throw new ErrorInmobiliariaNoEncontrada();
        return review_repository_1.repositorioReseña.buscarPorInmobiliariaId(inmobiliariaId);
    }
    create(inmobiliariaId, datos) {
        return this.crear(inmobiliariaId, {
            nombreAutor: datos.authorName,
            contenido: datos.content,
            calificacion: datos.rating,
        });
    }
    listByAgency(inmobiliariaId) {
        return this.listarPorInmobiliaria(inmobiliariaId);
    }
}
exports.servicioReseña = new ServicioReseña();
exports.reviewService = exports.servicioReseña;
//# sourceMappingURL=review.service.js.map