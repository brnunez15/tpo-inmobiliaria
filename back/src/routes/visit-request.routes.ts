import { Router } from "express";
import { visitRequestController } from "../controllers/visit-request.controller";
import { requireAuth } from "../middlewares/require-auth";

export const visitRequestRouter = Router();

// PATCH /visit-requests/:id/status — solo el dueño
visitRequestRouter.patch("/:id/status", requireAuth, (req, res) =>
  visitRequestController.patchStatus(req, res)
);
