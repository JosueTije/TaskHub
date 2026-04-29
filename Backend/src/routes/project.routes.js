const express = require("express");
const {
  createProjectController,
  getProjectsController,
} = require("../controllers/project.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { addProjectMemberController } = require("../controllers/project.controller");
const router = express.Router();

router.get("/", requireAuth, getProjectsController);
router.post("/", requireAuth, requireRole("ADMIN", "PM"), createProjectController);
router.post("/:projectId/members", requireAuth, addProjectMemberController);

module.exports = router;