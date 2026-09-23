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

  async update(id: number, data: Record<string, unknown>): Promise<Propiedad> {
    await this.repository.update(id, data as object);
    return this.repository.findOneByOrFail({ id });
  }
}

export const propertyRepository = new PropertyRepository();