import { Propiedad } from "./propiedad";
import { VisitRequestStatus } from "./enums";
export declare class SolicitudVisita {
    id: number;
    requesterName: string;
    requesterPhone: string;
    proposedDate: Date;
    message: string | null;
    status: VisitRequestStatus;
    property: Propiedad;
    createdAt: Date;
}
