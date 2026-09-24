import { AppDataSource } from "../config/data-source";
import { Propiedad } from "../entities/propiedad";
import { HistorialEstadoPropiedad } from "../entities/historial-estado-propiedad";
import { PropertyStatus } from "../entities/enums";
import { repositorioInmobiliaria } from "../repositories/inmobiliaria.repositorio";

export class AgencyNotFoundError extends Error {}
export class ReportForbiddenError extends Error {}

class ReportService {
  /** Cantidad de propiedades por estado actual. */
  async statusSummary(agencyId: number, sellerId: number) {
    const agency = await repositorioInmobiliaria.buscarPorId(agencyId);
    if (!agency) throw new AgencyNotFoundError();
    if (agency.seller.id !== sellerId) throw new ReportForbiddenError();

    const repo = AppDataSource.getRepository(Propiedad);
    const rows = await repo
      .createQueryBuilder("p")
      .select("p.status", "status")
      .addSelect("COUNT(*)", "count")
      .where("p.agency_id = :agencyId", { agencyId })
      .groupBy("p.status")
      .getRawMany<{ status: string; count: string }>();

    return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
  }

  /** Publicaciones nuevas y ventas/alquileres concretados por mes. */
  async monthly(agencyId: number, sellerId: number) {
    const agency = await repositorioInmobiliaria.buscarPorId(agencyId);
    if (!agency) throw new AgencyNotFoundError();
    if (agency.seller.id !== sellerId) throw new ReportForbiddenError();

    const histRepo = AppDataSource.getRepository(HistorialEstadoPropiedad);

    // Publicaciones: transiciones a PUBLISHED
    const published = await histRepo
      .createQueryBuilder("h")
      .select("TO_CHAR(h.createdAt, 'YYYY-MM')", "month")
      .addSelect("COUNT(*)", "count")
      .innerJoin("h.property", "p")
      .where("p.agency_id = :agencyId", { agencyId })
      .andWhere("h.toStatus = :status", { status: PropertyStatus.PUBLISHED })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany<{ month: string; count: string }>();

    // Concretadas: transiciones a SOLD o RENTED
    const closed = await histRepo
      .createQueryBuilder("h")
      .select("TO_CHAR(h.createdAt, 'YYYY-MM')", "month")
      .addSelect("COUNT(*)", "count")
      .innerJoin("h.property", "p")
      .where("p.agency_id = :agencyId", { agencyId })
      .andWhere("h.toStatus IN (:...statuses)", {
        statuses: [PropertyStatus.SOLD, PropertyStatus.RENTED],
      })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany<{ month: string; count: string }>();

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
  async avgTimeOnMarket(agencyId: number, sellerId: number) {
    const agency = await repositorioInmobiliaria.buscarPorId(agencyId);
    if (!agency) throw new AgencyNotFoundError();
    if (agency.seller.id !== sellerId) throw new ReportForbiddenError();

    const histRepo = AppDataSource.getRepository(HistorialEstadoPropiedad);

    // Fecha de primera publicación por propiedad
    const publishedDates = await histRepo
      .createQueryBuilder("h")
      .select("h.property_id", "propertyId")
      .addSelect("MIN(h.createdAt)", "publishedAt")
      .innerJoin("h.property", "p")
      .where("p.agency_id = :agencyId", { agencyId })
      .andWhere("h.toStatus = :status", { status: PropertyStatus.PUBLISHED })
      .groupBy("h.property_id")
      .getRawMany<{ propertyId: number; publishedAt: Date }>();

    // Fecha de cierre (SOLD / RENTED) por propiedad
    const closedDates = await histRepo
      .createQueryBuilder("h")
      .select("h.property_id", "propertyId")
      .addSelect("MIN(h.createdAt)", "closedAt")
      .innerJoin("h.property", "p")
      .where("p.agency_id = :agencyId", { agencyId })
      .andWhere("h.toStatus IN (:...statuses)", {
        statuses: [PropertyStatus.SOLD, PropertyStatus.RENTED],
      })
      .groupBy("h.property_id")
      .getRawMany<{ propertyId: number; closedAt: Date }>();

    const closedMap = new Map(closedDates.map((r) => [r.propertyId, r.closedAt]));

    const diffs: number[] = [];
    for (const { propertyId, publishedAt } of publishedDates) {
      const closedAt = closedMap.get(propertyId);
      if (!closedAt) continue;
      const days =
        (new Date(closedAt).getTime() - new Date(publishedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      diffs.push(days);
    }

    const avg =
      diffs.length > 0
        ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)
        : null;

    return { avgDaysOnMarket: avg, samplesCount: diffs.length };
  }
}

export const reportService = new ReportService();
