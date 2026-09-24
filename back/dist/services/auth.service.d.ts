export declare class ErrorEmailDuplicado extends Error {
}
export declare class ErrorNombreInmobiliariaDuplicado extends Error {
}
export declare class ErrorCredencialesInvalidas extends Error {
}
export { ErrorEmailDuplicado as EmailAlreadyExistsError, ErrorNombreInmobiliariaDuplicado as AgencyNameAlreadyExistsError, ErrorCredencialesInvalidas as InvalidCredentialsError, };
interface DatosRegistro {
    email: string;
    password: string;
    fullName: string;
    nombreInmobiliaria: string;
    descripcion: string;
    telefonoContacto: string;
    emailContacto: string;
    direccionOficina?: string | null;
    logoUrl?: string | null;
}
declare class ServicioAuth {
    registrar(datos: DatosRegistro): Promise<{
        token: string;
    }>;
    iniciarSesion(email: string, password: string): Promise<{
        token: string;
    }>;
    register(datos: {
        email: string;
        password: string;
        fullName: string;
        agencyName: string;
        contactPhone: string;
        contactEmail: string;
        description: string;
        officeAddress?: string | null;
        logoUrl?: string | null;
    }): Promise<{
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        token: string;
    }>;
}
export declare const servicioAuth: ServicioAuth;
export declare const authService: ServicioAuth;
