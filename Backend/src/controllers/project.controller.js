const { createProject, getProjects } = require("../services/project.service");
const { addProjectMember } = require("../services/project.service");

async function addProjectMemberController(req, res) {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    const member = await addProjectMember({
      projectId,
      userId,
      currentUserId: req.user.sub,
      role: req.user.role,
    });

    return res.status(201).json({
      message: "Developer agregado correctamente",
      member,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Error al agregar developer",
    });
  }
}
async function createProjectController(req, res) {
  try {
    const {
      name,
      code,
      description,
      pmId,
      riskLevel,
      startDate,
      targetEndDate,
      budget,
      memberIds,
    } = req.body;

    const project = await createProject({
      name,
      code,
      description,
      pmId,
      riskLevel,
      startDate,
      targetEndDate,
      budget,
      memberIds,
      createdById: req.user.sub,
      creatorRole: req.user.role,
    });

    return res.status(201).json({
      message: "Proyecto creado correctamente",
      project,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Error al crear proyecto",
    });
  }
}

async function getProjectsController(req, res) {
  try {
    const projects = await getProjects({
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json({
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener proyectos",
    });
  }
}

module.exports = {
  createProjectController,
  getProjectsController,
  addProjectMemberController
};