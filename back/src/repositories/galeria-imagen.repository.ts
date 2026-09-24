import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { GaleriaImagen } from "../entities/galeria-imagenes";

class RepositorioGaleriaImagen {
  private get repositorio(): Repository<GaleriaImagen> {
    return AppDataSource.getRepository(GaleriaImagen);
  }

  buscarPorPropiedadId(propiedadId: number): Promise<GaleriaImagen[]> {
    return this.repositorio.find({
      where: { property: { id: propiedadId } },
    });
  }
}

export const repositorioGaleriaImagen = new RepositorioGaleriaImagen();