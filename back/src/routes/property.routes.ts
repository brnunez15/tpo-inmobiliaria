import { Router } from "express";
import { propertyController } from "../controllers/property.controller";
import { visitRequestController } from "../controllers/visit-request.controller";
import { galeriaController } from "../controllers/galeria.controller";
import { requireAuth } from "../middlewares/require-auth";

export const propertyRouter = Router();

// Públicos
propertyRouter.get("/", (req, res) => propertyController.findAll(req, res));
propertyRouter.get("/:id", (req, res) => propertyController.getById(req, res));
propertyRouter.get("/:id/status/history", (req, res) => propertyController.getStatusHistory(req, res));
propertyRouter.get("/:id/comments", (req, res) => propertyController.getComments(req, res));
propertyRouter.get("/:id/images", (req, res) => galeriaController.listar(req, res));

// Solo el vendedor
propertyRouter.post("/", requireAuth, (req, res) => propertyController.create(req, res));
propertyRouter.put("/:id", requireAuth, (req, res) => propertyController.update(req, res));
propertyRouter.patch("/:id/status", requireAuth, (req, res) => propertyController.patchStatus(req, res));
propertyRouter.post("/:id/images", requireAuth, (req, res) => galeriaController.agregar(req, res));
propertyRouter.put("/:id/images/order", requireAuth, (req, res) => galeriaController.ordenar(req, res));
propertyRouter.patch("/:id/images/:imageId/cover", requireAuth, (req, res) => galeriaController.cambiarPortada(req, res));
propertyRouter.delete("/:id/images/:imageId", requireAuth, (req, res) => galeriaController.eliminar(req, res));

// Sin auth (cualquier interesado puede comentar o pedir visita)
propertyRouter.post("/:id/comments", (req, res) => propertyController.createComment(req, res));
propertyRouter.post("/:id/visit-requests", (req, res) => visitRequestController.create(req, res));