"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewController = void 0;
const zod_1 = require("zod");
const review_service_1 = require("../services/review.service");
const ID_REGEX = /^\d+$/;
const createReviewSchema = zod_1.z.object({
    authorName: zod_1.z.string().trim().min(1).max(120),
    content: zod_1.z.string().trim().min(1, "El contenido no puede estar vacío"),
    rating: zod_1.z.number().int().min(1, "La calificación mínima es 1").max(5, "La calificación máxima es 5"),
});
class ReviewController {
    async create(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return;
        }
        const parseResult = createReviewSchema.safeParse(request.body);
        if (!parseResult.success) {
            response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
            return;
        }
        try {
            const review = await review_service_1.reviewService.create(Number(id), parseResult.data);
            response.status(201).json(review);
        }
        catch (error) {
            if (error instanceof review_service_1.AgencyNotFoundError) {
                response.status(404).json({ message: "Inmobiliaria no encontrada" });
                return;
            }
            throw error;
        }
    }
    async list(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Inmobiliaria no encontrada" });
            return;
        }
        try {
            const reviews = await review_service_1.reviewService.listByAgency(Number(id));
            response.json(reviews);
        }
        catch (error) {
            if (error instanceof review_service_1.AgencyNotFoundError) {
                response.status(404).json({ message: "Inmobiliaria no encontrada" });
                return;
            }
            throw error;
        }
    }
}
exports.reviewController = new ReviewController();
//# sourceMappingURL=review.controller.js.map