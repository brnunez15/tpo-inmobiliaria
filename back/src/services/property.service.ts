import { propertyRepository } from "../repositories/property.repository";
import { Propiedad } from "../entities/propiedad";

class PropertyService {
  getById(id: number): Promise<Propiedad | null> {
    return propertyRepository.findById(id);
  }
}

export const propertyService = new PropertyService();
