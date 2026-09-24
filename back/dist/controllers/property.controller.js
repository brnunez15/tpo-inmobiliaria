"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyController = void 0;
const zod_1 = require("zod");
const property_service_1 = require("../services/property.service");
const property_status_service_1 = require("../services/property-status.service");
const comment_service_1 = require("../services/comment.service");
const enums_1 = require("../entities/enums");
const ID_REGEX = /^\d+$/;
const createPropertySchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1, "title is required").max(160),
    description: zod_1.z.string().trim().min(1, "description is required"),
    type: zod_1.z.enum(["HOUSE", "APARTMENT", "LAND", "COMMERCIAL"]),
    operation: zod_1.z.enum(["SALE", "RENT"]),
    price: zod_1.z.number(),
    currency: zod_1.z.enum(["ARS", "USD"]),
    address: zod_1.z.string().trim().min(1).max(255),
    area: zod_1.z.string().trim().min(1).max(120),
    totalAreaM2: zod_1.z.number(),
    coveredAreaM2: zod_1.z.number().nullable().optional(),
    rooms: zod_1.z.number().int().nullable().optional(),
    bedrooms: zod_1.z.number().int().nullable().optional(),
    bathrooms: zod_1.z.number().int().nullable().optional(),
    ageYears: zod_1.z.number().int().nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    agencyId: zod_1.z.number(),
});
const patchStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enums_1.PropertyStatus),
});
const createCommentSchema = zod_1.z.object({
    authorName: zod_1.z.string().trim().min(1, "authorName is required").max(120),
    content: zod_1.z.string().trim().min(1, "content is required").max(1000),
});
const replySchema = zod_1.z.object({
    reply: zod_1.z.string().trim().min(1, "reply is required").max(1000),
});
class PropertyController {
    async getById(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Propiedad no encontrada" });
            return;
        }
        const property = await property_service_1.propertyService.getById(Number(id));
        if (!property) {
            response.status(404).json({ message: "Propiedad no encontrada" });
            return;
        }
        response.json(property);
    }
    async create(request, response) {
        const parseResult = createPropertySchema.safeParse(request.body);
        if (!parseResult.success) {
            response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
            return;
        }
        const { agencyId, ...propertyData } = parseResult.data;
        try {
            const property = await property_service_1.propertyService.create({
                ...propertyData,
                price: String(propertyData.price),
                totalAreaM2: String(propertyData.totalAreaM2),
                coveredAreaM2: propertyData.coveredAreaM2 != null ? String(propertyData.coveredAreaM2) : null,
                agency: { id: agencyId },
            });
            response.status(201).json(property);
        }
        catch (error) {
            response.status(400).json({ error: error.message });
        }
    }
    async update(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Propiedad no encontrada" });
            return;
        }
        const parseResult = createPropertySchema.partial().safeParse(request.body);
        if (!parseResult.success) {
            response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
            return;
        }
        const { agencyId, price, totalAreaM2, coveredAreaM2, ...rest } = parseResult.data;
        try {
            const property = await property_service_1.propertyService.update(Number(id), {
                ...rest,
                ...(price !== undefined ? { price: String(price) } : {}),
                ...(totalAreaM2 !== undefined ? { totalAreaM2: String(totalAreaM2) } : {}),
                ...(coveredAreaM2 !== undefined ? { coveredAreaM2: coveredAreaM2 != null ? String(coveredAreaM2) : null } : {}),
            });
            response.json(property);
        }
        catch (error) {
            const message = error.message;
            const status = message === "Property not found" ? 404 : 400;
            response.status(status).json({ error: message });
        }
    }
    async findAll(request, response) {
        const { type, operation, minPrice, maxPrice, area, rooms, tags, search, sortBy, order, page, limit } = request.query;
        const pageNum = Math.max(1, Number(page ?? 1));
        const limitNum = Math.min(100, Math.max(1, Number(limit ?? 20)));
        const { data, total } = await property_service_1.propertyService.findAll({
            type: typeof type === "string" ? type : undefined,
            operation: typeof operation === "string" ? operation : undefined,
            minPrice: typeof minPrice === "string" ? minPrice : undefined,
            maxPrice: typeof maxPrice === "string" ? maxPrice : undefined,
            area: typeof area === "string" ? area : undefined,
            rooms: typeof rooms === "string" ? rooms : undefined,
            tags: typeof tags === "string" ? tags : undefined,
            search: typeof search === "string" ? search : undefined,
            sortBy: typeof sortBy === "string" ? sortBy : undefined,
            order: typeof order === "string" ? order : undefined,
        }, { page: pageNum, limit: limitNum });
        response.json({
            data,
            meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        });
    }
    // ── Tarea 6: Máquina de estados ──────────────────────────────────────────
    async patchStatus(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Propiedad no encontrada" });
            return;
        }
        const parseResult = patchStatusSchema.safeParse(request.body);
        if (!parseResult.success) {
            response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
            return;
        }
        try {
            const result = await property_status_service_1.propertyStatusService.changeStatus(Number(id), request.sellerId, parseResult.data.status);
            response.json(result);
        }
        catch (error) {
            if (error instanceof property_status_service_1.PropertyNotFoundError) {
                response.status(404).json({ message: "Propiedad no encontrada" });
                return;
            }
            if (error instanceof property_status_service_1.PropertyForbiddenError) {
                response.status(403).json({ message: "No tenés permiso para cambiar el estado de esta propiedad" });
                return;
            }
            if (error instanceof property_status_service_1.PropertyStatusInvalidTransitionError) {
                response.status(400).json({ error: error.message });
                return;
            }
            throw error;
        }
    }
    async getStatusHistory(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Propiedad no encontrada" });
            return;
        }
        try {
            const history = await property_status_service_1.propertyStatusService.getHistory(Number(id));
            response.json(history);
        }
        catch (error) {
            if (error instanceof property_status_service_1.PropertyNotFoundError) {
                response.status(404).json({ message: "Propiedad no encontrada" });
                return;
            }
            throw error;
        }
    }
    // ── Tarea 7: Comentarios ─────────────────────────────────────────────────
    async createComment(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Propiedad no encontrada" });
            return;
        }
        const parseResult = createCommentSchema.safeParse(request.body);
        if (!parseResult.success) {
            response.status(400).json({ error: "Body inválido", details: parseResult.error.issues });
            return;
        }
        try {
            const comment = await comment_service_1.commentService.create(Number(id), parseResult.data.authorName, parseResult.data.content);
            response.status(201).json(comment);
        }
        catch (error) {
            if (error instanceof comment_service_1.PropertyNotFoundError) {
                response.status(404).json({ message: "Propiedad no encontrada" });
                return;
            }
            throw error;
        }
    }
    async getComments(request, response) {
        const { id } = request.params;
        if (typeof id !== "string" || !ID_REGEX.test(id)) {
            response.status(404).json({ message: "Propiedad no encontrada" });
            return;
        }
        try {
            const comments = await comment_service_1.commentService.listByProperty(Number(id));
            response.json(comments);
        }
        catch (error) {
            if (error instanceof comment_service_1.PropertyNotFoundError) {
                response.status(404).json({ message: "Propiedad no encontrada" });
                return;
            }
            throw error;
        }
    }
}
exports.propertyController = new PropertyController();
//# sourceMappingURL=property.controller.js.map