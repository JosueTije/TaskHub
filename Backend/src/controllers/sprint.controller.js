const {
  createSprint,
  getSprintsByProject,
  getSprintById,
  updateSprint,
  updateSprintStatus,
  deleteSprint,
} = require("../services/sprint.service");

function sprintErrorStatus(msg = "") {
  if (msg.includes("Rol no autorizado") || msg.includes("No tienes permisos")) return 403;
  if (
    msg.includes("no existe") ||
    msg.includes("no encontrado") ||
    msg.includes("archivado") ||
    msg.includes("no tienes acceso") // neutralized — returns 404 not 403
  ) return 404;
  return 400;
}

async function createSprintController(req, res) {
  try {
    const { projectId } = req.params;
    const { name, goal, startDate, endDate, capacity } = req.body;

    const sprint = await createSprint({
      projectId,
      name,
      goal,
      startDate,
      endDate,
      capacity,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(201).json({
      message: "Sprint creado correctamente",
      sprint,
    });
  } catch (error) {
    return res.status(sprintErrorStatus(error.message)).json({
      message: error.message || "Error al crear sprint",
    });
  }
}

async function getSprintsByProjectController(req, res) {
  try {
    const { projectId } = req.params;

    const sprints = await getSprintsByProject({
      projectId,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json({ sprints });
  } catch (error) {
    return res.status(sprintErrorStatus(error.message)).json({
      message: error.message || "Error al obtener sprints",
    });
  }
}

async function getSprintByIdController(req, res) {
  try {
    const { id } = req.params;

    const sprint = await getSprintById({
      sprintId: id,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json({ sprint });
  } catch (error) {
    return res.status(sprintErrorStatus(error.message)).json({
      message: error.message || "Error al obtener sprint",
    });
  }
}

async function updateSprintController(req, res) {
  try {
    const { id } = req.params;
    const { name, goal, startDate, endDate, capacity } = req.body;

    const sprint = await updateSprint({
      sprintId: id,
      name,
      goal,
      startDate,
      endDate,
      capacity,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json({
      message: "Sprint actualizado correctamente",
      sprint,
    });
  } catch (error) {
    return res.status(sprintErrorStatus(error.message)).json({
      message: error.message || "Error al actualizar sprint",
    });
  }
}

async function updateSprintStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const sprint = await updateSprintStatus({
      sprintId: id,
      status,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json({
      message: "Estado del sprint actualizado correctamente",
      sprint,
    });
  } catch (error) {
    return res.status(sprintErrorStatus(error.message)).json({
      message: error.message || "Error al actualizar estado del sprint",
    });
  }
}

async function deleteSprintController(req, res) {
  try {
    const { id } = req.params;

    const result = await deleteSprint({
      sprintId: id,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(sprintErrorStatus(error.message)).json({
      message: error.message || "Error al eliminar sprint",
    });
  }
}

module.exports = {
  createSprintController,
  getSprintsByProjectController,
  getSprintByIdController,
  updateSprintController,
  updateSprintStatusController,
  deleteSprintController,
};
