import { Inmobiliaria } from "./inmobiliaria";
import { Comentario } from "./historial-comentarios";
import { Reseña } from "./historial-reseñas";
import { SolicitudVisita } from "./visitas";
import { Propiedad } from "./propiedad";
import { ActivityType } from "./enums";
export declare class Actividad {
    id: number;
    type: ActivityType;
    read: boolean;
    agency: Inmobiliaria;
    property: Propiedad | null;
    comment: Comentario | null;
    visitRequest: SolicitudVisita | null;
    review: Reseña | null;
    createdAt: Date;
}
