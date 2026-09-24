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
  async registrar(datos: DatosRegistro): Promise<{ token: string }> {
    // Verificar unicidad de email y nombre de inmobiliaria
    const vendedorExistente = await repositorioVendedor.buscarPorEmail(datos.email);
    if (vendedorExistente) throw new ErrorEmailDuplicado();

    const inmobiliariaExistente = await repositorioInmobiliaria.buscarPorNombre(datos.nombreInmobiliaria);
    if (inmobiliariaExistente) throw new ErrorNombreInmobiliariaDuplicado();

    const hashContrasena = await bcrypt.hash(datos.password, 10);

    // Crear Vendedor + Inmobiliaria en una transacción
    const { vendedor } = await AppDataSource.transaction(async (manager) => {
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

      return { vendedor: nuevoVendedor };
    });

    const token = jwt.sign({ sellerId: vendedor.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    return { token };
  }

  async iniciarSesion(email: string, password: string): Promise<{ token: string }> {
    const vendedor = await repositorioVendedor.buscarPorEmail(email);
    if (!vendedor) throw new ErrorCredencialesInvalidas();

    const contrasenaValida = await bcrypt.compare(password, vendedor.passwordHash);
    if (!contrasenaValida) throw new ErrorCredencialesInvalidas();

    const token = jwt.sign({ sellerId: vendedor.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    return { token };
  }
}

export const servicioAuth = new ServicioAuth();