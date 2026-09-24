"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agencyRepository = exports.repositorioInmobiliaria = void 0;
const data_source_1 = require("../config/data-source");
const inmobiliaria_1 = require("../entities/inmobiliaria");
const propiedad_1 = require("../entities/propiedad");
const enums_1 = require("../entities/enums");
class RepositorioInmobiliaria {
    get repositorio() {
        return data_source_1.AppDataSource.getRepository(inmobiliaria_1.Inmobiliaria);
    }
    get repositorioPropiedades() {
        return data_source_1.AppDataSource.getRepository(propiedad_1.Propiedad);
    }
    buscarPorNombre(nombre) {
        return this.repositorio.findOneBy({ name: nombre });
    }
    buscarPorVendedorId(vendedorId) {
        return this.repositorio.findOne({ where: { seller: { id: vendedorId } } });
    }
    buscarPorId(id) {
        return this.repositorio.findOne({ where: { id }, relations: { seller: true } });
    }
    guardar(inmobiliaria) {
        return this.repositorio.save(inmobiliaria);
    }
    eliminar(inmobiliaria) {
        return this.repositorio.remove(inmobiliaria).then(() => undefined);
    }
    /** Propiedades publicadas de la inmobiliaria (para el perfil público). */
    buscarPublicadasPorInmobiliariaId(inmobiliariaId) {
        return this.repositorioPropiedades.find({
            where: { agency: { id: inmobiliariaId }, status: enums_1.PropertyStatus.PUBLISHED },
        });
    }
    /** Cuenta propiedades con estado Publicada o Reservada (para validar el DELETE). */
    contarActivasPorInmobiliariaId(inmobiliariaId) {
        return this.repositorioPropiedades.count({
            where: [
                { agency: { id: inmobiliariaId }, status: enums_1.PropertyStatus.PUBLISHED },
                { agency: { id: inmobiliariaId }, status: enums_1.PropertyStatus.RESERVED },
            ],
        });
    }
    findById(id) {
        return this.buscarPorId(id);
    }
}
exports.repositorioInmobiliaria = new RepositorioInmobiliaria();
exports.agencyRepository = exports.repositorioInmobiliaria;
//# sourceMappingURL=inmobiliaria.repositorio.js.map