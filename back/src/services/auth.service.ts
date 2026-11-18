import { ErrorConflicto, ErrorNoAutenticado } from "../errors/dominio.errors";
import { repositorioVendedor } from "../repositories/vendedor.repositorio";
import { repositorioInmobiliaria } from "../repositories/inmobiliaria.repositorio";
import { AppDataSource } from "../config/data-source";
import { Vendedor } from "../entities/vendedor";
import { Inmobiliaria } from "../entities/inmobiliaria";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class ErrorEmailDuplicado extends ErrorConflicto {
  constructor(mensaje = "El email ya está registrado") {
    super(mensaje);
  }
}
export class ErrorNombreInmobiliariaDuplicado extends ErrorConflicto {
  constructor(mensaje = "El nombre de fantasía ya existe") {
    super(mensaje);
  }
}
export class ErrorCredencialesInvalidas extends ErrorNoAutenticado {
  constructor(mensaje = "Credenciales inválidas") {
    super(mensaje);
  }
}

export {
  ErrorEmailDuplicado as EmailAlreadyExistsError,
  ErrorNombreInmobiliariaDuplicado as AgencyNameAlreadyExistsError,
  ErrorCredencialesInvalidas as InvalidCredentialsError,
};

/* ahora el token dura 2 horas */
const DURACION_TOKEN = "2h";

interface RespuestaAuth {
  token: string;
  sellerId: number;
  agencyId: number | null; // null si el vendedor eliminó su inmobiliaria
}

interface DatosRegistro {
  email: string;
  password: string;
  fullName: string;
  telefono?: string | null;
  nombreInmobiliaria: string;
  descripcion: string;
  telefonoContacto: string;
  emailContacto: string;
  direccionOficina?: string | null;
  logoUrl?: string | null;
}

class ServicioAuth {
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

    const { vendedor, inmobiliaria } = await AppDataSource.transaction(async (manager) => {
      const repoVendedor = manager.getRepository(Vendedor);
      const repoInmobiliaria = manager.getRepository(Inmobiliaria);

      const nuevoVendedor = repoVendedor.create({
        email: datos.email,
        passwordHash: hashContrasena,
        fullName: datos.fullName,
        phone: datos.telefono ?? null,
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

      /* se devuelve el id de la inmobiliaria */
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

    return {
      token: this.generarToken(vendedor.id),
      sellerId: vendedor.id,
      // Un vendedor tiene "como máximo" una inmobiliaria: si la eliminó, puede
      // seguir entrando y el front le muestra que no tiene inmobiliaria.
      agencyId: inmobiliaria ? inmobiliaria.id : null,
    };
  }

  /** Datos del vendedor logueado (GET /auth/me). Nunca se devuelve el passwordHash. */
  async obtenerPerfil(vendedorId: number) {
    const vendedor = await repositorioVendedor.buscarPorId(vendedorId);
    // El token es válido pero el vendedor ya no existe (por ej. se dio de baja)
    if (!vendedor) throw new ErrorCredencialesInvalidas("El vendedor del token ya no existe");

    const inmobiliaria = await repositorioInmobiliaria.buscarPorVendedorId(vendedor.id);

    return {
      id: vendedor.id,
      fullName: vendedor.fullName,
      email: vendedor.email,
      phone: vendedor.phone,
      agencyId: inmobiliaria ? inmobiliaria.id : null,
    };
  }

  register(datos: {
    email: string;
    password: string;
    fullName: string;
    phone?: string | null;
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
      telefono: datos.phone,
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