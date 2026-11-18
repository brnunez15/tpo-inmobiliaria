import type { Request, Response } from "express";
import { z } from "zod";
import { commentService } from "../services/comment.service";
import { leerId, validar } from "./helpers";

const replySchema = z.object({
  reply: z.string().trim().min(1, "reply is required").max(1000),
});

class CommentController {
  async reply(request: Request, response: Response): Promise<void> {
    const id = leerId(request, "Comentario no encontrado");
    const { reply } = validar(replySchema, request.body);
    const comment = await commentService.reply(id, request.sellerId!, reply);
    response.json(comment);
  }
}

export const commentController = new CommentController();
