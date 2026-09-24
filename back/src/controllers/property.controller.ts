import type { Request, Response } from "express";
import { z } from "zod";
import { propertyService } from "../services/property.service";
import {
  propertyStatusService,
  PropertyStatusInvalidTransitionError,
  PropertyNotFoundError,
  PropertyForbiddenError,
} from "../services/property-status.service";
import {
  commentService,
  CommentNotFoundError,
  CommentForbiddenError,
  PropertyNotFoundError as CommentPropertyNotFoundError,
} from "../services/comment.service";
import { PropertyStatus } from "../entities/enums";

const ID_REGEX = /^\d+$/;

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
  agencyId: z.number(),
});

const patchStatusSchema = z.object({
  status: z.nativeEnum(PropertyStatus),
});

const createCommentSchema = z.object({
  authorName: z.string().trim().min(1, "authorName is required").max(120),
  content: z.string().trim().min(1, "content is required").max(1000),
});

const replySchema = z.object({
  reply: z.string().trim().min(1, "reply is required").max(1000),
});

class PropertyController {
  async getById(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Propiedad no encontrada" });
      return;
    }
    const property = await propertyService.getById(Number(id));
    if (!property) {
      response.status(404).json({ message: "Propiedad no encontrada" });
      return;
    }
    response.json(property);
  }

  async create(request: Request, response: Response): Promise<void> {
    const parseResult = createPropertySchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
      return;
    }
    const { agencyId, ...propertyData } = parseResult.data;
    try {
      const property = await propertyService.create({
        ...propertyData,
        price: String(propertyData.price),
        totalAreaM2: String(propertyData.totalAreaM2),
        coveredAreaM2: propertyData.coveredAreaM2 != null ? String(propertyData.coveredAreaM2) : null,
        agency: { id: agencyId },
      });
      response.status(201).json(property);
    } catch (error) {
      response.status(400).json({ error: (error as Error).message });
    }
  }

  async update(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Propiedad no encontrada" });
      return;
    }
    const parseResult = createPropertySchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
      return;
    }
    const { agencyId, price, totalAreaM2, coveredAreaM2, ...rest } = parseResult.data;
    try {
      const property = await propertyService.update(Number(id), {
        ...rest,
        ...(price !== undefined ? { price: String(price) } : {}),
        ...(totalAreaM2 !== undefined ? { totalAreaM2: String(totalAreaM2) } : {}),
        ...(coveredAreaM2 !== undefined ? { coveredAreaM2: coveredAreaM2 != null ? String(coveredAreaM2) : null } : {}),
      });
      response.json(property);
    } catch (error) {
      const message = (error as Error).message;
      const status = message === "Property not found" ? 404 : 400;
      response.status(status).json({ error: message });
    }
  }

  async findAll(request: Request, response: Response): Promise<void> {
    const { type, operation, minPrice, maxPrice, area, rooms, tags, search, sortBy, order, page, limit } = request.query;

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
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Propiedad no encontrada" });
      return;
    }

    const parseResult = patchStatusSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
      return;
    }

    try {
      const result = await propertyStatusService.changeStatus(
        Number(id),
        request.sellerId!,
        parseResult.data.status
      );
      response.json(result);
    } catch (error) {
      if (error instanceof PropertyNotFoundError) {
        response.status(404).json({ message: "Propiedad no encontrada" });
        return;
      }
      if (error instanceof PropertyForbiddenError) {
        response.status(403).json({ message: "No tenés permiso para cambiar el estado de esta propiedad" });
        return;
      }
      if (error instanceof PropertyStatusInvalidTransitionError) {
        response.status(400).json({ error: (error as Error).message });
        return;
      }
      throw error;
    }
  }

  async getStatusHistory(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Propiedad no encontrada" });
      return;
    }
    try {
      const history = await propertyStatusService.getHistory(Number(id));
      response.json(history);
    } catch (error) {
      if (error instanceof PropertyNotFoundError) {
        response.status(404).json({ message: "Propiedad no encontrada" });
        return;
      }
      throw error;
    }
  }

  // ── Tarea 7: Comentarios ─────────────────────────────────────────────────

  async createComment(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Propiedad no encontrada" });
      return;
    }

    const parseResult = createCommentSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
      return;
    }

    try {
      const comment = await commentService.create(
        Number(id),
        parseResult.data.authorName,
        parseResult.data.content
      );
      response.status(201).json(comment);
    } catch (error) {
      if (error instanceof CommentPropertyNotFoundError) {
        response.status(404).json({ message: "Propiedad no encontrada" });
        return;
      }
      throw error;
    }
  }

  async getComments(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Propiedad no encontrada" });
      return;
    }
    try {
      const comments = await commentService.listByProperty(Number(id));
      response.json(comments);
    } catch (error) {
      if (error instanceof CommentPropertyNotFoundError) {
        response.status(404).json({ message: "Propiedad no encontrada" });
        return;
      }
      throw error;
    }
  }
}

export const propertyController = new PropertyController();