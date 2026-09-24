"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityRouter = void 0;
const express_1 = require("express");
const activity_controller_1 = require("../controllers/activity.controller");
const require_auth_1 = require("../middlewares/require-auth");
exports.activityRouter = (0, express_1.Router)();
exports.activityRouter.patch("/:id/read", require_auth_1.requireAuth, (req, res) => activity_controller_1.activityController.markAsRead(req, res));
//# sourceMappingURL=activity.routes.js.map