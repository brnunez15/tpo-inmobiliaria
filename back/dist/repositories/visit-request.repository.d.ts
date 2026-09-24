import { SolicitudVisita } from "../entities/visitas";
import { VisitRequestStatus } from "../entities/enums";
declare class RepositorioSolicitudVisita {
    private get repositorio();
    buscarPorId(id: number): Promise<SolicitudVisita | null>;
    buscarPorInmobiliariaId(inmobiliariaId: number): Promise<SolicitudVisita[]>;
    /** Verifica si hay alguna visita Confirmada aún no realizada sobre una propiedad. */
    tieneConfirmadaPendiente(propiedadId: number): Promise<boolean>;
    crear(datos: {
        nombreSolicitante: string;
        telefonoSolicitante: string;
        fechaPropuesta: Date;
        mensaje?: string | null;
        propiedadId: number;
    }): Promise<SolicitudVisita>;
    actualizarEstado(visita: SolicitudVisita, nuevoEstado: VisitRequestStatus): Promise<SolicitudVisita>;
}
export declare const repositorioSolicitudVisita: RepositorioSolicitudVisita;
export {};
