import { Router } from "express";
import { propertyController } from "../controllers/property.controller";
import { visitRequestController } from "../controllers/visit-request.controller";
import { requireAuth } from "../middlewares/require-auth";

export const propertyRouter = Router();

// Públicos
propertyRouter.get("/", (req, res) => propertyController.findAll(req, res));
propertyRouter.get("/:id", (req, res) => propertyController.getById(req, res));
propertyRouter.get("/:id/status/history", (req, res) => propertyController.getStatusHistory(req, res));
propertyRouter.get("/:id/comments", (req, res) => propertyController.getComments(req, res));

// Solo el vendedor
propertyRouter.post("/", requireAuth, (req, res) => propertyController.create(req, res));
propertyRouter.put("/:id", requireAuth, (req, res) => propertyController.update(req, res));
propertyRouter.patch("/:id/status", requireAuth, (req, res) => propertyController.patchStatus(req, res));

// Sin auth (cualquier interesado puede comentar o pedir visita)
propertyRouter.post("/:id/comments", (req, res) => propertyController.createComment(req, res));
propertyRouter.post("/:id/visit-requests", (req, res) => visitRequestController.create(req, res));