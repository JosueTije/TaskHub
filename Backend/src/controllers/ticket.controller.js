const {
  createTicket,
  getTicketsBySprint,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
} = require("../services/ticket.service");
const { createNotification, notifyProjectAdminsAndPMs } = require("../services/notification.service");
const { logActivity } = require("../services/activity.service");
const prisma = require("../config/prisma");
const githubService = require("../services/github.service");
const { getIO } = require("../config/socket");

function emit(event, projectId, payload) {
  try { getIO()?.to(`project:${projectId}`).emit(event, payload); } catch {}
}

function ticketErrorStatus(msg = "") {
  if (msg.includes("Rol no autorizado") || msg.includes("No tienes permisos")) return 403;
  if (
    msg.includes("no existe") ||
    msg.includes("no encontrado") ||
    msg.includes("archivado") ||
    msg.includes("no tienes acceso") // neutralized — returns 404 not 403
  ) return 404;
  return 400;
}

async function createTicketController(req, res) {
  try {
    const { sprintId } = req.params;

    const { ticket, capacityWarning } = await createTicket({
      sprintId,
      ...req.body,
      userId: req.user.sub,
      role: req.user.role,
    });

    if (ticket.assignedToId && ticket.assignedToId !== req.user.sub) {
      createNotification({
        userId: ticket.assignedToId,
        type: "ticket_assigned",
        title: "Ticket asignado",
        description: `Se te asignó el ticket "${ticket.title}"`,
        projectName: ticket.project?.name ?? null,
      }).catch(() => {});
    }

    logActivity({
      projectId: ticket.projectId,
      userId: req.user.sub,
      userFullName: req.user.email || req.user.sub,
      entityType: "ticket",
      entityId: ticket.id,
      entityTitle: ticket.title,
      action: "created",
    }).catch(() => {});

    emit("ticket:created", ticket.projectId, { ticket });

    return res.status(201).json({
      message: "Ticket creado correctamente",
      ticket,
      capacityWarning,
    });
  } catch (error) {
    return res.status(ticketErrorStatus(error.message)).json({
      message: error.message || "Error al crear ticket",
    });
  }
}

async function getTicketsBySprintController(req, res) {
  try {
    const { sprintId } = req.params;

    const tickets = await getTicketsBySprint({
      sprintId,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json({ tickets });
  } catch (error) {
    return res.status(ticketErrorStatus(error.message)).json({
      message: error.message || "Error al obtener tickets",
    });
  }
}

async function getTicketByIdController(req, res) {
  try {
    const { id } = req.params;

    const ticket = await getTicketById({
      ticketId: id,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json({ ticket });
  } catch (error) {
    return res.status(ticketErrorStatus(error.message)).json({
      message: error.message || "Error al obtener ticket",
    });
  }
}

async function updateTicketController(req, res) {
  try {
    const { id } = req.params;

    const { ticket, capacityWarning } = await updateTicket({
      ticketId: id,
      ...req.body,
      userId: req.user.sub,
      role: req.user.role,
    });

    logActivity({
      projectId: ticket.projectId,
      userId: req.user.sub,
      userFullName: req.user.email || req.user.sub,
      entityType: "ticket",
      entityId: ticket.id,
      entityTitle: ticket.title,
      action: "updated",
    }).catch(() => {});

    emit("ticket:updated", ticket.projectId, { ticket });

    return res.status(200).json({
      message: "Ticket actualizado correctamente",
      ticket,
      capacityWarning,
    });
  } catch (error) {
    return res.status(ticketErrorStatus(error.message)).json({
      message: error.message || "Error al actualizar ticket",
    });
  }
}

async function updateTicketStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status, actualHours } = req.body;

    const ticket = await updateTicketStatus({
      ticketId: id,
      status,
      actualHours,
      userId: req.user.sub,
      role: req.user.role,
    });

    if (status === "DONE") {
      notifyProjectAdminsAndPMs({
        projectId: ticket.projectId,
        type: "ticket_completed",
        title: "Ticket completado",
        description: `"${ticket.title}" fue marcado como completado`,
        projectName: ticket.project?.name ?? null,
        excludeUserId: req.user.sub,
      }).catch(() => {});
    } else if (status === "BLOCKED") {
      notifyProjectAdminsAndPMs({
        projectId: ticket.projectId,
        type: "blocker_added",
        title: "Nuevo bloqueador",
        description: `"${ticket.title}" fue marcado como bloqueado`,
        projectName: ticket.project?.name ?? null,
        excludeUserId: req.user.sub,
      }).catch(() => {});
    }

    // GitHub integration: crear rama del ticket al mover a IN_PROGRESS.
    // Si la rama del sprint no existe en la DB (sprint creado sin conexión),
    // se intenta crearla primero (Caso 4).
    if (status === "IN_PROGRESS" && !ticket.githubBranch) {
      try {
        const sprintWithProject = await prisma.sprint.findUnique({
          where: { id: ticket.sprintId },
          include: { project: { select: { githubRepo: true } } },
        });

        if (sprintWithProject?.project?.githubRepo) {
          let sprintBranch = sprintWithProject.githubBranch;

          // Caso 4: la rama del sprint no existe en la DB
          if (!sprintBranch) {
            try {
              const sprintCount = await prisma.sprint.count({
                where: { projectId: sprintWithProject.projectId },
              });
              sprintBranch = await githubService.createSprintBranch(
                sprintWithProject.project.githubRepo,
                sprintCount,
                sprintWithProject.name
              );
              await prisma.sprint.update({
                where: { id: ticket.sprintId },
                data: { githubBranch: sprintBranch },
              });
            } catch (sprintError) {
              console.error(
                "[GitHub] No se pudo crear la rama del sprint:",
                sprintError.message
              );
              sprintBranch = null;
            }
          }

          if (sprintBranch) {
            const ticketBranch = await githubService.createTicketBranch(
              sprintWithProject.project.githubRepo,
              sprintBranch,
              ticket.id,
              ticket.title
            );
            await prisma.ticket.update({
              where: { id: ticket.id },
              data: { githubBranch: ticketBranch },
            });
            ticket.githubBranch = ticketBranch;
          }
        }
      } catch (ghError) {
        console.error("[GitHub] Error al crear rama del ticket:", ghError.message);
      }
    }

    logActivity({
      projectId: ticket.projectId,
      userId: req.user.sub,
      userFullName: req.user.email || req.user.sub,
      entityType: "ticket",
      entityId: ticket.id,
      entityTitle: ticket.title,
      action: `status_changed_to_${status.toLowerCase()}`,
      metadata: { status },
    }).catch(() => {});

    emit("ticket:updated", ticket.projectId, { ticket });

    return res.status(200).json({
      message: "Estado del ticket actualizado correctamente",
      ticket,
    });
  } catch (error) {
    return res.status(ticketErrorStatus(error.message)).json({
      message: error.message || "Error al actualizar estado del ticket",
    });
  }
}

async function deleteTicketController(req, res) {
  try {
    const { id } = req.params;

    const result = await deleteTicket({
      ticketId: id,
      userId: req.user.sub,
      role: req.user.role,
    });

    emit("ticket:deleted", result.projectId, { ticketId: id, projectId: result.projectId });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(ticketErrorStatus(error.message)).json({
      message: error.message || "Error al eliminar ticket",
    });
  }
}

module.exports = {
  createTicketController,
  getTicketsBySprintController,
  getTicketByIdController,
  updateTicketController,
  updateTicketStatusController,
  deleteTicketController,
};
