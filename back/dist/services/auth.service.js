"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.servicioAuth = exports.InvalidCredentialsError = exports.AgencyNameAlreadyExistsError = exports.EmailAlreadyExistsError = exports.ErrorCredencialesInvalidas = exports.ErrorNombreInmobiliariaDuplicado = exports.ErrorEmailDuplicado = void 0;
const vendedor_repositorio_1 = require("../repositories/vendedor.repositorio");
const inmobiliaria_repositorio_1 = require("../repositories/inmobiliaria.repositorio");
const data_source_1 = require("../config/data-source");
const vendedor_1 = require("../entities/vendedor");
const inmobiliaria_1 = require("../entities/inmobiliaria");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class ErrorEmailDuplicado extends Error {
}
exports.ErrorEmailDuplicado = ErrorEmailDuplicado;
exports.EmailAlreadyExistsError = ErrorEmailDuplicado;
class ErrorNombreInmobiliariaDuplicado extends Error {
}
exports.ErrorNombreInmobiliariaDuplicado = ErrorNombreInmobiliariaDuplicado;
exports.AgencyNameAlreadyExistsError = ErrorNombreInmobiliariaDuplicado;
class ErrorCredencialesInvalidas extends Error {
}
exports.ErrorCredencialesInvalidas = ErrorCredencialesInvalidas;
exports.InvalidCredentialsError = ErrorCredencialesInvalidas;
class ServicioAuth {
    async registrar(datos) {
        // Verificar unicidad de email y nombre de inmobiliaria
        const vendedorExistente = await vendedor_repositorio_1.repositorioVendedor.buscarPorEmail(datos.email);
        if (vendedorExistente)
            throw new ErrorEmailDuplicado();
        const inmobiliariaExistente = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorNombre(datos.nombreInmobiliaria);
        if (inmobiliariaExistente)
            throw new ErrorNombreInmobiliariaDuplicado();
        const hashContrasena = await bcrypt_1.default.hash(datos.password, 10);
        // Crear Vendedor + Inmobiliaria en una transacción
        const { vendedor } = await data_source_1.AppDataSource.transaction(async (manager) => {
            const repoVendedor = manager.getRepository(vendedor_1.Vendedor);
            const repoInmobiliaria = manager.getRepository(inmobiliaria_1.Inmobiliaria);
            const nuevoVendedor = repoVendedor.create({
                email: datos.email,
                passwordHash: hashContrasena,
                fullName: datos.fullName,
            });
            await repoVendedor.save(nuevoVendedor);
            const nuevaInmobiliaria = repoInmobiliaria.create({
                name: datos.nombreInmobiliaria,
                description: datos.descripcion,
                contactPhone: datos.telefonoContacto,
                contactEmail: datos.emailContacto,
                officeAddress: datos.direccionOficina ?? null,
                logoUrl: datos.logoUrl ?? null,
                seller: nuevoVendedor,
            });
            await repoInmobiliaria.save(nuevaInmobiliaria);
            return { vendedor: nuevoVendedor };
        });
        const token = jsonwebtoken_1.default.sign({ sellerId: vendedor.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return { token };
    }
    async iniciarSesion(email, password) {
        const vendedor = await vendedor_repositorio_1.repositorioVendedor.buscarPorEmail(email);
        if (!vendedor)
            throw new ErrorCredencialesInvalidas();
        const contrasenaValida = await bcrypt_1.default.compare(password, vendedor.passwordHash);
        if (!contrasenaValida)
            throw new ErrorCredencialesInvalidas();
        const token = jsonwebtoken_1.default.sign({ sellerId: vendedor.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return { token };
    }
    register(datos) {
        return this.registrar({
            email: datos.email,
            password: datos.password,
            fullName: datos.fullName,
            nombreInmobiliaria: datos.agencyName,
            descripcion: datos.description,
            telefonoContacto: datos.contactPhone,
            emailContacto: datos.contactEmail,
            direccionOficina: datos.officeAddress,
            logoUrl: datos.logoUrl,
        });
    }
    login(email, password) {
        return this.iniciarSesion(email, password);
    }
}
exports.servicioAuth = new ServicioAuth();
exports.authService = exports.servicioAuth;
//# sourceMappingURL=auth.service.js.map