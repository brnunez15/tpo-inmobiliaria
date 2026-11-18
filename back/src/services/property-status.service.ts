import { AppDataSource } from "../config/data-source";
import { ErrorNoEncontrado, ErrorProhibido, ErrorReglaNegocio } from "../errors/dominio.errors";
import { repositorioPropiedad } from "../repositories/property.repository";
import { repositorioActividad } from "../repositories/activity.repository";
import { repositorioHistorialEstado } from "../repositories/property-status-history.repository";
import { repositorioGaleriaImagen } from "../repositories/galeria-imagen.repository";
import { PropertyStatus, OperationType } from "../entities/enums";

export class ErrorTransicionEstadoInvalida extends ErrorReglaNegocio {
  constructor(mensaje = "Transición de estado inválida") {
    super(mensaje);
  }
}
export class ErrorPropiedadNoEncontrada extends ErrorNoEncontrado {
  constructor(mensaje = "Propiedad no encontrada") {
    super(mensaje);
  }
}
export class ErrorSinPermiso extends ErrorProhibido {
  constructor(mensaje = "No tenés permiso sobre esta propiedad") {
    super(mensaje);
  }
}

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

    // Regla del enunciado: "Galería de fotos (mínimo una)". No se publica sin fotos.
    if (nuevoEstado === PropertyStatus.PUBLISHED) {
      const cantidadFotos = await repositorioGaleriaImagen.contarPorPropiedadId(propiedadId);
      if (cantidadFotos === 0) {
        throw new ErrorReglaNegocio("Para publicar, la propiedad tiene que tener al menos una foto");
      }
    }

    // Vendida solo para Venta y Alquilada solo para Alquiler
    if (nuevoEstado === PropertyStatus.SOLD && propiedad.operation !== OperationType.SALE) {
      throw new ErrorTransicionEstadoInvalida("Una propiedad en Alquiler no puede pasar a Vendida");
    }
    if (nuevoEstado === PropertyStatus.RENTED && propiedad.operation !== OperationType.RENT) {
      throw new ErrorTransicionEstadoInvalida("Una propiedad en Venta no puede pasar a Alquilada");
    }

    // Historial + cambio de estado + novedad para el feed: o se guardan los tres o ninguno
    await AppDataSource.transaction(async (manager) => {
      await repositorioHistorialEstado.crear(
        { propiedadId, estadoAnterior: propiedad.status, estadoNuevo: nuevoEstado },
        manager
      );
      await repositorioPropiedad.actualizar(propiedadId, { status: nuevoEstado }, manager);
      await repositorioActividad.crearPorCambioEstado(propiedad.agency.id, propiedadId, manager);
    });

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