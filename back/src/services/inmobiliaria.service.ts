import { agencyRepository } from "../repositories/inmobiliaria.repositorio";
import { Inmobiliaria } from "../entities/inmobiliaria";
import { Propiedad } from "../entities/propiedad";

export class AgencyNotFoundError extends Error {}
export class AgencyForbiddenError extends Error {}
export class AgencyHasActivePropertiesError extends Error {}

/** Campos editables de una inmobiliaria. */
interface UpdateAgencyData {
  name?: string;
  description?: string;
  logoUrl?: string | null;
  contactPhone?: string;
  contactEmail?: string;
  officeAddress?: string | null;
}

class AgencyService {
  async getPublicProfile(id: number) {
    const agency = await agencyRepository.findById(id);
    if (!agency) throw new AgencyNotFoundError();

    // Devolvemos sólo lo público, omitiendo cualquier referencia al vendedor
    return this.toPublicDto(agency);
  }

  async update(id: number, sellerId: number, data: UpdateAgencyData) {
    const agency = await agencyRepository.findById(id);
    if (!agency) throw new AgencyNotFoundError();
    if (agency.seller.id !== sellerId) throw new AgencyForbiddenError();

    // Aplicar sólo los campos recibidos
    Object.assign(agency, data);
    const saved = await agencyRepository.save(agency);
    return this.toPublicDto(saved);
  }

  async delete(id: number, sellerId: number): Promise<void> {
    const agency = await agencyRepository.findById(id);
    if (!agency) throw new AgencyNotFoundError();
    if (agency.seller.id !== sellerId) throw new AgencyForbiddenError();

    const activeCount = await agencyRepository.countActiveByAgencyId(id);
    if (activeCount > 0) throw new AgencyHasActivePropertiesError();

    await agencyRepository.delete(agency);
  }

  async getProperties(id: number): Promise<Propiedad[]> {
    const agency = await agencyRepository.findById(id);
    if (!agency) throw new AgencyNotFoundError();

    return agencyRepository.findPublishedByAgencyId(id);
  }

  private toPublicDto(agency: Inmobiliaria) {
    return {
      id: agency.id,
      name: agency.name,
      description: agency.description,
      logo: agency.logoUrl,
      contactPhone: agency.contactPhone,
      contactEmail: agency.contactEmail,
      officeAddress: agency.officeAddress,
      createdAt: agency.createdAt,
    };
  }
}

export const agencyService = new AgencyService();