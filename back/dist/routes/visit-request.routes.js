"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitRequestRouter = void 0;
const express_1 = require("express");
const visit_request_controller_1 = require("../controllers/visit-request.controller");
const require_auth_1 = require("../middlewares/require-auth");
exports.visitRequestRouter = (0, express_1.Router)();
// PATCH /visit-requests/:id/status — solo el dueño
exports.visitRequestRouter.patch("/:id/status", require_auth_1.requireAuth, (req, res) => visit_request_controller_1.visitRequestController.patchStatus(req, res));
//# sourceMappingURL=visit-request.routes.js.map