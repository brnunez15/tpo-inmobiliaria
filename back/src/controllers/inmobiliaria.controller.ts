import type { Request, Response } from "express";
import { z } from "zod";
import { agencyService } from "../services/inmobiliaria.service";
import { leerId, validar } from "./helpers";
import { PropertyStatus } from "../entities/enums";
import { repositorioGaleriaImagen } from "../repositories/galeria-imagen.repository";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  contactPhone: z.string().trim().min(1).max(40).optional(),
  contactEmail: z.string().email().max(255).optional(),
  officeAddress: z.string().trim().max(255).nullable().optional(),
});

// Filtro opcional por estado: si viene, tiene que ser un estado válido (si no, 400)
const misPropiedadesSchema = z.object({
  status: z.nativeEnum(PropertyStatus).optional(),
});

class AgencyController {
  async getPublic(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const profile = await agencyService.getPublicProfile(id);
    response.json(profile);
  }

  async update(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const datos = validar(updateSchema, request.body);
    const profile = await agencyService.update(id, request.sellerId!, datos);
    response.json(profile);
  }

  async delete(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    await agencyService.delete(id, request.sellerId!);
    response.status(204).send();
  }

  async getProperties(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");

    const paginaPedida = Number(request.query.page);
    const limitePedido = Number(request.query.limit);
    const pageNum = Number.isInteger(paginaPedida) && paginaPedida >= 1 ? paginaPedida : 1;
    const limitNum = Number.isInteger(limitePedido) && limitePedido >= 1 ? Math.min(100, limitePedido) : 20;

    const todas = await agencyService.getProperties(id);
    const inicio = (pageNum - 1) * limitNum;
    const pagina = todas.slice(inicio, inicio + limitNum);

    const portadas = await repositorioGaleriaImagen.buscarPortadas(pagina.map((p) => p.id));
    const data = pagina.map((propiedad) => {
      const portada = portadas.find((imagen) => imagen.property.id === propiedad.id);
      return { ...propiedad, coverImageUrl: portada ? portada.url : null };
    });

    response.json({
      data,
      meta: { total: todas.length, page: pageNum, limit: limitNum, totalPages: Math.ceil(todas.length / limitNum) },
    });
  }

  // GET /agencies/:id/my-properties?status=PUBLISHED&page=1&limit=10 — "Mis propiedades" (solo el dueño)
  async getMyProperties(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const { status } = validar(misPropiedadesSchema, request.query);

    // Misma paginación que GET /properties
    const paginaPedida = Number(request.query.page);
    const limitePedido = Number(request.query.limit);
    const pageNum = Number.isInteger(paginaPedida) && paginaPedida >= 1 ? paginaPedida : 1;
    const limitNum = Number.isInteger(limitePedido) && limitePedido >= 1 ? Math.min(100, limitePedido) : 20;

    const { data, total } = await agencyService.obtenerMisPropiedades(
      id,
      request.sellerId!,
      { estado: status },
      { pagina: pageNum, limite: limitNum }
    );

    // Mismo formato de respuesta que GET /properties
    response.json({
      data,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  }

  // GET /agencies/:id/comments?unanswered=true — "Consultas" (solo el dueño)
  async getComments(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const soloSinResponder = request.query.unanswered === "true";
    const comments = await agencyService.obtenerConsultas(id, request.sellerId!, soloSinResponder);
    response.json(comments);
  }
}

export const agencyController = new AgencyController();