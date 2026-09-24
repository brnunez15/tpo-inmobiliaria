import { Actividad } from "../entities/actividad";
declare class RepositorioActividad {
    private get repositorio();
    buscarPorId(id: number): Promise<Actividad | null>;
    buscarPorInmobiliariaId(inmobiliariaId: number): Promise<Actividad[]>;
    contarNoLeidasPorInmobiliariaId(inmobiliariaId: number): Promise<number>;
    crearPorComentario(inmobiliariaId: number, propiedadId: number, comentarioId: number): Promise<Actividad>;
    crearPorVisita(inmobiliariaId: number, propiedadId: number, visitaId: number): Promise<Actividad>;
    crearPorReseña(inmobiliariaId: number, reseñaId: number): Promise<Actividad>;
    marcarLeida(actividad: Actividad): Promise<Actividad>;
    findById(id: number): Promise<Actividad | null>;
    findByAgencyId(agencyId: number): Promise<Actividad[]>;
    countUnreadByAgencyId(agencyId: number): Promise<number>;
    markAsRead(actividad: Actividad): Promise<Actividad>;
}
export declare const repositorioActividad: RepositorioActividad;
export declare const activityRepository: RepositorioActividad;
export {};
