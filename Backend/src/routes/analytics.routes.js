const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const {
  getProjectDashboardController,
  getProjectMetricsController,
  getSprintKpisController,
} = require("../controllers/analytics.controller");

const router = express.Router();

router.get(
  "/project/:projectId/dashboard",
  requireAuth,
  getProjectDashboardController
);

router.get(
  "/project/:projectId/metrics",
  requireAuth,
  getProjectMetricsController
);

router.get(
  "/project/:projectId/sprint/:sprintId/kpis",
  requireAuth,
  getSprintKpisController
);

module.exports = router;