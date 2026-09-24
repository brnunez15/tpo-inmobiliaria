import { Propiedad } from "./propiedad";
export declare class Comentario {
    id: number;
    authorName: string;
    content: string;
    response: string | null;
    property: Propiedad;
    createdAt: Date;
}
