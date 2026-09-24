"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyService = exports.servicioPropiedad = void 0;
const property_repository_1 = require("../repositories/property.repository");
const galeria_imagen_repository_1 = require("../repositories/galeria-imagen.repository");
const visit_request_repository_1 = require("../repositories/visit-request.repository");
const enums_1 = require("../entities/enums");
class ServicioPropiedad {
    async obtenerPorId(id) {
        const propiedad = await property_repository_1.repositorioPropiedad.buscarPorId(id);
        if (!propiedad)
            return null;
        const imagenes = await galeria_imagen_repository_1.repositorioGaleriaImagen.buscarPorPropiedadId(id);
        return { ...propiedad, imagenes };
    }
    crear(datos) {
        if (Number(datos.price) <= 0) {
            throw new Error("El precio debe ser mayor a 0");
        }
        if (Number(datos.totalAreaM2) <= 0) {
            throw new Error("La superficie total debe ser mayor a 0");
        }
        return property_repository_1.repositorioPropiedad.crear({
            ...datos,
            type: datos.type,
            operation: datos.operation,
            coveredAreaM2: datos.coveredAreaM2 ?? null,
            rooms: datos.rooms ?? null,
            bedrooms: datos.bedrooms ?? null,
            bathrooms: datos.bathrooms ?? null,
            ageYears: datos.ageYears ?? null,
            tags: datos.tags ?? [],
            status: datos.status ?? enums_1.PropertyStatus.DRAFT,
        });
    }
    async actualizar(id, datos) {
        const propiedad = await property_repository_1.repositorioPropiedad.buscarPorId(id);
        if (!propiedad)
            throw new Error("Propiedad no encontrada");
        if (propiedad.status === enums_1.PropertyStatus.SOLD ||
            propiedad.status === enums_1.PropertyStatus.RENTED ||
            propiedad.status === enums_1.PropertyStatus.CANCELLED) {
            throw new Error("No se puede editar una propiedad Vendida, Alquilada o Cancelada");
        }
        const tieneVisitaConfirmada = await visit_request_repository_1.repositorioSolicitudVisita.tieneConfirmadaPendiente(id);
        if (tieneVisitaConfirmada) {
            throw new Error("No se puede editar una propiedad con una visita Confirmada pendiente");
        }
        if (datos.price !== undefined && Number(datos.price) <= 0) {
            throw new Error("El precio debe ser mayor a 0");
        }
        if (datos.totalAreaM2 !== undefined && Number(datos.totalAreaM2) <= 0) {
            throw new Error("La superficie total debe ser mayor a 0");
        }
        return property_repository_1.repositorioPropiedad.actualizar(id, datos);
    }
    buscarTodos(filtros, paginacion) {
        return property_repository_1.repositorioPropiedad.buscarTodos(filtros, paginacion);
    }
    getById(id) {
        return this.obtenerPorId(id);
    }
    create(datos) {
        return this.crear(datos);
    }
    update(id, datos) {
        return this.actualizar(id, datos);
    }
    async findAll(filtros, paginacion) {
        const res = await this.buscarTodos(filtros, { pagina: paginacion.page, limite: paginacion.limit });
        return { data: res.datos, total: res.total };
    }
}
exports.servicioPropiedad = new ServicioPropiedad();
exports.propertyService = exports.servicioPropiedad;
//# sourceMappingURL=property.service.js.map