import { In, Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { GaleriaImagen } from "../entities/galeria-imagenes";

class RepositorioGaleriaImagen {
  private get repositorio(): Repository<GaleriaImagen> {
    return AppDataSource.getRepository(GaleriaImagen);
  }

  buscarPorPropiedadId(propiedadId: number): Promise<GaleriaImagen[]> {
    return this.repositorio.find({
      where: { property: { id: propiedadId } },
      order: { position: "ASC" },
    });
  }

  /** Una foto puntual de una propiedad (null si no existe o es de otra propiedad). */
  buscarDePropiedad(imagenId: number, propiedadId: number): Promise<GaleriaImagen | null> {
    return this.repositorio.findOne({
      where: { id: imagenId, property: { id: propiedadId } },
    });
  }

  contarPorPropiedadId(propiedadId: number): Promise<number> {
    return this.repositorio.count({ where: { property: { id: propiedadId } } });
  }

  /** Portadas de varias propiedades a la vez (para las tarjetas de los listados). */
  buscarPortadas(propiedadIds: number[]): Promise<GaleriaImagen[]> {
    if (propiedadIds.length === 0) return Promise.resolve([]);
    return this.repositorio.find({
      where: { property: { id: In(propiedadIds) }, isCover: true },
      relations: { property: true },
    });
  }

  /**
   * Deja la galería de la propiedad exactamente como la lista de URLs:
   * borra las fotos que había y guarda las nuevas en ese orden, con la primera de portada.
   * Las dos cosas o ninguna (transacción).
   */
  async reemplazar(propiedadId: number, urls: string[]): Promise<void> {
    await AppDataSource.transaction(async (manager) => {
      const existentes = await manager.find(GaleriaImagen, {
        where: { property: { id: propiedadId } },
      });
      await manager.remove(existentes);

      const nuevas = urls.map((url, posicion) =>
        manager.create(GaleriaImagen, {
          url,
          position: posicion,
          isCover: posicion === 0,
          property: { id: propiedadId },
        })
      );
      await manager.save(nuevas);
    });
  }
}

export const repositorioGaleriaImagen = new RepositorioGaleriaImagen();