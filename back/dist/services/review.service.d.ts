export declare class ErrorInmobiliariaNoEncontrada extends Error {
}
export { ErrorInmobiliariaNoEncontrada as AgencyNotFoundError };
declare class ServicioReseña {
    crear(inmobiliariaId: number, datos: {
        nombreAutor: string;
        contenido: string;
        calificacion: number;
    }): Promise<import("../entities/historial-rese\u00F1as").Reseña>;
    listarPorInmobiliaria(inmobiliariaId: number): Promise<import("../entities/historial-rese\u00F1as").Reseña[]>;
    create(inmobiliariaId: number, datos: {
        authorName: string;
        content: string;
        rating: number;
    }): Promise<import("../entities/historial-rese\u00F1as").Reseña>;
    listByAgency(inmobiliariaId: number): Promise<import("../entities/historial-rese\u00F1as").Reseña[]>;
}
export declare const servicioReseña: ServicioReseña;
export declare const reviewService: ServicioReseña;
