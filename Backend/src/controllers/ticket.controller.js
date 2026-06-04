const {
  createTicket,
  getTicketsBySprint,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
} = require("../services/ticket.service");
const { createNotification, notifyProjectAdminsAndPMs } = require("../services/notification.service");

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

    const ticket = await createTicket({
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

    return res.status(201).json({
      message: "Ticket creado correctamente",
      ticket,
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

    const ticket = await updateTicket({
      ticketId: id,
      ...req.body,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json({
      message: "Ticket actualizado correctamente",
      ticket,
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
