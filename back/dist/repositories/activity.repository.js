"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityRepository = exports.repositorioActividad = void 0;
const data_source_1 = require("../config/data-source");
const actividad_1 = require("../entities/actividad");
const enums_1 = require("../entities/enums");
class RepositorioActividad {
    get repositorio() {
        return data_source_1.AppDataSource.getRepository(actividad_1.Actividad);
    }
    buscarPorId(id) {
        return this.repositorio.findOne({
            where: { id },
            relations: { agency: { seller: true } },
        });
    }
    buscarPorInmobiliariaId(inmobiliariaId) {
        return this.repositorio.find({
            where: { agency: { id: inmobiliariaId } },
            relations: { comment: true, visitRequest: true, review: true, property: true },
            order: { createdAt: "DESC" },
        });
    }
    contarNoLeidasPorInmobiliariaId(inmobiliariaId) {
        return this.repositorio.count({
            where: { agency: { id: inmobiliariaId }, read: false },
        });
    }
    crearPorComentario(inmobiliariaId, propiedadId, comentarioId) {
        const actividad = this.repositorio.create({
            type: enums_1.ActivityType.COMMENT,
            read: false,
            agency: { id: inmobiliariaId },
            property: { id: propiedadId },
            comment: { id: comentarioId },
            visitRequest: null,
            review: null,
        });
        return this.repositorio.save(actividad);
    }
    crearPorVisita(inmobiliariaId, propiedadId, visitaId) {
        const actividad = this.repositorio.create({
            type: enums_1.ActivityType.VISIT_REQUEST,
            read: false,
            agency: { id: inmobiliariaId },
            property: { id: propiedadId },
            comment: null,
            visitRequest: { id: visitaId },
            review: null,
        });
        return this.repositorio.save(actividad);
    }
    crearPorReseña(inmobiliariaId, reseñaId) {
        const actividad = this.repositorio.create({
            type: enums_1.ActivityType.REVIEW,
            read: false,
            agency: { id: inmobiliariaId },
            property: null,
            comment: null,
            visitRequest: null,
            review: { id: reseñaId },
        });
        return this.repositorio.save(actividad);
    }
    async marcarLeida(actividad) {
        actividad.read = true;
        return this.repositorio.save(actividad);
    }
    findById(id) {
        return this.buscarPorId(id);
    }
    findByAgencyId(agencyId) {
        return this.buscarPorInmobiliariaId(agencyId);
    }
    countUnreadByAgencyId(agencyId) {
        return this.contarNoLeidasPorInmobiliariaId(agencyId);
    }
    markAsRead(actividad) {
        return this.marcarLeida(actividad);
    }
}
exports.repositorioActividad = new RepositorioActividad();
exports.activityRepository = exports.repositorioActividad;
//# sourceMappingURL=activity.repository.js.map