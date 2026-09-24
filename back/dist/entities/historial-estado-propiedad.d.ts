import { Propiedad } from "./propiedad";
import { PropertyStatus } from "./enums";
export declare class HistorialEstadoPropiedad {
    id: number;
    fromStatus: PropertyStatus;
    toStatus: PropertyStatus;
    property: Propiedad;
    createdAt: Date;
}
