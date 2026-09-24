import { Vendedor } from "./vendedor";
export declare class Inmobiliaria {
    id: number;
    name: string;
    description: string;
    logoUrl: string | null;
    contactPhone: string;
    contactEmail: string;
    officeAddress: string | null;
    seller: Vendedor;
    createdAt: Date;
}
