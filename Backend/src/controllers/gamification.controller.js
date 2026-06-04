const { getLeaderboard, getProjectGamification } = require("../services/gamification.service");

async function leaderboardController(req, res) {
  try {
    const data = await getLeaderboard();
    res.json(data);
  } catch (err) {
    console.error("Gamification leaderboard error:", err);
    res.status(500).json({ error: "Error loading gamification data" });
  }
}

async function projectGamificationController(req, res) {
  try {
    const { projectId } = req.params;
    const data = await getProjectGamification(projectId, req.user.sub, req.user.role);
    res.json(data);
  } catch (err) {
    console.error("Project gamification error:", err);
    const status = err.message === "Proyecto no encontrado" ? 404
      : err.message === "No tienes acceso a este proyecto" ? 403
      : 500;
    res.status(status).json({ error: err.message || "Error loading project gamification data" });
  }
}

module.exports = { leaderboardController, projectGamificationController };
