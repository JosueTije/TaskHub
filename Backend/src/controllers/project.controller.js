const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  addProjectMember,
  removeProjectMember,
  getArchivedProjects,
  getArchivedProjectHistory,
} = require("../services/project.service");
const prisma = require("../config/prisma");
const githubService = require("../services/github.service");
const { getIO } = require("../config/socket");

function emit(event, projectId, payload) {
  try { getIO()?.to(`project:${projectId}`).emit(event, payload); } catch {}
}

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

    emit("member:added", projectId, { projectId, member });
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

    // GitHub integration: crear repositorio de forma no bloqueante.
    // Si GitHub falla el proyecto igual queda creado; el repo se puede
    // conectar manualmente desde el botón "Conectar a GitHub" en la UI.
    try {
      const ghResult = await githubService.createRepository(
        project.name,
        project.description
      );
      const updated = await prisma.project.update({
        where: { id: project.id },
        data: {
          githubRepo: ghResult.repoName,
          githubRepoUrl: ghResult.repoUrl,
        },
      });
      project.githubRepo = updated.githubRepo;
      project.githubRepoUrl = updated.githubRepoUrl;
    } catch (ghError) {
      console.error("[GitHub] Error al crear repositorio:", ghError.message);
    }

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

// Endpoint manual para conectar un proyecto a GitHub cuando la creación
// automática falló (GitHub estaba caído o hubo un error de red).
async function setupProjectGithubController(req, res) {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    const ghResult = await githubService.createRepository(
      project.name,
      project.description
    );

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        githubRepo: ghResult.repoName,
        githubRepoUrl: ghResult.repoUrl,
      },
    });

    return res.status(200).json({
      message: "Repositorio conectado correctamente",
      project: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error al conectar con GitHub",
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

async function getArchivedProjectsController(req, res) {
  try {
    const projects = await getArchivedProjects({
      userId: req.user.sub,
      role: req.user.role,
    });
    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener proyectos archivados" });
  }
}

async function getProjectByIdController(req, res) {
  try {
    const { projectId } = req.params;
    const project = await getProjectById({
      projectId,
      userId: req.user.sub,
      role: req.user.role,
    });
    return res.status(200).json({ project });
  } catch (error) {
    const status = error.message === "Proyecto no encontrado" ? 404
      : error.message.startsWith("No tienes") ? 403 : 500;
    return res.status(status).json({ message: error.message || "Error al obtener proyecto" });
  }
}

async function updateProjectController(req, res) {
  try {
    const { projectId } = req.params;
    const project = await updateProject({
      projectId,
      userId: req.user.sub,
      role: req.user.role,
      data: req.body,
    });
    emit("project:updated", project.id, { project });
    return res.status(200).json({ message: "Proyecto actualizado correctamente", project });
  } catch (error) {
    const status = error.message === "Proyecto no encontrado" ? 404
      : error.message.startsWith("No tienes") ? 403 : 400;
    return res.status(status).json({ message: error.message || "Error al actualizar proyecto" });
  }
}

async function updateProjectStatusController(req, res) {
  try {
    const { projectId } = req.params;
    const { status } = req.body;
    const project = await updateProjectStatus({
      projectId,
      userId: req.user.sub,
      role: req.user.role,
      status,
    });
    emit("project:updated", project.id, { project });
    return res.status(200).json({ message: "Estado del proyecto actualizado correctamente", project });
  } catch (error) {
    const status = error.message === "Proyecto no encontrado" ? 404
      : error.message.startsWith("Solo") || error.message.startsWith("No tienes") ? 403 : 400;
    return res.status(status).json({ message: error.message || "Error al actualizar estado" });
  }
}

async function removeProjectMemberController(req, res) {
  try {
    const { projectId, userId } = req.params;
    await removeProjectMember({
      projectId,
      userId,
      currentUserId: req.user.sub,
      role: req.user.role,
    });
    emit("member:removed", projectId, { projectId, userId });
    return res.status(200).json({ message: "Miembro eliminado del proyecto correctamente" });
  } catch (error) {
    const status = error.message === "Proyecto no encontrado" ? 404
      : error.message.startsWith("No tienes") || error.message.startsWith("Solo") ? 403 : 400;
    return res.status(status).json({ message: error.message || "Error al eliminar miembro" });
  }
}

async function getArchivedProjectHistoryController(req, res) {
  try {
    const { projectId } = req.params;
    const history = await getArchivedProjectHistory({
      projectId,
      userId: req.user.sub,
      role: req.user.role,
    });
    return res.status(200).json(history);
  } catch (error) {
    const status =
      error.message === "Proyecto no encontrado" ? 404
      : error.message.startsWith("No tienes") ? 403
      : error.message === "Este proyecto no está archivado" ? 400
      : 500;
    return res.status(status).json({ message: error.message || "Error al obtener historial" });
  }
}

module.exports = {
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
};