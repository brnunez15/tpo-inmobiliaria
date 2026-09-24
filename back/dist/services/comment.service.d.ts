export declare class ErrorComentarioNoEncontrado extends Error {
}
export declare class ErrorSinPermiso extends Error {
}
export declare class ErrorPropiedadNoEncontrada extends Error {
}
export { ErrorComentarioNoEncontrado as CommentNotFoundError, ErrorSinPermiso as CommentForbiddenError, ErrorPropiedadNoEncontrada as PropertyNotFoundError, };
declare class ServicioComentario {
    crear(propiedadId: number, nombreAutor: string, contenido: string): Promise<import("../entities/historial-comentarios").Comentario>;
    responder(comentarioId: number, vendedorId: number, respuesta: string): Promise<import("../entities/historial-comentarios").Comentario>;
    listarPorPropiedad(propiedadId: number): Promise<import("../entities/historial-comentarios").Comentario[]>;
    create(propiedadId: number, authorName: string, content: string): Promise<import("../entities/historial-comentarios").Comentario>;
    reply(comentarioId: number, vendedorId: number, reply: string): Promise<import("../entities/historial-comentarios").Comentario>;
    listByProperty(propiedadId: number): Promise<import("../entities/historial-comentarios").Comentario[]>;
}
export declare const servicioComentario: ServicioComentario;
export declare const commentService: ServicioComentario;
