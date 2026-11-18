import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Propiedad } from "../entities/propiedad";
import { PropertyStatus } from "../entities/enums";

class RepositorioPropiedad {
  private get repositorio(): Repository<Propiedad> {
    return AppDataSource.getRepository(Propiedad);
  }

  buscarPorId(id: number): Promise<Propiedad | null> {
    return this.repositorio.findOne({
      where: { id },
      relations: { agency: { seller: true } },
    });
  }

  /** Todas las propiedades de una inmobiliaria, en cualquier estado ("Mis propiedades"). */
  buscarPorInmobiliariaId(inmobiliariaId: number): Promise<Propiedad[]> {
    return this.repositorio.find({
      where: { agency: { id: inmobiliariaId } },
      order: { updatedAt: "DESC" },
    });
  }

  crear(
    datos: Omit<Propiedad, "id" | "createdAt" | "updatedAt" | "agency"> & { agency: { id: number } }
  ): Promise<Propiedad> {
    const propiedad = this.repositorio.create(datos);
    return this.repositorio.save(propiedad);
  }

  async actualizar(id: number, datos: Record<string, unknown>): Promise<Propiedad> {
    await this.repositorio.update(id, datos as object);
    return this.repositorio.findOneByOrFail({ id });
  }

  async buscarTodos(
    filtros: {
      type?: string;
      operation?: string;
      minPrice?: string;
      maxPrice?: string;
      area?: string;
      rooms?: string;
      tags?: string;
      search?: string;
      sortBy?: string;
      order?: string;
      currency?: string;
    },
    paginacion: { pagina: number; limite: number }
  ): Promise<{ datos: Propiedad[]; total: number }> {
    // El listado es público (pantalla home del Interesado):
    // solo se muestran las propiedades Publicadas, nunca Borradores, Pausadas,
    // Canceladas, etc. Es el primer "where"; los filtros se suman con andWhere.
    let consulta = this.repositorio
      .createQueryBuilder("propiedad")
      .where("propiedad.status = :estado", { estado: PropertyStatus.PUBLISHED });

    if (filtros.type) {
      consulta = consulta.andWhere("propiedad.type = :tipo", { tipo: filtros.type });
    }
    if (filtros.operation) {
      consulta = consulta.andWhere("propiedad.operation = :operacion", { operacion: filtros.operation });
    }
    if (filtros.minPrice) {
      consulta = consulta.andWhere("propiedad.price >= :precioMin", { precioMin: filtros.minPrice });
    }
    if (filtros.maxPrice) {
      consulta = consulta.andWhere("propiedad.price <= :precioMax", { precioMax: filtros.maxPrice });
    }
    if (filtros.area) {
      consulta = consulta.andWhere("propiedad.area ILIKE :zona", { zona: `%${filtros.area}%` });
    }
    if (filtros.rooms) {
      consulta = consulta.andWhere("propiedad.rooms = :ambientes", { ambientes: filtros.rooms });
    }
    if (filtros.tags) {
      // amenities=pileta,cochera → la propiedad tiene que tener TODAS
      const listaTags = filtros.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "");
      // El nombre del parámetro usa la posición (tag0, tag1, ...) y no el
      // texto del tag: así un tag con espacios o guiones no rompe la consulta.
      listaTags.forEach((tag, indice) => {
        consulta = consulta.andWhere(`propiedad.tags ILIKE :tag${indice}`, {
          [`tag${indice}`]: `%${tag}%`,
        });
      });
    }
    if (filtros.currency) {
      // Moneda: sin este filtro, precioMin/precioMax mezclaban pesos con dólares
      consulta = consulta.andWhere("propiedad.currency = :moneda", { moneda: filtros.currency });
    }
    if (filtros.search) {
      consulta = consulta.andWhere(
        "(propiedad.title ILIKE :busqueda OR propiedad.description ILIKE :busqueda)",
        { busqueda: `%${filtros.search}%` }
      );
    }

    const camposOrdenables: Record<string, string> = {
      price: "propiedad.price",
      createdAt: "propiedad.createdAt",
      totalAreaM2: "propiedad.totalAreaM2",
    };

    const campoOrden = camposOrdenables[filtros.sortBy ?? "createdAt"] ?? "propiedad.createdAt";
    const direccionOrden = filtros.order === "asc" ? "ASC" : "DESC";

    consulta = consulta.orderBy(campoOrden, direccionOrden);

    const total = await consulta.getCount();
    const datos = await consulta
      .skip((paginacion.pagina - 1) * paginacion.limite)
      .take(paginacion.limite)
      .getMany();

    return { datos, total };
  }
}

export const repositorioPropiedad = new RepositorioPropiedad();