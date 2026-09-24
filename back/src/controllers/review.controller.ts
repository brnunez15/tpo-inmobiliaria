import type { Request, Response } from "express";
import { z } from "zod";
import { reviewService, AgencyNotFoundError } from "../services/review.service";

const ID_REGEX = /^\d+$/;

const createReviewSchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1, "El contenido no puede estar vacío"),
  rating: z.number().int().min(1, "La calificación mínima es 1").max(5, "La calificación máxima es 5"),
});

class ReviewController {
  async create(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }

    const parseResult = createReviewSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
      return;
    }

    try {
      const review = await reviewService.create(Number(id), parseResult.data);
      response.status(201).json(review);
    } catch (error) {
      if (error instanceof AgencyNotFoundError) {
        response.status(404).json({ message: "Inmobiliaria no encontrada" });
        return;
      }
      throw error;
    }
  }

  async list(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Inmobiliaria no encontrada" });
      return;
    }
    try {
      const reviews = await reviewService.listByAgency(Number(id));
      response.json(reviews);
    } catch (error) {
      if (error instanceof AgencyNotFoundError) {
        response.status(404).json({ message: "Inmobiliaria no encontrada" });
        return;
      }
      throw error;
    }
  }
}

export const reviewController = new ReviewController();
