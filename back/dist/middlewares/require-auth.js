"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(request, response, next) {
    const header = request.headers.authorization; // "Bearer <token>"
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
        response.status(401).json({ error: "Falta el token" });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        request.sellerId = payload.sellerId;
        next(); // "está todo bien, dejalo pasar al controller"
    }
    catch {
        response.status(401).json({ error: "Token inválido o expirado" });
    }
}
//# sourceMappingURL=require-auth.js.map