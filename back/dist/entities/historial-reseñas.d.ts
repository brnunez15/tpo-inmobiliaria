import { Inmobiliaria } from "./inmobiliaria";
export declare class Reseña {
    id: number;
    authorName: string;
    content: string;
    rating: number;
    agency: Inmobiliaria;
    createdAt: Date;
}
