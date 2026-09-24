import { Router } from "express";
import { agencyController } from "../controllers/inmobiliaria.controller";
import { requireAuth } from "../middlewares/require-auth";

export const inmoRouter = Router();

inmoRouter.get("/:id", (req, res) => agencyController.getPublic(req, res));
inmoRouter.put("/:id", requireAuth, (req, res) => agencyController.update(req, res));
inmoRouter.delete("/:id", requireAuth, (req, res) => agencyController.delete(req, res));
inmoRouter.get("/:id/properties", (req, res) => agencyController.getProperties(req, res));