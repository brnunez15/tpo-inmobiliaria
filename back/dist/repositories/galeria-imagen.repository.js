"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositorioGaleriaImagen = void 0;
const data_source_1 = require("../config/data-source");
const galeria_imagenes_1 = require("../entities/galeria-imagenes");
class RepositorioGaleriaImagen {
    get repositorio() {
        return data_source_1.AppDataSource.getRepository(galeria_imagenes_1.GaleriaImagen);
    }
    buscarPorPropiedadId(propiedadId) {
        return this.repositorio.find({
            where: { property: { id: propiedadId } },
        });
    }
}
exports.repositorioGaleriaImagen = new RepositorioGaleriaImagen();
//# sourceMappingURL=galeria-imagen.repository.js.map