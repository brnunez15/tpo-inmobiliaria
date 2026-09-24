"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitRequestService = exports.servicioSolicitudVisita = exports.AgencyNotFoundError = exports.PropertyNotFoundError = exports.VisitRequestInvalidTransitionError = exports.VisitRequestForbiddenError = exports.VisitRequestNotFoundError = exports.ErrorInmobiliariaNoEncontrada = exports.ErrorPropiedadNoEncontrada = exports.ErrorTransicionVisitaInvalida = exports.ErrorSinPermiso = exports.ErrorVisitaNoEncontrada = void 0;
const visit_request_repository_1 = require("../repositories/visit-request.repository");
const property_repository_1 = require("../repositories/property.repository");
const inmobiliaria_repositorio_1 = require("../repositories/inmobiliaria.repositorio");
const activity_repository_1 = require("../repositories/activity.repository");
const enums_1 = require("../entities/enums");
class ErrorVisitaNoEncontrada extends Error {
}
exports.ErrorVisitaNoEncontrada = ErrorVisitaNoEncontrada;
exports.VisitRequestNotFoundError = ErrorVisitaNoEncontrada;
class ErrorSinPermiso extends Error {
}
exports.ErrorSinPermiso = ErrorSinPermiso;
exports.VisitRequestForbiddenError = ErrorSinPermiso;
class ErrorTransicionVisitaInvalida extends Error {
}
exports.ErrorTransicionVisitaInvalida = ErrorTransicionVisitaInvalida;
exports.VisitRequestInvalidTransitionError = ErrorTransicionVisitaInvalida;
class ErrorPropiedadNoEncontrada extends Error {
}
exports.ErrorPropiedadNoEncontrada = ErrorPropiedadNoEncontrada;
exports.PropertyNotFoundError = ErrorPropiedadNoEncontrada;
class ErrorInmobiliariaNoEncontrada extends Error {
}
exports.ErrorInmobiliariaNoEncontrada = ErrorInmobiliariaNoEncontrada;
exports.AgencyNotFoundError = ErrorInmobiliariaNoEncontrada;
const TRANSICIONES_PERMITIDAS = {
    [enums_1.VisitRequestStatus.PENDING]: [enums_1.VisitRequestStatus.CONFIRMED, enums_1.VisitRequestStatus.REJECTED, enums_1.VisitRequestStatus.CANCELLED],
    [enums_1.VisitRequestStatus.CONFIRMED]: [enums_1.VisitRequestStatus.COMPLETED, enums_1.VisitRequestStatus.CANCELLED, enums_1.VisitRequestStatus.REJECTED],
    [enums_1.VisitRequestStatus.COMPLETED]: [],
    [enums_1.VisitRequestStatus.CANCELLED]: [],
    [enums_1.VisitRequestStatus.REJECTED]: [],
};
class ServicioSolicitudVisita {
    async crear(propiedadId, datos) {
        if (datos.fechaPropuesta <= new Date()) {
            throw new Error("La fecha propuesta debe ser en el futuro");
        }
        const propiedad = await property_repository_1.repositorioPropiedad.buscarPorId(propiedadId);
        if (!propiedad)
            throw new ErrorPropiedadNoEncontrada();
        const visita = await visit_request_repository_1.repositorioSolicitudVisita.crear({ ...datos, propiedadId });
        await activity_repository_1.repositorioActividad.crearPorVisita(propiedad.agency.id, propiedadId, visita.id);
        return visita;
    }
    async cambiarEstado(visitaId, vendedorId, nuevoEstado) {
        const visita = await visit_request_repository_1.repositorioSolicitudVisita.buscarPorId(visitaId);
        if (!visita)
            throw new ErrorVisitaNoEncontrada();
        if (visita.property.agency.seller.id !== vendedorId)
            throw new ErrorSinPermiso();
        const permitidos = TRANSICIONES_PERMITIDAS[visita.status];
        if (!permitidos.includes(nuevoEstado)) {
            throw new ErrorTransicionVisitaInvalida(`Transición inválida: ${visita.status} → ${nuevoEstado}`);
        }
        return visit_request_repository_1.repositorioSolicitudVisita.actualizarEstado(visita, nuevoEstado);
    }
    async listarPorInmobiliaria(inmobiliariaId, vendedorId) {
        const inmobiliaria = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(inmobiliariaId);
        if (!inmobiliaria)
            throw new ErrorInmobiliariaNoEncontrada();
        if (inmobiliaria.seller.id !== vendedorId)
            throw new ErrorSinPermiso();
        return visit_request_repository_1.repositorioSolicitudVisita.buscarPorInmobiliariaId(inmobiliariaId);
    }
    create(propiedadId, datos) {
        return this.crear(propiedadId, {
            nombreSolicitante: datos.requesterName,
            telefonoSolicitante: datos.requesterPhone,
            fechaPropuesta: datos.proposedDate,
            mensaje: datos.message,
        });
    }
    changeStatus(visitaId, vendedorId, nuevoEstado) {
        return this.cambiarEstado(visitaId, vendedorId, nuevoEstado);
    }
    listByAgency(inmobiliariaId, vendedorId) {
        return this.listarPorInmobiliaria(inmobiliariaId, vendedorId);
    }
}
exports.servicioSolicitudVisita = new ServicioSolicitudVisita();
exports.visitRequestService = exports.servicioSolicitudVisita;
//# sourceMappingURL=visit-request.service.js.map