const express = require("express");

const {
  createTicketController,
  getTicketsBySprintController,
  getTicketByIdController,
  updateTicketController,
  updateTicketStatusController,
  deleteTicketController,
} = require("../controllers/ticket.controller");

const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Gestión de tickets (tareas del sprint)
 */

/**
 * @swagger
 * /tickets/sprint/{sprintId}:
 *   get:
 *     summary: Listar tickets de un sprint
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *   post:
 *     summary: Crear ticket en un sprint
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketRequest'
 *     responses:
 *       201:
 *         description: Ticket creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       403:
 *         description: Solo ADMIN o PM
 */
router.post("/sprint/:sprintId", requireAuth, requireRole("ADMIN", "PM"), createTicketController);
router.get("/sprint/:sprintId", requireAuth, getTicketsBySprintController);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Obtener ticket por ID
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del ticket
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *   put:
 *     summary: Actualizar datos del ticket
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketRequest'
 *     responses:
 *       200:
 *         description: Ticket actualizado
 *       403:
 *         description: Solo ADMIN o PM
 *   delete:
 *     summary: Eliminar ticket
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket eliminado
 *       403:
 *         description: Solo ADMIN o PM
 */
router.get("/:id", requireAuth, getTicketByIdController);
router.put("/:id", requireAuth, requireRole("ADMIN", "PM"), updateTicketController);
router.delete("/:id", requireAuth, requireRole("ADMIN", "PM"), deleteTicketController);

/**
 * @swagger
 * /tickets/{id}/status:
 *   patch:
 *     summary: Actualizar estado del ticket
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTicketStatusRequest'
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       403:
 *         description: DEVELOPER solo puede asignar IN_PROGRESS o BLOCKED
 */
router.patch("/:id/status", requireAuth, updateTicketStatusController);

module.exports = router;
