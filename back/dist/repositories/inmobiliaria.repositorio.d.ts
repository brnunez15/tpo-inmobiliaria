import { Inmobiliaria } from "../entities/inmobiliaria";
import { Propiedad } from "../entities/propiedad";
declare class RepositorioInmobiliaria {
    private get repositorio();
    private get repositorioPropiedades();
    buscarPorNombre(nombre: string): Promise<Inmobiliaria | null>;
    buscarPorVendedorId(vendedorId: number): Promise<Inmobiliaria | null>;
    buscarPorId(id: number): Promise<Inmobiliaria | null>;
    guardar(inmobiliaria: Inmobiliaria): Promise<Inmobiliaria>;
    eliminar(inmobiliaria: Inmobiliaria): Promise<void>;
    /** Propiedades publicadas de la inmobiliaria (para el perfil público). */
    buscarPublicadasPorInmobiliariaId(inmobiliariaId: number): Promise<Propiedad[]>;
    /** Cuenta propiedades con estado Publicada o Reservada (para validar el DELETE). */
    contarActivasPorInmobiliariaId(inmobiliariaId: number): Promise<number>;
    findById(id: number): Promise<Inmobiliaria | null>;
}
export declare const repositorioInmobiliaria: RepositorioInmobiliaria;
export declare const agencyRepository: RepositorioInmobiliaria;
export {};
