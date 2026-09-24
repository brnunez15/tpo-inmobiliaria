"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agencyService = exports.servicioInmobiliaria = exports.AgencyHasActivePropertiesError = exports.AgencyForbiddenError = exports.AgencyNotFoundError = exports.ErrorInmobiliariaConPropiedadesActivas = exports.ErrorSinPermiso = exports.ErrorInmobiliariaNoEncontrada = void 0;
const inmobiliaria_repositorio_1 = require("../repositories/inmobiliaria.repositorio");
class ErrorInmobiliariaNoEncontrada extends Error {
}
exports.ErrorInmobiliariaNoEncontrada = ErrorInmobiliariaNoEncontrada;
exports.AgencyNotFoundError = ErrorInmobiliariaNoEncontrada;
class ErrorSinPermiso extends Error {
}
exports.ErrorSinPermiso = ErrorSinPermiso;
exports.AgencyForbiddenError = ErrorSinPermiso;
class ErrorInmobiliariaConPropiedadesActivas extends Error {
}
exports.ErrorInmobiliariaConPropiedadesActivas = ErrorInmobiliariaConPropiedadesActivas;
exports.AgencyHasActivePropertiesError = ErrorInmobiliariaConPropiedadesActivas;
class ServicioInmobiliaria {
    async obtenerPerfil(id) {
        const inmobiliaria = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(id);
        if (!inmobiliaria)
            throw new ErrorInmobiliariaNoEncontrada();
        return this.aPerfilPublico(inmobiliaria);
    }
    async actualizar(id, vendedorId, datos) {
        const inmobiliaria = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(id);
        if (!inmobiliaria)
            throw new ErrorInmobiliariaNoEncontrada();
        if (inmobiliaria.seller.id !== vendedorId)
            throw new ErrorSinPermiso();
        Object.assign(inmobiliaria, datos);
        const guardada = await inmobiliaria_repositorio_1.repositorioInmobiliaria.guardar(inmobiliaria);
        return this.aPerfilPublico(guardada);
    }
    async eliminar(id, vendedorId) {
        const inmobiliaria = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(id);
        if (!inmobiliaria)
            throw new ErrorInmobiliariaNoEncontrada();
        if (inmobiliaria.seller.id !== vendedorId)
            throw new ErrorSinPermiso();
        const cantidadActivas = await inmobiliaria_repositorio_1.repositorioInmobiliaria.contarActivasPorInmobiliariaId(id);
        if (cantidadActivas > 0)
            throw new ErrorInmobiliariaConPropiedadesActivas();
        await inmobiliaria_repositorio_1.repositorioInmobiliaria.eliminar(inmobiliaria);
    }
    async obtenerPropiedades(id) {
        const inmobiliaria = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(id);
        if (!inmobiliaria)
            throw new ErrorInmobiliariaNoEncontrada();
        return inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPublicadasPorInmobiliariaId(id);
    }
    getPublicProfile(id) {
        return this.obtenerPerfil(id);
    }
    update(id, vendedorId, datos) {
        return this.actualizar(id, vendedorId, datos);
    }
    delete(id, vendedorId) {
        return this.eliminar(id, vendedorId);
    }
    getProperties(id) {
        return this.obtenerPropiedades(id);
    }
    aPerfilPublico(inmobiliaria) {
        return {
            id: inmobiliaria.id,
            nombre: inmobiliaria.name,
            descripcion: inmobiliaria.description,
            logo: inmobiliaria.logoUrl,
            telefonoContacto: inmobiliaria.contactPhone,
            emailContacto: inmobiliaria.contactEmail,
            direccionOficina: inmobiliaria.officeAddress,
            creadaEn: inmobiliaria.createdAt,
        };
    }
}
exports.servicioInmobiliaria = new ServicioInmobiliaria();
exports.agencyService = exports.servicioInmobiliaria;
//# sourceMappingURL=inmobiliaria.service.js.map