"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(1),
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(6),
    agencyName: zod_1.z.string().trim().min(1),
    contactPhone: zod_1.z.string().trim().min(1),
    contactEmail: zod_1.z.string().trim().email(),
    description: zod_1.z.string().trim().min(1),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(1),
});
class AuthController {
    async register(request, response) {
        const parseResult = registerSchema.safeParse(request.body);
        if (!parseResult.success) {
            response.status(400).json({ error: "Datos inválidos", details: parseResult.error.issues });
            return;
        }
        try {
            const created = await auth_service_1.authService.register(parseResult.data);
            response.status(201).json(created);
        }
        catch (error) {
            if (error instanceof auth_service_1.EmailAlreadyExistsError) {
                response.status(409).json({ error: "El email ya está registrado" });
                return;
            }
            if (error instanceof auth_service_1.AgencyNameAlreadyExistsError) {
                response.status(409).json({ error: "El nombre de fantasía ya existe" });
                return;
            }
            throw error; // lo agarra el middleware de errores (tarea 11)
        }
    }
    async login(request, response) {
        const parseResult = loginSchema.safeParse(request.body);
        if (!parseResult.success) {
            response.status(400).json({ error: "Datos inválidos", details: parseResult.error.issues });
            return;
        }
        try {
            const result = await auth_service_1.authService.login(parseResult.data.email, parseResult.data.password);
            response.json(result);
        }
        catch (error) {
            if (error instanceof auth_service_1.InvalidCredentialsError) {
                response.status(401).json({ error: "Credenciales inválidas" });
                return;
            }
            throw error;
        }
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map