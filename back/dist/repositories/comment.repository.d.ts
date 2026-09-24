import { Comentario } from "../entities/historial-comentarios";
declare class RepositorioComentario {
    private get repositorio();
    buscarPorId(id: number): Promise<Comentario | null>;
    buscarPorPropiedadId(propiedadId: number): Promise<Comentario[]>;
    crear(datos: {
        nombreAutor: string;
        contenido: string;
        propiedadId: number;
    }): Promise<Comentario>;
    guardarRespuesta(comentario: Comentario, respuesta: string): Promise<Comentario>;
}
export declare const repositorioComentario: RepositorioComentario;
export {};
