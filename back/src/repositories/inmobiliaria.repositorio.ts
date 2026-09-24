import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Inmobiliaria } from "../entities/inmobiliaria";
import { Propiedad } from "../entities/propiedad";
import { PropertyStatus } from "../entities/enums";

class RepositorioInmobiliaria {
  private get repositorio(): Repository<Inmobiliaria> {
    return AppDataSource.getRepository(Inmobiliaria);
  }

  private get repositorioPropiedades(): Repository<Propiedad> {
    return AppDataSource.getRepository(Propiedad);
  }

  buscarPorNombre(nombre: string): Promise<Inmobiliaria | null> {
    return this.repositorio.findOneBy({ name: nombre });
  }

  buscarPorVendedorId(vendedorId: number): Promise<Inmobiliaria | null> {
    return this.repositorio.findOne({ where: { seller: { id: vendedorId } } });
  }

  buscarPorId(id: number): Promise<Inmobiliaria | null> {
    return this.repositorio.findOne({ where: { id }, relations: { seller: true } });
  }

  guardar(inmobiliaria: Inmobiliaria): Promise<Inmobiliaria> {
    return this.repositorio.save(inmobiliaria);
  }

  eliminar(inmobiliaria: Inmobiliaria): Promise<void> {
    return this.repositorio.remove(inmobiliaria).then(() => undefined);
  }

  /** Propiedades publicadas de la inmobiliaria (para el perfil público). */
  buscarPublicadasPorInmobiliariaId(inmobiliariaId: number): Promise<Propiedad[]> {
    return this.repositorioPropiedades.find({
      where: { agency: { id: inmobiliariaId }, status: PropertyStatus.PUBLISHED },
    });
  }

  /** Cuenta propiedades con estado Publicada o Reservada (para validar el DELETE). */
  contarActivasPorInmobiliariaId(inmobiliariaId: number): Promise<number> {
    return this.repositorioPropiedades.count({
      where: [
        { agency: { id: inmobiliariaId }, status: PropertyStatus.PUBLISHED },
        { agency: { id: inmobiliariaId }, status: PropertyStatus.RESERVED },
      ],
    });
  }
}

export const repositorioInmobiliaria = new RepositorioInmobiliaria();