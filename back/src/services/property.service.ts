import { repositorioPropiedad } from "../repositories/property.repository";
import { repositorioGaleriaImagen } from "../repositories/galeria-imagen.repository";
import { repositorioSolicitudVisita } from "../repositories/visit-request.repository";
import { Propiedad } from "../entities/propiedad";
import { GaleriaImagen } from "../entities/galeria-imagenes";
import { PropertyType, OperationType, PropertyStatus } from "../entities/enums";

interface DatosCrearPropiedad {
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

interface FiltrosPropiedades {
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
}

type PropiedadConGaleria = Propiedad & { imagenes: GaleriaImagen[] };

class ServicioPropiedad {
  async obtenerPorId(id: number): Promise<PropiedadConGaleria | null> {
    const propiedad = await repositorioPropiedad.buscarPorId(id);
    if (!propiedad) return null;

    const imagenes = await repositorioGaleriaImagen.buscarPorPropiedadId(id);
    return { ...propiedad, imagenes };
  }

  crear(datos: DatosCrearPropiedad): Promise<Propiedad> {
    if (Number(datos.price) <= 0) {
      throw new Error("El precio debe ser mayor a 0");
    }
    if (Number(datos.totalAreaM2) <= 0) {
      throw new Error("La superficie total debe ser mayor a 0");
    }

    return repositorioPropiedad.crear({
      ...datos,
      type: datos.type as PropertyType,
      operation: datos.operation as OperationType,
      coveredAreaM2: datos.coveredAreaM2 ?? null,
      rooms: datos.rooms ?? null,
      bedrooms: datos.bedrooms ?? null,
      bathrooms: datos.bathrooms ?? null,
      ageYears: datos.ageYears ?? null,
      tags: datos.tags ?? [],
      status: datos.status ?? PropertyStatus.DRAFT,
    });
  }

  async actualizar(id: number, datos: Partial<DatosCrearPropiedad>): Promise<Propiedad> {
    const propiedad = await repositorioPropiedad.buscarPorId(id);
    if (!propiedad) throw new Error("Propiedad no encontrada");

    if (
      propiedad.status === PropertyStatus.SOLD ||
      propiedad.status === PropertyStatus.RENTED ||
      propiedad.status === PropertyStatus.CANCELLED
    ) {
      throw new Error("No se puede editar una propiedad Vendida, Alquilada o Cancelada");
    }

    const tieneVisitaConfirmada = await repositorioSolicitudVisita.tieneConfirmadaPendiente(id);
    if (tieneVisitaConfirmada) {
      throw new Error("No se puede editar una propiedad con una visita Confirmada pendiente");
    }

    if (datos.price !== undefined && Number(datos.price) <= 0) {
      throw new Error("El precio debe ser mayor a 0");
    }
    if (datos.totalAreaM2 !== undefined && Number(datos.totalAreaM2) <= 0) {
      throw new Error("La superficie total debe ser mayor a 0");
    }

    return repositorioPropiedad.actualizar(id, datos);
  }

  buscarTodos(
    filtros: FiltrosPropiedades,
    paginacion: { pagina: number; limite: number }
  ): Promise<{ datos: Propiedad[]; total: number }> {
    return repositorioPropiedad.buscarTodos(filtros, paginacion);
  }
}

export const servicioPropiedad = new ServicioPropiedad();