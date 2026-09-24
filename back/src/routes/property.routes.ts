import { Router } from "express";
import { propertyController } from "../controllers/property.controller";

export const propertyRouter = Router();

propertyRouter.post("/", propertyController.create);
propertyRouter.get("/", propertyController.findAll);
propertyRouter.get("/:id", propertyController.getById);
propertyRouter.put("/:id", propertyController.update);
propertyRouter.post("/:id/comments", propertyController.createComment);