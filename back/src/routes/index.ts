import { Router } from "express";
import { healthRouter } from "./health.routes";
import { propertyRouter } from "./property.routes";
import { authRouter } from "./auth.routes";
import { inmoRouter } from "./inmobiliaria.route";
import { commentRouter } from "./comment.routes";
import { visitRequestRouter } from "./visit-request.routes";
import { activityRouter } from "./activity.routes";

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/agencies", inmoRouter);
router.use("/properties", propertyRouter);
router.use("/comments", commentRouter);
router.use("/visit-requests", visitRequestRouter);
router.use("/activity", activityRouter);