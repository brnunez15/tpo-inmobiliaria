"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyRouter = void 0;
const express_1 = require("express");
const property_controller_1 = require("../controllers/property.controller");
const visit_request_controller_1 = require("../controllers/visit-request.controller");
const require_auth_1 = require("../middlewares/require-auth");
exports.propertyRouter = (0, express_1.Router)();
// Públicos
exports.propertyRouter.get("/", (req, res) => property_controller_1.propertyController.findAll(req, res));
exports.propertyRouter.get("/:id", (req, res) => property_controller_1.propertyController.getById(req, res));
exports.propertyRouter.get("/:id/status/history", (req, res) => property_controller_1.propertyController.getStatusHistory(req, res));
exports.propertyRouter.get("/:id/comments", (req, res) => property_controller_1.propertyController.getComments(req, res));
// Solo el vendedor
exports.propertyRouter.post("/", require_auth_1.requireAuth, (req, res) => property_controller_1.propertyController.create(req, res));
exports.propertyRouter.put("/:id", require_auth_1.requireAuth, (req, res) => property_controller_1.propertyController.update(req, res));
exports.propertyRouter.patch("/:id/status", require_auth_1.requireAuth, (req, res) => property_controller_1.propertyController.patchStatus(req, res));
// Sin auth (cualquier interesado puede comentar o pedir visita)
exports.propertyRouter.post("/:id/comments", (req, res) => property_controller_1.propertyController.createComment(req, res));
exports.propertyRouter.post("/:id/visit-requests", (req, res) => visit_request_controller_1.visitRequestController.create(req, res));
//# sourceMappingURL=property.routes.js.map