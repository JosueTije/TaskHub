const express = require("express");
const {
  createSprintController,
  getSprintsByProjectController,
  getSprintByIdController,
  updateSprintController,
  updateSprintStatusController,
  closeSprintController,
  deleteSprintController,
} = require("../controllers/sprint.controller");
const { analyzeSrs, confirmSrs } = require("../controllers/srs.controller");
const { upload } = require("../middlewares/upload.middleware");

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

router.post(
  "/:id/close",
  requireAuth,
  requireRole("ADMIN", "PM"),
  closeSprintController
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PM"),
  deleteSprintController
);

router.post(
  "/:id/srs/analyze",
  requireAuth,
  requireRole("ADMIN", "PM"),
  upload.single("file"),
  analyzeSrs
);

router.post(
  "/:id/srs/confirm",
  requireAuth,
  requireRole("ADMIN", "PM"),
  confirmSrs
);

module.exports = router;