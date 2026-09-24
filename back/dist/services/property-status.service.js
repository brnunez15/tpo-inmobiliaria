"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyStatusService = exports.servicioEstadoPropiedad = exports.PropertyForbiddenError = exports.PropertyNotFoundError = exports.PropertyStatusInvalidTransitionError = exports.ErrorSinPermiso = exports.ErrorPropiedadNoEncontrada = exports.ErrorTransicionEstadoInvalida = void 0;
const property_repository_1 = require("../repositories/property.repository");
const property_status_history_repository_1 = require("../repositories/property-status-history.repository");
const enums_1 = require("../entities/enums");
class ErrorTransicionEstadoInvalida extends Error {
}
exports.ErrorTransicionEstadoInvalida = ErrorTransicionEstadoInvalida;
exports.PropertyStatusInvalidTransitionError = ErrorTransicionEstadoInvalida;
class ErrorPropiedadNoEncontrada extends Error {
}
exports.ErrorPropiedadNoEncontrada = ErrorPropiedadNoEncontrada;
exports.PropertyNotFoundError = ErrorPropiedadNoEncontrada;
class ErrorSinPermiso extends Error {
}
exports.ErrorSinPermiso = ErrorSinPermiso;
exports.PropertyForbiddenError = ErrorSinPermiso;
/**
 * Transiciones de estado permitidas.
 * Cancelada es posible desde cualquier estado activo (no terminal).
 */
const TRANSICIONES_PERMITIDAS = {
    [enums_1.PropertyStatus.DRAFT]: [enums_1.PropertyStatus.PUBLISHED, enums_1.PropertyStatus.CANCELLED],
    [enums_1.PropertyStatus.PUBLISHED]: [enums_1.PropertyStatus.PAUSED, enums_1.PropertyStatus.RESERVED, enums_1.PropertyStatus.CANCELLED],
    [enums_1.PropertyStatus.PAUSED]: [enums_1.PropertyStatus.PUBLISHED, enums_1.PropertyStatus.CANCELLED],
    [enums_1.PropertyStatus.RESERVED]: [enums_1.PropertyStatus.PUBLISHED, enums_1.PropertyStatus.SOLD, enums_1.PropertyStatus.RENTED, enums_1.PropertyStatus.CANCELLED],
    [enums_1.PropertyStatus.SOLD]: [],
    [enums_1.PropertyStatus.RENTED]: [],
    [enums_1.PropertyStatus.CANCELLED]: [],
};
class ServicioEstadoPropiedad {
    async cambiarEstado(propiedadId, vendedorId, nuevoEstado) {
        const propiedad = await property_repository_1.repositorioPropiedad.buscarPorId(propiedadId);
        if (!propiedad)
            throw new ErrorPropiedadNoEncontrada();
        if (propiedad.agency.seller.id !== vendedorId)
            throw new ErrorSinPermiso();
        const permitidos = TRANSICIONES_PERMITIDAS[propiedad.status];
        if (!permitidos.includes(nuevoEstado)) {
            throw new ErrorTransicionEstadoInvalida(`Transición inválida: ${propiedad.status} → ${nuevoEstado}. Permitidas: ${permitidos.join(", ") || "ninguna"}`);
        }
        await property_status_history_repository_1.repositorioHistorialEstado.crear({
            propiedadId,
            estadoAnterior: propiedad.status,
            estadoNuevo: nuevoEstado,
        });
        await property_repository_1.repositorioPropiedad.actualizar(propiedadId, { status: nuevoEstado });
        return { status: nuevoEstado };
    }
    async obtenerHistorial(propiedadId) {
        const propiedad = await property_repository_1.repositorioPropiedad.buscarPorId(propiedadId);
        if (!propiedad)
            throw new ErrorPropiedadNoEncontrada();
        return property_status_history_repository_1.repositorioHistorialEstado.buscarPorPropiedadId(propiedadId);
    }
    changeStatus(propiedadId, vendedorId, nuevoEstado) {
        return this.cambiarEstado(propiedadId, vendedorId, nuevoEstado);
    }
    getHistory(propiedadId) {
        return this.obtenerHistorial(propiedadId);
    }
}
exports.servicioEstadoPropiedad = new ServicioEstadoPropiedad();
exports.propertyStatusService = exports.servicioEstadoPropiedad;
//# sourceMappingURL=property-status.service.js.map