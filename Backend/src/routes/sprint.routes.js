const express = require("express");
const {
  createSprintController,
  getSprintsByProjectController,
  getSprintByIdController,
  updateSprintController,
  updateSprintStatusController,
  deleteSprintController,
} = require("../controllers/sprint.controller");

const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
  "/project/:projectId",
  requireAuth,
  requireRole("ADMIN", "PM"),
  createSprintController
);

router.get(
  "/project/:projectId",
  requireAuth,
  getSprintsByProjectController
);

router.get(
  "/:id",
  requireAuth,
  getSprintByIdController
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PM"),
  updateSprintController
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "PM"),
  updateSprintStatusController
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PM"),
  deleteSprintController
);

module.exports = router;