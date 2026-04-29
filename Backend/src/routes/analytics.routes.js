const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  getProjectDashboardController,
} = require("../controllers/analytics.controller");

const router = express.Router();

router.get(
  "/project/:projectId/dashboard",
  requireAuth,
  getProjectDashboardController
);

module.exports = router;