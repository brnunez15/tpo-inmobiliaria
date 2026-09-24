"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositorioSolicitudVisita = void 0;
const data_source_1 = require("../config/data-source");
const visitas_1 = require("../entities/visitas");
const enums_1 = require("../entities/enums");
class RepositorioSolicitudVisita {
    get repositorio() {
        return data_source_1.AppDataSource.getRepository(visitas_1.SolicitudVisita);
    }
    buscarPorId(id) {
        return this.repositorio.findOne({
            where: { id },
            relations: { property: { agency: { seller: true } } },
        });
    }
    buscarPorInmobiliariaId(inmobiliariaId) {
        return this.repositorio.find({
            where: { property: { agency: { id: inmobiliariaId } } },
            relations: { property: true },
            order: { createdAt: "DESC" },
        });
    }
    /** Verifica si hay alguna visita Confirmada aún no realizada sobre una propiedad. */
    tieneConfirmadaPendiente(propiedadId) {
        return this.repositorio.existsBy({
            property: { id: propiedadId },
            status: enums_1.VisitRequestStatus.CONFIRMED,
        });
    }
    crear(datos) {
        const visita = this.repositorio.create({
            requesterName: datos.nombreSolicitante,
            requesterPhone: datos.telefonoSolicitante,
            proposedDate: datos.fechaPropuesta,
            message: datos.mensaje ?? null,
            status: enums_1.VisitRequestStatus.PENDING,
            property: { id: datos.propiedadId },
        });
        return this.repositorio.save(visita);
    }
    async actualizarEstado(visita, nuevoEstado) {
        visita.status = nuevoEstado;
        return this.repositorio.save(visita);
    }
}
exports.repositorioSolicitudVisita = new RepositorioSolicitudVisita();
//# sourceMappingURL=visit-request.repository.js.map