"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositorioVendedor = void 0;
const data_source_1 = require("../config/data-source");
const vendedor_1 = require("../entities/vendedor");
class RepositorioVendedor {
    get repositorio() {
        return data_source_1.AppDataSource.getRepository(vendedor_1.Vendedor);
    }
    buscarPorEmail(email) {
        return this.repositorio.findOneBy({ email });
    }
    crear(datos) {
        const vendedor = this.repositorio.create(datos);
        return this.repositorio.save(vendedor);
    }
}
exports.repositorioVendedor = new RepositorioVendedor();
//# sourceMappingURL=vendedor.repositorio.js.map