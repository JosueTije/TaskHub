const express = require("express");
const { getUsersController, addProjectMember, getDevelopers, updateUserController, deleteUserController, updateUserStatusController, resetUserPasswordController, getUserMetricsController } = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

router.get("/", requireAuth, requireRole("ADMIN"), getUsersController);
router.get("/developers", requireAuth, requireRole("ADMIN", "PM"), getDevelopers);
router.patch("/:userId", requireAuth, requireRole("ADMIN"), updateUserController);
router.delete("/:userId", requireAuth, requireRole("ADMIN"), deleteUserController);
router.patch("/:userId/status", requireAuth, requireRole("ADMIN"), updateUserStatusController);
router.post("/:userId/reset-password", requireAuth, requireRole("ADMIN"), resetUserPasswordController);
router.get("/:userId/metrics", requireAuth, requireRole("ADMIN"), getUserMetricsController);
router.post("/:projectId/members", requireAuth, addProjectMember);
module.exports = router;