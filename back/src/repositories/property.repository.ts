import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Propiedad } from "../entities/propiedad";

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

  crear(
    datos: Omit<Propiedad, "id" | "createdAt" | "updatedAt" | "agency">
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
    },
    paginacion: { pagina: number; limite: number }
  ): Promise<{ datos: Propiedad[]; total: number }> {
    let consulta = this.repositorio.createQueryBuilder("propiedad");

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
      const listaTags = filtros.tags.split(",").map((t) => t.trim());
      for (const tag of listaTags) {
        consulta = consulta.andWhere("propiedad.tags ILIKE :tag_" + tag, {
          [`tag_${tag}`]: `%${tag}%`,
        });
      }
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