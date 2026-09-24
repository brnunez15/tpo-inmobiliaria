import { GaleriaImagen } from "../entities/galeria-imagenes";
declare class RepositorioGaleriaImagen {
    private get repositorio();
    buscarPorPropiedadId(propiedadId: number): Promise<GaleriaImagen[]>;
}
export declare const repositorioGaleriaImagen: RepositorioGaleriaImagen;
export {};
