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

  create(
  data: Omit<Propiedad, "id" | "createdAt" | "updatedAt" | "agency">
): Promise<Propiedad> {
  const propiedad = this.repository.create(data);
  return this.repository.save(propiedad);
}
}

export const propertyRepository = new PropertyRepository();
