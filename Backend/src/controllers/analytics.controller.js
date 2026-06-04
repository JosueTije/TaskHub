const {
  getProjectDashboard,
  getProjectMetrics,
} = require("../services/analytics.service");

async function getProjectDashboardController(req, res) {
  try {
    const { projectId } = req.params;

    const data = await getProjectDashboard({
      projectId,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Error al obtener dashboard",
    });
  }
}

async function getProjectMetricsController(req, res) {
  try {
    const { projectId } = req.params;
    const data = await getProjectMetrics({ projectId, userId: req.user.sub, role: req.user.role });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Error al obtener métricas",
    });
  }
}

module.exports = {
  getProjectDashboardController,
  getProjectMetricsController,
};