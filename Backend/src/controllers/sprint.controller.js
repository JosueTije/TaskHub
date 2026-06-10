const {
  createSprint,
  getSprintsByProject,
  getSprintById,
  updateSprint,
  updateSprintStatus,
  closeSprint,
  deleteSprint,
} = require("../services/sprint.service");
const { logActivity } = require("../services/activity.service");
const prisma = require("../config/prisma");
const githubService = require("../services/github.service");
const { getIO } = require("../config/socket");

function emit(event, projectId, payload) {
  try { getIO()?.to(`project:${projectId}`).emit(event, payload); } catch {}
}

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

    // GitHub integration: crear rama del sprint de forma no bloqueante.
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { githubRepo: true },
      });

      if (project?.githubRepo) {
        // El número de sprint es el total de sprints en el proyecto (ya incluye el nuevo)
        const sprintCount = await prisma.sprint.count({ where: { projectId } });
        const branchName = await githubService.createSprintBranch(
          project.githubRepo,
          sprintCount,
          name
        );
        await prisma.sprint.update({
          where: { id: sprint.id },
          data: { githubBranch: branchName },
        });
        sprint.githubBranch = branchName;
      }
    } catch (ghError) {
      console.error("[GitHub] Error al crear rama del sprint:", ghError.message);
    }

    logActivity({
      projectId,
      userId: req.user.sub,
      userFullName: req.user.email || req.user.sub,
      entityType: "sprint",
      entityId: sprint.id,
      entityTitle: sprint.name,
      action: "created",
    }).catch(() => {});

    emit("sprint:created", projectId, { sprint });

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

    emit("sprint:updated", sprint.projectId, { sprint });

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

    // GitHub integration: cuando se cierra un sprint (COMPLETED) hacer merge a main.
    if (status === "COMPLETED") {
      try {
        const sprintForGithub = await prisma.sprint.findUnique({
          where: { id },
          include: { project: { select: { githubRepo: true } } },
        });

        if (sprintForGithub?.githubBranch && sprintForGithub?.project?.githubRepo) {
          const mergeResult = await githubService.mergeSprintToMain(
            sprintForGithub.project.githubRepo,
            sprintForGithub.githubBranch,
            sprintForGithub.name
          );

          if (!mergeResult.success && mergeResult.reason === "conflicts") {
            // Bloquear el cierre: hay conflictos que el developer debe resolver
            return res.status(409).json({
              message:
                "No se puede cerrar el sprint porque hay conflictos en GitHub. " +
                "Resuelve los conflictos manualmente y vuelve a intentarlo.",
            });
          }

          if (!mergeResult.success) {
            // Otro tipo de error de GitHub: loguear pero continuar con el cierre
            console.error(
              `[GitHub] Merge del sprint falló (${mergeResult.reason}), cerrando sprint de todas formas`
            );
          }
        }
      } catch (ghError) {
        // Error de red o GitHub caído: loguear pero no bloquear el cierre
        console.error("[GitHub] Error al hacer merge del sprint:", ghError.message);
      }
    }

    const sprint = await updateSprintStatus({
      sprintId: id,
      status,
      userId: req.user.sub,
      role: req.user.role,
    });

    logActivity({
      projectId: sprint.projectId,
      userId: req.user.sub,
      userFullName: req.user.email || req.user.sub,
      entityType: "sprint",
      entityId: sprint.id,
      entityTitle: sprint.name,
      action: `status_changed_to_${status.toLowerCase()}`,
      metadata: { status },
    }).catch(() => {});

    emit("sprint:updated", sprint.projectId, { sprint });

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

    const sprintBefore = await prisma.sprint.findUnique({ where: { id }, select: { projectId: true } });

    const result = await deleteSprint({
      sprintId: id,
      userId: req.user.sub,
      role: req.user.role,
    });

    if (sprintBefore) emit("sprint:deleted", sprintBefore.projectId, { sprintId: id, projectId: sprintBefore.projectId });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(sprintErrorStatus(error.message)).json({
      message: error.message || "Error al eliminar sprint",
    });
  }
}

async function closeSprintController(req, res) {
  try {
    const { id } = req.params;
    const { incompleteAction, destinationSprintId } = req.body;

    // GitHub integration: merge sprint branch to main before closing.
    if (req.body.status !== "CANCELLED") {
      try {
        const sprintForGithub = await prisma.sprint.findUnique({
          where: { id },
          include: { project: { select: { githubRepo: true } } },
        });

        if (sprintForGithub?.githubBranch && sprintForGithub?.project?.githubRepo) {
          const mergeResult = await githubService.mergeSprintToMain(
            sprintForGithub.project.githubRepo,
            sprintForGithub.githubBranch,
            sprintForGithub.name
          );

          if (!mergeResult.success && mergeResult.reason === "conflicts") {
            return res.status(409).json({
              message:
                "No se puede cerrar el sprint porque hay conflictos en GitHub. " +
                "Resuelve los conflictos manualmente y vuelve a intentarlo.",
            });
          }
        }
      } catch (ghError) {
        console.error("[GitHub] Error al hacer merge del sprint:", ghError.message);
      }
    }

    const result = await closeSprint({
      sprintId: id,
      incompleteAction,
      destinationSprintId,
      userId: req.user.sub,
      role: req.user.role,
    });

    logActivity({
      projectId: result.sprint.projectId,
      userId: req.user.sub,
      userFullName: req.user.email || req.user.sub,
      entityType: "sprint",
      entityId: result.sprint.id,
      entityTitle: result.sprint.name,
      action: "closed",
      metadata: {
        incompleteAction,
        migratedTickets: result.migratedTickets,
        cancelledTickets: result.cancelledTickets,
      },
    }).catch(() => {});

    emit("sprint:closed", result.sprint.projectId, { sprint: result.sprint });

    return res.status(200).json({
      message: "Sprint cerrado correctamente",
      ...result,
    });
  } catch (error) {
    return res.status(sprintErrorStatus(error.message)).json({
      message: error.message || "Error al cerrar sprint",
    });
  }
}

module.exports = {
  createSprintController,
  getSprintsByProjectController,
  getSprintByIdController,
  updateSprintController,
  updateSprintStatusController,
  closeSprintController,
  deleteSprintController,
};
