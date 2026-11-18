import type { Request, Response } from "express";
import { z } from "zod";
import { reviewService } from "../services/review.service";
import { leerId, validar } from "./helpers";

const createReviewSchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1, "El contenido no puede estar vacío"),
  rating: z.number().int().min(1, "La calificación mínima es 1").max(5, "La calificación máxima es 5"),
});

class ReviewController {
  async create(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const datos = validar(createReviewSchema, request.body);
    const review = await reviewService.create(id, datos);
    response.status(201).json(review);
  }

  async list(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Inmobiliaria no encontrada");
    const reviews = await reviewService.listByAgency(id);
    response.json(reviews);
  }
}

export const reviewController = new ReviewController();
