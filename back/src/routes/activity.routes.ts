import { Router } from "express";
import { activityController } from "../controllers/activity.controller";
import { requireAuth } from "../middlewares/require-auth";

export const activityRouter = Router();

activityRouter.patch("/:id/read", requireAuth, (req, res) =>
  activityController.markAsRead(req, res)
);
