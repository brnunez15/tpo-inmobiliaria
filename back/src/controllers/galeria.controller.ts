import type { Request, Response } from "express";
import { z } from "zod";
import { servicioGaleria } from "../services/galeria.service";
import { leerId, validar } from "./helpers";

const agregarImagenSchema = z.object({
  url: z.string().trim().url("url debe ser una URL válida").max(500),
  isCover: z.boolean().optional(),
});

const ordenSchema = z.object({
  order: z.array(z.number().int().positive()).min(1, "order no puede estar vacío"),
});

class GaleriaController {
  // GET /properties/:id/images — público
  async listar(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const imagenes = await servicioGaleria.listar(id);
    response.json(imagenes);
  }

  // POST /properties/:id/images — solo el dueño
  async agregar(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const datos = validar(agregarImagenSchema, request.body);
    const imagen = await servicioGaleria.agregar(id, request.sellerId!, datos);
    response.status(201).json(imagen);
  }

  // PATCH /properties/:id/images/:imageId/cover — solo el dueño
  async cambiarPortada(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const imagenId = leerId(request, "Imagen no encontrada", "imageId");
    const imagenes = await servicioGaleria.cambiarPortada(id, imagenId, request.sellerId!);
    response.json(imagenes);
  }

  // PUT /properties/:id/images/order — solo el dueño. Body: { "order": [3, 1, 2] }
  async ordenar(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const { order } = validar(ordenSchema, request.body);
    const imagenes = await servicioGaleria.ordenar(id, request.sellerId!, order);
    response.json(imagenes);
  }

  // DELETE /properties/:id/images/:imageId — solo el dueño
  async eliminar(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Propiedad no encontrada");
    const imagenId = leerId(request, "Imagen no encontrada", "imageId");
    await servicioGaleria.eliminar(id, imagenId, request.sellerId!);
    response.status(204).send();
  }
}

export const galeriaController = new GaleriaController();
