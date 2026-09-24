import { PropertyStatus } from "../entities/enums";
export declare class ErrorTransicionEstadoInvalida extends Error {
}
export declare class ErrorPropiedadNoEncontrada extends Error {
}
export declare class ErrorSinPermiso extends Error {
}
export { ErrorTransicionEstadoInvalida as PropertyStatusInvalidTransitionError, ErrorPropiedadNoEncontrada as PropertyNotFoundError, ErrorSinPermiso as PropertyForbiddenError, };
declare class ServicioEstadoPropiedad {
    cambiarEstado(propiedadId: number, vendedorId: number, nuevoEstado: PropertyStatus): Promise<{
        status: PropertyStatus;
    }>;
    obtenerHistorial(propiedadId: number): Promise<import("../entities/historial-estado-propiedad").HistorialEstadoPropiedad[]>;
    changeStatus(propiedadId: number, vendedorId: number, nuevoEstado: PropertyStatus): Promise<{
        status: PropertyStatus;
    }>;
    getHistory(propiedadId: number): Promise<import("../entities/historial-estado-propiedad").HistorialEstadoPropiedad[]>;
}
export declare const servicioEstadoPropiedad: ServicioEstadoPropiedad;
export declare const propertyStatusService: ServicioEstadoPropiedad;
