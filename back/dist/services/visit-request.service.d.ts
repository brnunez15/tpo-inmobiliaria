import { VisitRequestStatus } from "../entities/enums";
export declare class ErrorVisitaNoEncontrada extends Error {
}
export declare class ErrorSinPermiso extends Error {
}
export declare class ErrorTransicionVisitaInvalida extends Error {
}
export declare class ErrorPropiedadNoEncontrada extends Error {
}
export declare class ErrorInmobiliariaNoEncontrada extends Error {
}
export { ErrorVisitaNoEncontrada as VisitRequestNotFoundError, ErrorSinPermiso as VisitRequestForbiddenError, ErrorTransicionVisitaInvalida as VisitRequestInvalidTransitionError, ErrorPropiedadNoEncontrada as PropertyNotFoundError, ErrorInmobiliariaNoEncontrada as AgencyNotFoundError, };
declare class ServicioSolicitudVisita {
    crear(propiedadId: number, datos: {
        nombreSolicitante: string;
        telefonoSolicitante: string;
        fechaPropuesta: Date;
        mensaje?: string | null;
    }): Promise<import("../entities/visitas").SolicitudVisita>;
    cambiarEstado(visitaId: number, vendedorId: number, nuevoEstado: VisitRequestStatus): Promise<import("../entities/visitas").SolicitudVisita>;
    listarPorInmobiliaria(inmobiliariaId: number, vendedorId: number): Promise<import("../entities/visitas").SolicitudVisita[]>;
    create(propiedadId: number, datos: {
        requesterName: string;
        requesterPhone: string;
        proposedDate: Date;
        message?: string | null;
    }): Promise<import("../entities/visitas").SolicitudVisita>;
    changeStatus(visitaId: number, vendedorId: number, nuevoEstado: VisitRequestStatus): Promise<import("../entities/visitas").SolicitudVisita>;
    listByAgency(inmobiliariaId: number, vendedorId: number): Promise<import("../entities/visitas").SolicitudVisita[]>;
}
export declare const servicioSolicitudVisita: ServicioSolicitudVisita;
export declare const visitRequestService: ServicioSolicitudVisita;
