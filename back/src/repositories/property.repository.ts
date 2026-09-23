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

  async findAll(filters: {
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
  }): Promise<Propiedad[]> {
    let query = this.repository.createQueryBuilder("property");

    if (filters.type) {
      query = query.andWhere("property.type = :type", { type: filters.type });
    }

    if (filters.operation) {
      query = query.andWhere("property.operation = :operation", { operation: filters.operation });
    }

    if (filters.minPrice) {
      query = query.andWhere("property.price >= :minPrice", { minPrice: filters.minPrice });
    }

    if (filters.maxPrice) {
      query = query.andWhere("property.price <= :maxPrice", { maxPrice: filters.maxPrice });
    }

    if (filters.area) {
      query = query.andWhere("property.area ILIKE :area", { area: `%${filters.area}%` });
    }

    if (filters.rooms) {
      query = query.andWhere("property.rooms = :rooms", { rooms: filters.rooms });
    }

    if (filters.tags) {
      const tagList = filters.tags.split(",").map((t) => t.trim());
      for (const tag of tagList) {
        query = query.andWhere("property.tags ILIKE :tag_" + tag, { [`tag_${tag}`]: `%${tag}%` });
      }
    }

    if (filters.search) {
      query = query.andWhere(
        "(property.title ILIKE :search OR property.description ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    const sortableFields: Record<string, string> = {
      price: "property.price",
      createdAt: "property.createdAt",
      totalAreaM2: "property.totalAreaM2",
    };

    const sortField = sortableFields[filters.sortBy ?? "createdAt"] ?? "property.createdAt";
    const sortOrder = filters.order === "asc" ? "ASC" : "DESC";

    query = query.orderBy(sortField, sortOrder);

    return query.getMany();
  }
}

export const propertyRepository = new PropertyRepository();