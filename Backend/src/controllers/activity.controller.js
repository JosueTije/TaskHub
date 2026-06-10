const { getProjectActivity } = require("../services/activity.service");

async function getProjectActivityController(req, res) {
  try {
    const { projectId } = req.params;
    const { limit } = req.query;
    const activities = await getProjectActivity({
      projectId,
      userId: req.user.sub,
      role: req.user.role,
      limit,
    });
    return res.status(200).json({ activities });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Error al obtener actividad",
    });
  }
}

module.exports = { getProjectActivityController };
