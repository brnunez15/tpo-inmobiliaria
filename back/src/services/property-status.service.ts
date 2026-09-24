import { repositorioPropiedad } from "../repositories/property.repository";
import { repositorioHistorialEstado } from "../repositories/property-status-history.repository";
import { PropertyStatus } from "../entities/enums";

export class ErrorTransicionEstadoInvalida extends Error {}
export class ErrorPropiedadNoEncontrada extends Error {}
export class ErrorSinPermiso extends Error {}

export {
  ErrorTransicionEstadoInvalida as PropertyStatusInvalidTransitionError,
  ErrorPropiedadNoEncontrada as PropertyNotFoundError,
  ErrorSinPermiso as PropertyForbiddenError,
};

/**
 * Transiciones de estado permitidas.
 * Cancelada es posible desde cualquier estado activo (no terminal).
 */
const TRANSICIONES_PERMITIDAS: Record<PropertyStatus, PropertyStatus[]> = {
  [PropertyStatus.DRAFT]:     [PropertyStatus.PUBLISHED, PropertyStatus.CANCELLED],
  [PropertyStatus.PUBLISHED]: [PropertyStatus.PAUSED, PropertyStatus.RESERVED, PropertyStatus.CANCELLED],
  [PropertyStatus.PAUSED]:    [PropertyStatus.PUBLISHED, PropertyStatus.CANCELLED],
  [PropertyStatus.RESERVED]:  [PropertyStatus.PUBLISHED, PropertyStatus.SOLD, PropertyStatus.RENTED, PropertyStatus.CANCELLED],
  [PropertyStatus.SOLD]:      [],
  [PropertyStatus.RENTED]:    [],
  [PropertyStatus.CANCELLED]: [],
};

class ServicioEstadoPropiedad {
  async cambiarEstado(
    propiedadId: number,
    vendedorId: number,
    nuevoEstado: PropertyStatus
  ): Promise<{ status: PropertyStatus }> {
    const propiedad = await repositorioPropiedad.buscarPorId(propiedadId);
    if (!propiedad) throw new ErrorPropiedadNoEncontrada();
    if (propiedad.agency.seller.id !== vendedorId) throw new ErrorSinPermiso();

    const permitidos = TRANSICIONES_PERMITIDAS[propiedad.status];
    if (!permitidos.includes(nuevoEstado)) {
      throw new ErrorTransicionEstadoInvalida(
        `Transición inválida: ${propiedad.status} → ${nuevoEstado}. Permitidas: ${permitidos.join(", ") || "ninguna"}`
      );
    }

    await repositorioHistorialEstado.crear({
      propiedadId,
      estadoAnterior: propiedad.status,
      estadoNuevo: nuevoEstado,
    });

    await repositorioPropiedad.actualizar(propiedadId, { status: nuevoEstado });

    return { status: nuevoEstado };
  }

  async obtenerHistorial(propiedadId: number) {
    const propiedad = await repositorioPropiedad.buscarPorId(propiedadId);
    if (!propiedad) throw new ErrorPropiedadNoEncontrada();
    return repositorioHistorialEstado.buscarPorPropiedadId(propiedadId);
  }

  changeStatus(propiedadId: number, vendedorId: number, nuevoEstado: PropertyStatus) {
    return this.cambiarEstado(propiedadId, vendedorId, nuevoEstado);
  }

  getHistory(propiedadId: number) {
    return this.obtenerHistorial(propiedadId);
  }
}

export const servicioEstadoPropiedad = new ServicioEstadoPropiedad();
export const propertyStatusService = servicioEstadoPropiedad;

