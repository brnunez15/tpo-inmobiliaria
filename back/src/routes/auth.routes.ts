import { Router } from "express";
import { authController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", (request, response) => authController.register(request, response));
authRouter.post("/login", (request, response) => authController.login(request, response));