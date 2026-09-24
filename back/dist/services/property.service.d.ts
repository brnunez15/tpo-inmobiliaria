import { Propiedad } from "../entities/propiedad";
import { GaleriaImagen } from "../entities/galeria-imagenes";
import { PropertyStatus } from "../entities/enums";
interface DatosCrearPropiedad {
    title: string;
    description: string;
    type: "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL";
    operation: "SALE" | "RENT";
    price: string;
    currency: "ARS" | "USD";
    address: string;
    area: string;
    totalAreaM2: string;
    coveredAreaM2?: string | null;
    rooms?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    ageYears?: number | null;
    tags?: string[];
    status?: PropertyStatus;
    agency: {
        id: number;
    };
}
interface FiltrosPropiedades {
    type?: string;
    operation?: string;
    minPrice?: string;
    maxPrice?: string;
    area?: string;
    rooms?: string;
    tags?: string;
    search?: string;
    sortBy?: string;
    order?: string;
}
type PropiedadConGaleria = Propiedad & {
    imagenes: GaleriaImagen[];
};
declare class ServicioPropiedad {
    obtenerPorId(id: number): Promise<PropiedadConGaleria | null>;
    crear(datos: DatosCrearPropiedad): Promise<Propiedad>;
    actualizar(id: number, datos: Partial<DatosCrearPropiedad>): Promise<Propiedad>;
    buscarTodos(filtros: FiltrosPropiedades, paginacion: {
        pagina: number;
        limite: number;
    }): Promise<{
        datos: Propiedad[];
        total: number;
    }>;
    getById(id: number): Promise<PropiedadConGaleria | null>;
    create(datos: DatosCrearPropiedad): Promise<Propiedad>;
    update(id: number, datos: Partial<DatosCrearPropiedad>): Promise<Propiedad>;
    findAll(filtros: FiltrosPropiedades, paginacion: {
        page: number;
        limit: number;
    }): Promise<{
        data: Propiedad[];
        total: number;
    }>;
}
export declare const servicioPropiedad: ServicioPropiedad;
export declare const propertyService: ServicioPropiedad;
export {};
