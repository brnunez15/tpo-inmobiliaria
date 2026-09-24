import { Reseña } from "../entities/historial-reseñas";
declare class RepositorioReseña {
    private get repositorio();
    buscarPorInmobiliariaId(inmobiliariaId: number): Promise<Reseña[]>;
    crear(datos: {
        nombreAutor: string;
        contenido: string;
        calificacion: number;
        inmobiliariaId: number;
    }): Promise<Reseña>;
}
export declare const repositorioReseña: RepositorioReseña;
export {};
