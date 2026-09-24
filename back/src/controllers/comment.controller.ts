import type { Request, Response } from "express";
import { z } from "zod";
import {
  commentService,
  CommentNotFoundError,
  CommentForbiddenError,
} from "../services/comment.service";

const ID_REGEX = /^\d+$/;

const replySchema = z.object({
  reply: z.string().trim().min(1, "reply is required").max(1000),
});

class CommentController {
  async reply(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      response.status(404).json({ message: "Comentario no encontrado" });
      return;
    }

    const parseResult = replySchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
      return;
    }

    try {
      const comment = await commentService.reply(
        Number(id),
        request.sellerId!,
        parseResult.data.reply
      );
      response.json(comment);
    } catch (error) {
      if (error instanceof CommentNotFoundError) {
        response.status(404).json({ message: "Comentario no encontrado" });
        return;
      }
      if (error instanceof CommentForbiddenError) {
        response.status(403).json({ message: "No tenés permiso para responder este comentario" });
        return;
      }
      throw error;
    }
  }
}

export const commentController = new CommentController();
