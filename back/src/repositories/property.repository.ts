import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Propiedad } from "../entities/propiedad";

class PropertyRepository {
  private get repository(): Repository<Propiedad> {
    return AppDataSource.getRepository(Propiedad);
  }

  findById(id: number): Promise<Propiedad | null> {
    return this.repository.findOneBy({ id });
  }
}

export const propertyRepository = new PropertyRepository();
