import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/require-auth";

export const authRouter = Router();

authRouter.post("/register", (request, response) => authController.register(request, response));
authRouter.post("/login", (request, response) => authController.login(request, response));
authRouter.get("/me", requireAuth, (request, response) => authController.me(request, response));