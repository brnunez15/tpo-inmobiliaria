export declare class AgencyNotFoundError extends Error {
}
export declare class ReportForbiddenError extends Error {
}
declare class ReportService {
    /** Cantidad de propiedades por estado actual. */
    statusSummary(agencyId: number, sellerId: number): Promise<{
        status: string;
        count: number;
    }[]>;
    /** Publicaciones nuevas y ventas/alquileres concretados por mes. */
    monthly(agencyId: number, sellerId: number): Promise<{
        month: string;
        published: number;
        closed: number;
    }[]>;
    /** Días promedio entre Publicada y Vendida/Alquilada. */
    avgTimeOnMarket(agencyId: number, sellerId: number): Promise<{
        avgDaysOnMarket: number | null;
        samplesCount: number;
    }>;
}
export declare const reportService: ReportService;
export {};
