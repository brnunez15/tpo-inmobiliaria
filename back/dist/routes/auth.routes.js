"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", (request, response) => auth_controller_1.authController.register(request, response));
exports.authRouter.post("/login", (request, response) => auth_controller_1.authController.login(request, response));
//# sourceMappingURL=auth.routes.js.map