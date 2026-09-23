import { propertyRepository } from "../repositories/property.repository";
import { Propiedad } from "../entities/propiedad";
import { PropertyType, OperationType, PropertyStatus } from "../entities/enums";

interface CreatePropertyData {
  title: string;
  description: string;
  type: "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL";
  operation: "SALE" | "RENT";
  price: string;
  currency: "ARS" | "USD";
  address: string;
  area: string;
  totalAreaM2: string;
  coveredAreaM2?: string | null;
  rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  ageYears?: number | null;
  tags?: string[];
  status?: PropertyStatus;
  agency: { id: number };
}

class PropertyService {
  getById(id: number): Promise<Propiedad | null> {
    return propertyRepository.findById(id);
  }

  create(data: CreatePropertyData): Promise<Propiedad> {
    if (Number(data.price) <= 0) {
      throw new Error("El precio debe ser mayor a 0");
    }

    if (Number(data.totalAreaM2) <= 0) {
      throw new Error("La superficie total debe ser mayor a 0");
    }

  return propertyRepository.create({
    ...data,
    type: data.type as PropertyType,
    operation: data.operation as OperationType,
    coveredAreaM2: data.coveredAreaM2 ?? null,
    rooms: data.rooms ?? null,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    ageYears: data.ageYears ?? null,
    tags: data.tags ?? [],
    status: data.status ?? PropertyStatus.DRAFT,
  });
  }
}

export const propertyService = new PropertyService();