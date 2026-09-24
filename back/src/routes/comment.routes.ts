import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { requireAuth } from "../middlewares/require-auth";

export const commentRouter = Router();

// PATCH /comments/:id/reply — solo el dueño de la propiedad
commentRouter.patch("/:id/reply", requireAuth, (req, res) => commentController.reply(req, res));
