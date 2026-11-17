import { repositorioVendedor } from "../repositories/vendedor.repositorio";
import { repositorioInmobiliaria } from "../repositories/inmobiliaria.repositorio";
import { AppDataSource } from "../config/data-source";
import { Vendedor } from "../entities/vendedor";
import { Inmobiliaria } from "../entities/inmobiliaria";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class ErrorEmailDuplicado extends Error {}
export class ErrorNombreInmobiliariaDuplicado extends Error {}
export class ErrorCredencialesInvalidas extends Error {}

export {
  ErrorEmailDuplicado as EmailAlreadyExistsError,
  ErrorNombreInmobiliariaDuplicado as AgencyNameAlreadyExistsError,
  ErrorCredencialesInvalidas as InvalidCredentialsError,
};

// Duración del token: 2 horas (lo pide el enunciado)
const DURACION_TOKEN = "2h";

// Lo que devuelven register y login
interface RespuestaAuth {
  token: string;
  sellerId: number;
  agencyId: number;
}

interface DatosRegistro {
  email: string;
  password: string;
  fullName: string;
  nombreInmobiliaria: string;
  descripcion: string;
  telefonoContacto: string;
  emailContacto: string;
  direccionOficina?: string | null;
  logoUrl?: string | null;
}

class ServicioAuth {
  // Un solo lugar donde se firma el token, así la duración no se repite
  private generarToken(sellerId: number): string {
    return jwt.sign({ sellerId }, process.env.JWT_SECRET!, {
      expiresIn: DURACION_TOKEN,
    });
  }

  async registrar(datos: DatosRegistro): Promise<RespuestaAuth> {
    // Verificar unicidad de email y nombre de inmobiliaria
    const vendedorExistente = await repositorioVendedor.buscarPorEmail(datos.email);
    if (vendedorExistente) throw new ErrorEmailDuplicado();

    const inmobiliariaExistente = await repositorioInmobiliaria.buscarPorNombre(datos.nombreInmobiliaria);
    if (inmobiliariaExistente) throw new ErrorNombreInmobiliariaDuplicado();

    const hashContrasena = await bcrypt.hash(datos.password, 10);

    // Crear Vendedor + Inmobiliaria en una transacción
    const { vendedor, inmobiliaria } = await AppDataSource.transaction(async (manager) => {
      const repoVendedor = manager.getRepository(Vendedor);
      const repoInmobiliaria = manager.getRepository(Inmobiliaria);

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

      // Ahora devolvemos también la inmobiliaria para tener su id
      return { vendedor: nuevoVendedor, inmobiliaria: nuevaInmobiliaria };
    });

    return {
      token: this.generarToken(vendedor.id),
      sellerId: vendedor.id,
      agencyId: inmobiliaria.id,
    };
  }

  async iniciarSesion(email: string, password: string): Promise<RespuestaAuth> {
    const vendedor = await repositorioVendedor.buscarPorEmail(email);
    if (!vendedor) throw new ErrorCredencialesInvalidas();

    const contrasenaValida = await bcrypt.compare(password, vendedor.passwordHash);
    if (!contrasenaValida) throw new ErrorCredencialesInvalidas();

    // Buscamos la inmobiliaria del vendedor (relación 1:1)
    const inmobiliaria = await repositorioInmobiliaria.buscarPorVendedorId(vendedor.id);
    if (!inmobiliaria) {
      // No debería pasar: el registro crea las dos cosas juntas en una transacción
      throw new Error("El vendedor no tiene inmobiliaria asociada");
    }

    return {
      token: this.generarToken(vendedor.id),
      sellerId: vendedor.id,
      agencyId: inmobiliaria.id,
    };
  }

  register(datos: {
    email: string;
    password: string;
    fullName: string;
    agencyName: string;
    contactPhone: string;
    contactEmail: string;
    description: string;
    officeAddress?: string | null;
    logoUrl?: string | null;
  }) {
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

  login(email: string, password: string) {
    return this.iniciarSesion(email, password);
  }
}

export const servicioAuth = new ServicioAuth();
export const authService = servicioAuth;