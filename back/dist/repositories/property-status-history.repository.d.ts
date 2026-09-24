import { HistorialEstadoPropiedad } from "../entities/historial-estado-propiedad";
import { PropertyStatus } from "../entities/enums";
declare class RepositorioHistorialEstado {
    private get repositorio();
    crear(datos: {
        propiedadId: number;
        estadoAnterior: PropertyStatus;
        estadoNuevo: PropertyStatus;
    }): Promise<HistorialEstadoPropiedad>;
    buscarPorPropiedadId(propiedadId: number): Promise<HistorialEstadoPropiedad[]>;
    /** Fecha en que una propiedad pasó a un estado específico por primera vez. */
    buscarPrimeraTransicionA(propiedadId: number, estadoDestino: PropertyStatus): Promise<HistorialEstadoPropiedad | null>;
}
export declare const repositorioHistorialEstado: RepositorioHistorialEstado;
export declare const propertyStatusHistoryRepository: RepositorioHistorialEstado;
export {};
