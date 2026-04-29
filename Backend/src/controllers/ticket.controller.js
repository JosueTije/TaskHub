const {
  createTicket,
  getTicketsBySprint,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
} = require("../services/ticket.service");

async function createTicketController(req, res) {
  try {
    const { sprintId } = req.params;

    const ticket = await createTicket({
      sprintId,
      ...req.body,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(201).json({
      message: "Ticket creado correctamente",
      ticket,
    });
  } catch (error) {
    return res.status(400).json({
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

    return res.status(200).json({
      tickets,
    });
  } catch (error) {
    return res.status(400).json({
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

    return res.status(200).json({
      ticket,
    });
  } catch (error) {
    return res.status(404).json({
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
    return res.status(400).json({
      message: error.message || "Error al actualizar ticket",
    });
  }
}

async function updateTicketStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await updateTicketStatus({
      ticketId: id,
      status,
      userId: req.user.sub,
      role: req.user.role,
    });

    return res.status(200).json({
      message: "Estado del ticket actualizado correctamente",
      ticket,
    });
  } catch (error) {
    return res.status(400).json({
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
    return res.status(400).json({
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