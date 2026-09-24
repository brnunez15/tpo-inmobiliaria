import { Inmobiliaria } from "./inmobiliaria";
import { OperationType, PropertyStatus, PropertyType } from "./enums";
export declare class Propiedad {
    id: number;
    title: string;
    description: string;
    type: PropertyType;
    operation: OperationType;
    price: string;
    currency: "ARS" | "USD";
    address: string;
    area: string;
    coveredAreaM2: string | null;
    totalAreaM2: string;
    rooms: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    ageYears: number | null;
    tags: string[];
    status: PropertyStatus;
    agency: Inmobiliaria;
    createdAt: Date;
    updatedAt: Date;
}
