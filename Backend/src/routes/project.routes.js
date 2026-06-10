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
  setupProjectGithubController,
} = require("../controllers/project.controller");
const { getProjectBranchesController } = require("../controllers/branches.controller");
const {
  getAiContextController,
  executiveSummaryController,
  riskAnalysisController,
  riskAnalysisPdfController,
} = require("../controllers/ai-analysis.controller");
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
router.post("/:projectId/github/setup", requireAuth, requireRole("ADMIN", "PM"), setupProjectGithubController);
router.get("/:projectId/branches", requireAuth, getProjectBranchesController);

// ── AI analysis endpoints ──────────────────────────────────────────────────
router.get("/:projectId/ai-context", requireAuth, requireRole("ADMIN", "PM"), getAiContextController);
router.post("/:projectId/ai/executive-summary", requireAuth, requireRole("ADMIN", "PM"), executiveSummaryController);
router.post("/:projectId/ai/risk-analysis", requireAuth, requireRole("ADMIN", "PM"), riskAnalysisController);
router.post("/:projectId/ai/risk-analysis/pdf", requireAuth, requireRole("ADMIN", "PM"), riskAnalysisPdfController);

module.exports = router;