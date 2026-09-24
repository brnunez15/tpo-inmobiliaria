import { Vendedor } from "../entities/vendedor";
declare class RepositorioVendedor {
    private get repositorio();
    buscarPorEmail(email: string): Promise<Vendedor | null>;
    crear(datos: {
        email: string;
        passwordHash: string;
        fullName: string;
    }): Promise<Vendedor>;
}
export declare const repositorioVendedor: RepositorioVendedor;
export {};
