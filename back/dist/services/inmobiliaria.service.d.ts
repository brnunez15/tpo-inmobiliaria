import { Propiedad } from "../entities/propiedad";
export declare class ErrorInmobiliariaNoEncontrada extends Error {
}
export declare class ErrorSinPermiso extends Error {
}
export declare class ErrorInmobiliariaConPropiedadesActivas extends Error {
}
export { ErrorInmobiliariaNoEncontrada as AgencyNotFoundError, ErrorSinPermiso as AgencyForbiddenError, ErrorInmobiliariaConPropiedadesActivas as AgencyHasActivePropertiesError, };
interface DatosActualizarInmobiliaria {
    name?: string;
    description?: string;
    logoUrl?: string | null;
    contactPhone?: string;
    contactEmail?: string;
    officeAddress?: string | null;
}
declare class ServicioInmobiliaria {
    obtenerPerfil(id: number): Promise<{
        id: number;
        nombre: string;
        descripcion: string;
        logo: string | null;
        telefonoContacto: string;
        emailContacto: string;
        direccionOficina: string | null;
        creadaEn: Date;
    }>;
    actualizar(id: number, vendedorId: number, datos: DatosActualizarInmobiliaria): Promise<{
        id: number;
        nombre: string;
        descripcion: string;
        logo: string | null;
        telefonoContacto: string;
        emailContacto: string;
        direccionOficina: string | null;
        creadaEn: Date;
    }>;
    eliminar(id: number, vendedorId: number): Promise<void>;
    obtenerPropiedades(id: number): Promise<Propiedad[]>;
    getPublicProfile(id: number): Promise<{
        id: number;
        nombre: string;
        descripcion: string;
        logo: string | null;
        telefonoContacto: string;
        emailContacto: string;
        direccionOficina: string | null;
        creadaEn: Date;
    }>;
    update(id: number, vendedorId: number, datos: DatosActualizarInmobiliaria): Promise<{
        id: number;
        nombre: string;
        descripcion: string;
        logo: string | null;
        telefonoContacto: string;
        emailContacto: string;
        direccionOficina: string | null;
        creadaEn: Date;
    }>;
    delete(id: number, vendedorId: number): Promise<void>;
    getProperties(id: number): Promise<Propiedad[]>;
    private aPerfilPublico;
}
export declare const servicioInmobiliaria: ServicioInmobiliaria;
export declare const agencyService: ServicioInmobiliaria;
