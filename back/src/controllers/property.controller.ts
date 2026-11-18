import type { Request, Response } from "express";
import { z } from "zod";
import { propertyService, ErrorPropiedadNoEncontrada } from "../services/property.service";
import { propertyStatusService } from "../services/property-status.service";
import { commentService } from "../services/comment.service";
import { PropertyStatus } from "../entities/enums";
import { leerId, validar } from "./helpers";

// Los errores (404, 403, 400...) los lanza el service y los responde el
// middleware de errores centralizado: acá no hace falta try/catch.

const createPropertySchema = z.object({
  title: z.string().trim().min(1, "title is required").max(160),
  description: z.string().trim().min(1, "description is required"),
  type: z.enum(["HOUSE", "APARTMENT", "LAND", "COMMERCIAL"]),
  operation: z.enum(["SALE", "RENT"]),
  price: z.number(),
  currency: z.enum(["ARS", "USD"]),
  address: z.string().trim().min(1).max(255),
  area: z.string().trim().min(1).max(120),
  totalAreaM2: z.number(),
  coveredAreaM2: z.number().nullable().optional(),
  rooms: z.number().int().nullable().optional(),
  bedrooms: z.number().int().nullable().optional(),
  bathrooms: z.number().int().nullable().optional(),
  ageYears: z.number().int().nullable().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string().trim().url("cada imagen debe ser una URL válida").max(500)).optional(),
});

const patchStatusSchema = z.object({
  status: z.nativeEnum(PropertyStatus),
});

const createCommentSchema = z.object({
  authorName: z.string().trim().min(1, "authorName is required").max(120),
  content: z.string().trim().min(1, "content is required").max(1000),
});

class PropertyController {
  async getById(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const property = await propertyService.getById(id);
    if (!property) throw new ErrorPropiedadNoEncontrada();
    response.json(property);
  }

  async create(request: Request, response: Response): Promise<void> {
    const propertyData = validar(createPropertySchema, request.body);
    const property = await propertyService.create(request.sellerId!, {
      ...propertyData,
      price: String(propertyData.price),
      totalAreaM2: String(propertyData.totalAreaM2),
      coveredAreaM2: propertyData.coveredAreaM2 != null ? String(propertyData.coveredAreaM2) : null,
    });
    response.status(201).json(property);
  }

  async update(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const { price, totalAreaM2, coveredAreaM2, ...rest } = validar(createPropertySchema.partial(), request.body);
    const property = await propertyService.update(id, request.sellerId!, {
      ...rest,
      ...(price !== undefined ? { price: String(price) } : {}),
      ...(totalAreaM2 !== undefined ? { totalAreaM2: String(totalAreaM2) } : {}),
      ...(coveredAreaM2 !== undefined ? { coveredAreaM2: coveredAreaM2 != null ? String(coveredAreaM2) : null } : {}),
    });
    response.json(property);
  }

  async findAll(request: Request, response: Response): Promise<void> {
    const { type, operation, minPrice, maxPrice, area, rooms, tags, search, sortBy, order, currency, page, limit } = request.query;

    const pageNum = Math.max(1, Number(page ?? 1));
    const limitNum = Math.min(100, Math.max(1, Number(limit ?? 20)));

    const { data, total } = await propertyService.findAll(
      {
        type: typeof type === "string" ? type : undefined,
        operation: typeof operation === "string" ? operation : undefined,
        minPrice: typeof minPrice === "string" ? minPrice : undefined,
        maxPrice: typeof maxPrice === "string" ? maxPrice : undefined,
        area: typeof area === "string" ? area : undefined,
        rooms: typeof rooms === "string" ? rooms : undefined,
        tags: typeof tags === "string" ? tags : undefined,
        search: typeof search === "string" ? search : undefined,
        sortBy: typeof sortBy === "string" ? sortBy : undefined,
        order: typeof order === "string" ? order : undefined,
        currency: typeof currency === "string" ? currency : undefined,
      },
      { page: pageNum, limit: limitNum }
    );

    response.json({
      data,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  }

  // ── Tarea 6: Máquina de estados ──────────────────────────────────────────

  async patchStatus(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const { status } = validar(patchStatusSchema, request.body);
    const result = await propertyStatusService.changeStatus(id, request.sellerId!, status);
    response.json(result);
  }

  async getStatusHistory(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const history = await propertyStatusService.getHistory(id);
    response.json(history);
  }

  // ── Tarea 7: Comentarios ─────────────────────────────────────────────────

  async createComment(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const { authorName, content } = validar(createCommentSchema, request.body);
    const comment = await commentService.create(id, authorName, content);
    response.status(201).json(comment);
  }

  async getComments(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const comments = await commentService.listByProperty(id);
    response.json(comments);
  }
}

export const propertyController = new PropertyController();