const express = require("express");
const {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  updateProjectStatusController,
  addProjectMemberController,
  removeProjectMemberController,
  getArchivedProjectsController,
  getArchivedProjectHistoryController,
} = require("../controllers/project.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const router = express.Router();

router.get("/", requireAuth, getProjectsController);
router.get("/archived", requireAuth, requireRole("ADMIN", "PM"), getArchivedProjectsController);
router.get("/:projectId/history", requireAuth, requireRole("ADMIN", "PM"), getArchivedProjectHistoryController);
router.get("/:projectId", requireAuth, getProjectByIdController);
router.post("/", requireAuth, requireRole("ADMIN", "PM"), createProjectController);
router.put("/:projectId", requireAuth, requireRole("ADMIN", "PM"), updateProjectController);
router.patch("/:projectId/status", requireAuth, requireRole("ADMIN", "PM"), updateProjectStatusController);
router.post("/:projectId/members", requireAuth, addProjectMemberController);
router.delete("/:projectId/members/:userId", requireAuth, requireRole("ADMIN", "PM"), removeProjectMemberController);

module.exports = router;