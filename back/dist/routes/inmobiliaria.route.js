"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inmoRouter = void 0;
const express_1 = require("express");
const inmobiliaria_controller_1 = require("../controllers/inmobiliaria.controller");
const review_controller_1 = require("../controllers/review.controller");
const visit_request_controller_1 = require("../controllers/visit-request.controller");
const activity_controller_1 = require("../controllers/activity.controller");
const report_controller_1 = require("../controllers/report.controller");
const require_auth_1 = require("../middlewares/require-auth");
exports.inmoRouter = (0, express_1.Router)();
// Perfil público
exports.inmoRouter.get("/:id", (req, res) => inmobiliaria_controller_1.agencyController.getPublic(req, res));
exports.inmoRouter.get("/:id/properties", (req, res) => inmobiliaria_controller_1.agencyController.getProperties(req, res));
// ABM (solo dueño)
exports.inmoRouter.put("/:id", require_auth_1.requireAuth, (req, res) => inmobiliaria_controller_1.agencyController.update(req, res));
exports.inmoRouter.delete("/:id", require_auth_1.requireAuth, (req, res) => inmobiliaria_controller_1.agencyController.delete(req, res));
// Reseñas (sin auth para crear, pública para listar)
exports.inmoRouter.post("/:id/reviews", (req, res) => review_controller_1.reviewController.create(req, res));
exports.inmoRouter.get("/:id/reviews", (req, res) => review_controller_1.reviewController.list(req, res));
// Solicitudes de visita (solo el dueño puede ver)
exports.inmoRouter.get("/:id/visit-requests", require_auth_1.requireAuth, (req, res) => visit_request_controller_1.visitRequestController.listByAgency(req, res));
// Feed de actividad (solo el dueño)
exports.inmoRouter.get("/:id/activity", require_auth_1.requireAuth, (req, res) => activity_controller_1.activityController.listByAgency(req, res));
exports.inmoRouter.get("/:id/activity/unread-count", require_auth_1.requireAuth, (req, res) => activity_controller_1.activityController.unreadCount(req, res));
// Reportes (solo el dueño)
exports.inmoRouter.get("/:id/reports/status-summary", require_auth_1.requireAuth, (req, res) => report_controller_1.reportController.statusSummary(req, res));
exports.inmoRouter.get("/:id/reports/monthly", require_auth_1.requireAuth, (req, res) => report_controller_1.reportController.monthly(req, res));
exports.inmoRouter.get("/:id/reports/avg-time-on-market", require_auth_1.requireAuth, (req, res) => report_controller_1.reportController.avgTimeOnMarket(req, res));
//# sourceMappingURL=inmobiliaria.route.js.map