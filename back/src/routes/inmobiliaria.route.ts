import { Router } from "express";
import { agencyController } from "../controllers/inmobiliaria.controller";
import { reviewController } from "../controllers/review.controller";
import { visitRequestController } from "../controllers/visit-request.controller";
import { activityController } from "../controllers/activity.controller";
import { reportController } from "../controllers/report.controller";
import { requireAuth } from "../middlewares/require-auth";

export const inmoRouter = Router();

// Perfil público
inmoRouter.get("/:id", (req, res) => agencyController.getPublic(req, res));
inmoRouter.get("/:id/properties", (req, res) => agencyController.getProperties(req, res));

// ABM (solo dueño)
inmoRouter.put("/:id", requireAuth, (req, res) => agencyController.update(req, res));
inmoRouter.delete("/:id", requireAuth, (req, res) => agencyController.delete(req, res));

// Reseñas (sin auth para crear, pública para listar)
inmoRouter.post("/:id/reviews", (req, res) => reviewController.create(req, res));
inmoRouter.get("/:id/reviews", (req, res) => reviewController.list(req, res));

// Solicitudes de visita (solo el dueño puede ver)
inmoRouter.get("/:id/visit-requests", requireAuth, (req, res) =>
  visitRequestController.listByAgency(req, res)
);

// Feed de actividad (solo el dueño)
inmoRouter.get("/:id/activity", requireAuth, (req, res) =>
  activityController.listByAgency(req, res)
);
inmoRouter.get("/:id/activity/unread-count", requireAuth, (req, res) =>
  activityController.unreadCount(req, res)
);

// Reportes (solo el dueño)
inmoRouter.get("/:id/reports/status-summary", requireAuth, (req, res) =>
  reportController.statusSummary(req, res)
);
inmoRouter.get("/:id/reports/monthly", requireAuth, (req, res) =>
  reportController.monthly(req, res)
);
inmoRouter.get("/:id/reports/avg-time-on-market", requireAuth, (req, res) =>
  reportController.avgTimeOnMarket(req, res)
);