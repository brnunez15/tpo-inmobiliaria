import { ErrorNoEncontrado, ErrorProhibido, ErrorReglaNegocio } from "../errors/dominio.errors";
import { repositorioSolicitudVisita } from "../repositories/visit-request.repository";
import { repositorioPropiedad } from "../repositories/property.repository";
import { repositorioInmobiliaria } from "../repositories/inmobiliaria.repositorio";
import { repositorioActividad } from "../repositories/activity.repository";
import { VisitRequestStatus } from "../entities/enums";

export class ErrorVisitaNoEncontrada extends ErrorNoEncontrado {
  constructor(mensaje = "Solicitud de visita no encontrada") {
    super(mensaje);
  }
}
export class ErrorSinPermiso extends ErrorProhibido {
  constructor(mensaje = "No tenés permiso sobre esta solicitud de visita") {
    super(mensaje);
  }
}
export class ErrorTransicionVisitaInvalida extends ErrorReglaNegocio {
  constructor(mensaje = "Transición de visita inválida") {
    super(mensaje);
  }
}
export class ErrorPropiedadNoEncontrada extends ErrorNoEncontrado {
  constructor(mensaje = "Propiedad no encontrada") {
    super(mensaje);
  }
}
export class ErrorInmobiliariaNoEncontrada extends ErrorNoEncontrado {
  constructor(mensaje = "Inmobiliaria no encontrada") {
    super(mensaje);
  }
}

export {
  ErrorVisitaNoEncontrada as VisitRequestNotFoundError,
  ErrorSinPermiso as VisitRequestForbiddenError,
  ErrorTransicionVisitaInvalida as VisitRequestInvalidTransitionError,
  ErrorPropiedadNoEncontrada as PropertyNotFoundError,
  ErrorInmobiliariaNoEncontrada as AgencyNotFoundError,
};

const TRANSICIONES_PERMITIDAS: Record<VisitRequestStatus, VisitRequestStatus[]> = {
  [VisitRequestStatus.PENDING]:   [VisitRequestStatus.CONFIRMED, VisitRequestStatus.REJECTED, VisitRequestStatus.CANCELLED],
  [VisitRequestStatus.CONFIRMED]: [VisitRequestStatus.COMPLETED, VisitRequestStatus.CANCELLED, VisitRequestStatus.REJECTED],
  [VisitRequestStatus.COMPLETED]: [],
  [VisitRequestStatus.CANCELLED]: [],
  [VisitRequestStatus.REJECTED]:  [],
};

class ServicioSolicitudVisita {
  async crear(
    propiedadId: number,
    datos: {
      nombreSolicitante: string;
      telefonoSolicitante: string;
      fechaPropuesta: Date;
      mensaje?: string | null;
    }
  ) {
    if (datos.fechaPropuesta <= new Date()) {
      throw new ErrorReglaNegocio("La fecha propuesta debe ser en el futuro");
    }

    const propiedad = await repositorioPropiedad.buscarPorId(propiedadId);
    if (!propiedad) throw new ErrorPropiedadNoEncontrada();

    const visita = await repositorioSolicitudVisita.crear({ ...datos, propiedadId });

    await repositorioActividad.crearPorVisita(
      propiedad.agency.id,
      propiedadId,
      visita.id
    );

    return visita;
  }

  async cambiarEstado(visitaId: number, vendedorId: number, nuevoEstado: VisitRequestStatus) {
    const visita = await repositorioSolicitudVisita.buscarPorId(visitaId);
    if (!visita) throw new ErrorVisitaNoEncontrada();
    if (visita.property.agency.seller.id !== vendedorId) throw new ErrorSinPermiso();

    const permitidos = TRANSICIONES_PERMITIDAS[visita.status];
    if (!permitidos.includes(nuevoEstado)) {
      throw new ErrorTransicionVisitaInvalida(
        `Transición inválida: ${visita.status} → ${nuevoEstado}`
      );
    }

    const guardada = await repositorioSolicitudVisita.actualizarEstado(visita, nuevoEstado);
    // Se devuelve sin la propiedad: venía cargada con el vendedor (y su passwordHash)
    const { property, ...datos } = guardada;
    return { ...datos, propertyId: property.id };
  }

  async listarPorInmobiliaria(inmobiliariaId: number, vendedorId: number) {
    const inmobiliaria = await repositorioInmobiliaria.buscarPorId(inmobiliariaId);
    if (!inmobiliaria) throw new ErrorInmobiliariaNoEncontrada();
    if (inmobiliaria.seller.id !== vendedorId) throw new ErrorSinPermiso();

    return repositorioSolicitudVisita.buscarPorInmobiliariaId(inmobiliariaId);
  }

  create(
    propiedadId: number,
    datos: {
      requesterName: string;
      requesterPhone: string;
      proposedDate: Date;
      message?: string | null;
    }
  ) {
    return this.crear(propiedadId, {
      nombreSolicitante: datos.requesterName,
      telefonoSolicitante: datos.requesterPhone,
      fechaPropuesta: datos.proposedDate,
      mensaje: datos.message,
    });
  }

  changeStatus(visitaId: number, vendedorId: number, nuevoEstado: VisitRequestStatus) {
    return this.cambiarEstado(visitaId, vendedorId, nuevoEstado);
  }

  listByAgency(inmobiliariaId: number, vendedorId: number) {
    return this.listarPorInmobiliaria(inmobiliariaId, vendedorId);
  }
}

export const servicioSolicitudVisita = new ServicioSolicitudVisita();
export const visitRequestService = servicioSolicitudVisita;
