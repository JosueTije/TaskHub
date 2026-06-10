const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth.middleware");
const { leaderboardController, projectGamificationController } = require("../controllers/gamification.controller");

router.get("/leaderboard", requireAuth, leaderboardController);
router.get("/project/:projectId", requireAuth, projectGamificationController);

module.exports = router;
