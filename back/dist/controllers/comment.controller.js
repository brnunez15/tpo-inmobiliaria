"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentController = void 0;
const zod_1 = require("zod");
const comment_service_1 = require("../services/comment.service");
const ID_REGEX = /^\d+$/;
const replySchema = zod_1.z.object({
    reply: zod_1.z.string().trim().min(1, "reply is required").max(1000),
});
class CommentController {
    async reply(request, response) {
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
            const comment = await comment_service_1.commentService.reply(Number(id), request.sellerId, parseResult.data.reply);
            response.json(comment);
        }
        catch (error) {
            if (error instanceof comment_service_1.CommentNotFoundError) {
                response.status(404).json({ message: "Comentario no encontrado" });
                return;
            }
            if (error instanceof comment_service_1.CommentForbiddenError) {
                response.status(403).json({ message: "No tenés permiso para responder este comentario" });
                return;
            }
            throw error;
        }
    }
}
exports.commentController = new CommentController();
//# sourceMappingURL=comment.controller.js.map