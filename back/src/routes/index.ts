// Ver README.md de esta carpeta para la guía de cómo agregar un recurso nuevo.
import { Router } from "express";
import { healthRouter } from "./health.routes";
import { propertyRouter } from "./property.routes";
import { authRouter } from "./auth.routes";
import { inmoRouter } from "./inmobiliaria.route";

export const router = Router();

router.use("/health", healthRouter);
router.use("/properties", propertyRouter);
router.use("/auth", authRouter);
router.use("/agencies", inmoRouter);