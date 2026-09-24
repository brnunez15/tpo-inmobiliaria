"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyStatusHistoryRepository = exports.repositorioHistorialEstado = void 0;
const data_source_1 = require("../config/data-source");
const historial_estado_propiedad_1 = require("../entities/historial-estado-propiedad");
class RepositorioHistorialEstado {
    get repositorio() {
        return data_source_1.AppDataSource.getRepository(historial_estado_propiedad_1.HistorialEstadoPropiedad);
    }
    crear(datos) {
        const registro = this.repositorio.create({
            fromStatus: datos.estadoAnterior,
            toStatus: datos.estadoNuevo,
            property: { id: datos.propiedadId },
        });
        return this.repositorio.save(registro);
    }
    buscarPorPropiedadId(propiedadId) {
        return this.repositorio.find({
            where: { property: { id: propiedadId } },
            order: { createdAt: "ASC" },
        });
    }
    /** Fecha en que una propiedad pasó a un estado específico por primera vez. */
    buscarPrimeraTransicionA(propiedadId, estadoDestino) {
        return this.repositorio.findOne({
            where: { property: { id: propiedadId }, toStatus: estadoDestino },
            order: { createdAt: "ASC" },
        });
    }
}
exports.repositorioHistorialEstado = new RepositorioHistorialEstado();
exports.propertyStatusHistoryRepository = exports.repositorioHistorialEstado;
//# sourceMappingURL=property-status-history.repository.js.map