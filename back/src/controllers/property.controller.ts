import type { Request, Response } from "express";
import { z } from "zod";
import { propertyService } from "../services/property.service";

const ID_REGEX = /^\d+$/;

const createCommentSchema = z.object({
  authorName: z.string().trim().min(1, "authorName is required").max(120),
  content: z.string().trim().min(1, "content is required").max(1000),
});

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
  agencyId: z.number(),
});

class PropertyController {
  async getById(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Property not found" });
      return;
    }

    const property = await propertyService.getById(Number(id));

    if (!property) {
      response.status(404).json({ message: "Property not found" });
      return;
    }

    response.json(property);
  }

  async create(request: Request, response: Response): Promise<void> {
    const parseResult = createPropertySchema.safeParse(request.body);

    if (!parseResult.success) {
      response.status(400).json({ message: "Invalid body", issues: parseResult.error.issues });
      return;
    }

    const { agencyId, ...propertyData } = parseResult.data;

    try {
      const property = await propertyService.create({
        ...propertyData,
        price: String(propertyData.price),
        totalAreaM2: String(propertyData.totalAreaM2),
        agency: { id: agencyId },
      });

      response.status(201).json(property);
    } catch (error) {
      response.status(400).json({ message: (error as Error).message });
    }
  }

  async update(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Property not found" });
      return;
    }

    const parseResult = createPropertySchema.partial().safeParse(request.body);

    if (!parseResult.success) {
      response.status(400).json({ message: "Invalid body", issues: parseResult.error.issues });
      return;
    }

    const { agencyId, price, totalAreaM2, ...rest } = parseResult.data;

    try {
      const property = await propertyService.update(Number(id), {
        ...rest,
        ...(price !== undefined ? { price: String(price) } : {}),
        ...(totalAreaM2 !== undefined ? { totalAreaM2: String(totalAreaM2) } : {}),
      });

      response.json(property);
    } catch (error) {
      const message = (error as Error).message;
      const status = message === "Property not found" ? 404 : 400;
      response.status(status).json({ message });
    }
    
  }


  async findAll(request: Request, response: Response): Promise<void> {
    const { type, operation, minPrice, maxPrice, area, rooms, tags, search, sortBy, order } = request.query;

    const properties = await propertyService.findAll({
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
    });

    response.json(properties);
  }

  // Ejemplo de validacion de body con zod. Falta la entidad Comment
  // (repository + service) para persistir esto de verdad.
  async createComment(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Property not found" });
      return;
    }

    const parseResult = createCommentSchema.safeParse(request.body);

    if (!parseResult.success) {
      response.status(400).json({ message: "Invalid body", issues: parseResult.error.issues });
      return;
    }

    // TODO: crear la entidad Comment y guardar esto via CommentRepository/CommentService.
    response.status(500).json({ message: "Not implemented" });
  }
}

export const propertyController = new PropertyController();