"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportForbiddenError = exports.AgencyNotFoundError = void 0;
const data_source_1 = require("../config/data-source");
const propiedad_1 = require("../entities/propiedad");
const historial_estado_propiedad_1 = require("../entities/historial-estado-propiedad");
const enums_1 = require("../entities/enums");
const inmobiliaria_repositorio_1 = require("../repositories/inmobiliaria.repositorio");
class AgencyNotFoundError extends Error {
}
exports.AgencyNotFoundError = AgencyNotFoundError;
class ReportForbiddenError extends Error {
}
exports.ReportForbiddenError = ReportForbiddenError;
class ReportService {
    /** Cantidad de propiedades por estado actual. */
    async statusSummary(agencyId, sellerId) {
        const agency = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(agencyId);
        if (!agency)
            throw new AgencyNotFoundError();
        if (agency.seller.id !== sellerId)
            throw new ReportForbiddenError();
        const repo = data_source_1.AppDataSource.getRepository(propiedad_1.Propiedad);
        const rows = await repo
            .createQueryBuilder("p")
            .select("p.status", "status")
            .addSelect("COUNT(*)", "count")
            .where("p.agency_id = :agencyId", { agencyId })
            .groupBy("p.status")
            .getRawMany();
        return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
    }
    /** Publicaciones nuevas y ventas/alquileres concretados por mes. */
    async monthly(agencyId, sellerId) {
        const agency = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(agencyId);
        if (!agency)
            throw new AgencyNotFoundError();
        if (agency.seller.id !== sellerId)
            throw new ReportForbiddenError();
        const histRepo = data_source_1.AppDataSource.getRepository(historial_estado_propiedad_1.HistorialEstadoPropiedad);
        // Publicaciones: transiciones a PUBLISHED
        const published = await histRepo
            .createQueryBuilder("h")
            .select("TO_CHAR(h.createdAt, 'YYYY-MM')", "month")
            .addSelect("COUNT(*)", "count")
            .innerJoin("h.property", "p")
            .where("p.agency_id = :agencyId", { agencyId })
            .andWhere("h.toStatus = :status", { status: enums_1.PropertyStatus.PUBLISHED })
            .groupBy("month")
            .orderBy("month", "ASC")
            .getRawMany();
        // Concretadas: transiciones a SOLD o RENTED
        const closed = await histRepo
            .createQueryBuilder("h")
            .select("TO_CHAR(h.createdAt, 'YYYY-MM')", "month")
            .addSelect("COUNT(*)", "count")
            .innerJoin("h.property", "p")
            .where("p.agency_id = :agencyId", { agencyId })
            .andWhere("h.toStatus IN (:...statuses)", {
            statuses: [enums_1.PropertyStatus.SOLD, enums_1.PropertyStatus.RENTED],
        })
            .groupBy("month")
            .orderBy("month", "ASC")
            .getRawMany();
        // Unificar por mes
        const months = new Set([
            ...published.map((r) => r.month),
            ...closed.map((r) => r.month),
        ]);
        return [...months].sort().map((month) => ({
            month,
            published: Number(published.find((r) => r.month === month)?.count ?? 0),
            closed: Number(closed.find((r) => r.month === month)?.count ?? 0),
        }));
    }
    /** Días promedio entre Publicada y Vendida/Alquilada. */
    async avgTimeOnMarket(agencyId, sellerId) {
        const agency = await inmobiliaria_repositorio_1.repositorioInmobiliaria.buscarPorId(agencyId);
        if (!agency)
            throw new AgencyNotFoundError();
        if (agency.seller.id !== sellerId)
            throw new ReportForbiddenError();
        const histRepo = data_source_1.AppDataSource.getRepository(historial_estado_propiedad_1.HistorialEstadoPropiedad);
        // Fecha de primera publicación por propiedad
        const publishedDates = await histRepo
            .createQueryBuilder("h")
            .select("h.property_id", "propertyId")
            .addSelect("MIN(h.createdAt)", "publishedAt")
            .innerJoin("h.property", "p")
            .where("p.agency_id = :agencyId", { agencyId })
            .andWhere("h.toStatus = :status", { status: enums_1.PropertyStatus.PUBLISHED })
            .groupBy("h.property_id")
            .getRawMany();
        // Fecha de cierre (SOLD / RENTED) por propiedad
        const closedDates = await histRepo
            .createQueryBuilder("h")
            .select("h.property_id", "propertyId")
            .addSelect("MIN(h.createdAt)", "closedAt")
            .innerJoin("h.property", "p")
            .where("p.agency_id = :agencyId", { agencyId })
            .andWhere("h.toStatus IN (:...statuses)", {
            statuses: [enums_1.PropertyStatus.SOLD, enums_1.PropertyStatus.RENTED],
        })
            .groupBy("h.property_id")
            .getRawMany();
        const closedMap = new Map(closedDates.map((r) => [r.propertyId, r.closedAt]));
        const diffs = [];
        for (const { propertyId, publishedAt } of publishedDates) {
            const closedAt = closedMap.get(propertyId);
            if (!closedAt)
                continue;
            const days = (new Date(closedAt).getTime() - new Date(publishedAt).getTime()) /
                (1000 * 60 * 60 * 24);
            diffs.push(days);
        }
        const avg = diffs.length > 0
            ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)
            : null;
        return { avgDaysOnMarket: avg, samplesCount: diffs.length };
    }
}
exports.reportService = new ReportService();
//# sourceMappingURL=report.service.js.map