import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Inmobiliaria } from "../entities/inmobiliaria";
import { Propiedad } from "../entities/propiedad";
import { PropertyStatus } from "../entities/enums";

class AgencyRepository {
  private get repository(): Repository<Inmobiliaria> {
    return AppDataSource.getRepository(Inmobiliaria);
  }

  private get propertyRepo(): Repository<Propiedad> {
    return AppDataSource.getRepository(Propiedad);
  }

  findByName(name: string): Promise<Inmobiliaria | null> {
    return this.repository.findOneBy({ name });
  }

  findBySellerId(sellerId: number): Promise<Inmobiliaria | null> {
    return this.repository.findOne({ where: { seller: { id: sellerId } } });
  }

  findById(id: number): Promise<Inmobiliaria | null> {
    return this.repository.findOne({ where: { id }, relations: { seller: true } });
  }

  save(agency: Inmobiliaria): Promise<Inmobiliaria> {
    return this.repository.save(agency);
  }

  delete(agency: Inmobiliaria): Promise<void> {
    return this.repository.remove(agency).then(() => undefined);
  }

  /** Propiedades publicadas de la inmobiliaria (para el perfil público). */
  findPublishedByAgencyId(agencyId: number): Promise<Propiedad[]> {
    return this.propertyRepo.find({
      where: { agency: { id: agencyId }, status: PropertyStatus.PUBLISHED },
    });
  }

  /** Cuenta propiedades con estado Publicada o Reservada (para validar el DELETE). */
  countActiveByAgencyId(agencyId: number): Promise<number> {
    return this.propertyRepo.count({
      where: [
        { agency: { id: agencyId }, status: PropertyStatus.PUBLISHED },
        { agency: { id: agencyId }, status: PropertyStatus.RESERVED },
      ],
    });
  }
}

export const agencyRepository = new AgencyRepository();