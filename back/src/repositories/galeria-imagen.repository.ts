import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { GaleriaImagen } from "../entities/galeria-imagenes";

class GaleriaImagenRepository {
  private get repository(): Repository<GaleriaImagen> {
    return AppDataSource.getRepository(GaleriaImagen);
  }

  findByPropertyId(propertyId: number): Promise<GaleriaImagen[]> {
    return this.repository.find({
      where: { property: { id: propertyId } },
      order: { position: "ASC" },
    });
  }
}

export const galeriaImagenRepository = new GaleriaImagenRepository();