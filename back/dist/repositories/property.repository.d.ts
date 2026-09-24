import { Propiedad } from "../entities/propiedad";
declare class RepositorioPropiedad {
    private get repositorio();
    buscarPorId(id: number): Promise<Propiedad | null>;
    crear(datos: Omit<Propiedad, "id" | "createdAt" | "updatedAt" | "agency">): Promise<Propiedad>;
    actualizar(id: number, datos: Record<string, unknown>): Promise<Propiedad>;
    buscarTodos(filtros: {
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
    }, paginacion: {
        pagina: number;
        limite: number;
    }): Promise<{
        datos: Propiedad[];
        total: number;
    }>;
}
export declare const repositorioPropiedad: RepositorioPropiedad;
export {};
