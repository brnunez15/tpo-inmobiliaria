"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRouter = void 0;
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const require_auth_1 = require("../middlewares/require-auth");
exports.commentRouter = (0, express_1.Router)();
// PATCH /comments/:id/reply — solo el dueño de la propiedad
exports.commentRouter.patch("/:id/reply", require_auth_1.requireAuth, (req, res) => comment_controller_1.commentController.reply(req, res));
//# sourceMappingURL=comment.routes.js.map