const express = require("express");
const {
  createSprintController,
  getSprintsByProjectController,
  getSprintByIdController,
  updateSprintController,
  updateSprintStatusController,
  closeSprintController,
  deleteSprintController,
} = require("../controllers/sprint.controller");
const { analyzeSrs, confirmSrs } = require("../controllers/srs.controller");
const { upload } = require("../middlewares/upload.middleware");

const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sprints
 *   description: Gestión de sprints y análisis SRS
 */

/**
 * @swagger
 * /sprints/project/{projectId}:
 *   get:
 *     summary: Listar sprints de un proyecto
 *     tags: [Sprints]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de sprints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sprints:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sprint'
 *   post:
 *     summary: Crear sprint en un proyecto
 *     tags: [Sprints]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSprintRequest'
 *     responses:
 *       201:
 *         description: Sprint creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sprint'
 */
router.post("/project/:projectId", requireAuth, requireRole("ADMIN", "PM"), createSprintController);
router.get("/project/:projectId", requireAuth, getSprintsByProjectController);

/**
 * @swagger
 * /sprints/{id}:
 *   get:
 *     summary: Obtener sprint por ID
 *     tags: [Sprints]
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
 *         description: Datos del sprint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sprint'
 *   put:
 *     summary: Actualizar datos del sprint
 *     tags: [Sprints]
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
 *             $ref: '#/components/schemas/CreateSprintRequest'
 *     responses:
 *       200:
 *         description: Sprint actualizado
 *   delete:
 *     summary: Eliminar sprint
 *     tags: [Sprints]
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
 *         description: Sprint eliminado
 */
router.get("/:id", requireAuth, getSprintByIdController);
router.put("/:id", requireAuth, requireRole("ADMIN", "PM"), updateSprintController);
router.delete("/:id", requireAuth, requireRole("ADMIN", "PM"), deleteSprintController);

/**
 * @swagger
 * /sprints/{id}/status:
 *   patch:
 *     summary: Cambiar estado del sprint
 *     tags: [Sprints]
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
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PLANNING, ACTIVE, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch("/:id/status", requireAuth, requireRole("ADMIN", "PM"), updateSprintStatusController);

/**
 * @swagger
 * /sprints/{id}/close:
 *   post:
 *     summary: Cerrar sprint activo
 *     tags: [Sprints]
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
 *         description: Sprint cerrado — tickets no completados se mueven al backlog
 */
router.post("/:id/close", requireAuth, requireRole("ADMIN", "PM"), closeSprintController);

/**
 * @swagger
 * /sprints/{id}/srs/analyze:
 *   post:
 *     summary: Analizar documento SRS con IA para generar tickets
 *     tags: [Sprints]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Documento PDF o DOCX con el SRS
 *     responses:
 *       200:
 *         description: Tickets sugeridos por la IA a partir del documento
 */
router.post("/:id/srs/analyze", requireAuth, requireRole("ADMIN", "PM"), upload.single("file"), analyzeSrs);

/**
 * @swagger
 * /sprints/{id}/srs/confirm:
 *   post:
 *     summary: Confirmar tickets sugeridos por el análisis SRS
 *     tags: [Sprints]
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
 *             type: object
 *             properties:
 *               tickets:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateTicketRequest'
 *     responses:
 *       201:
 *         description: Tickets creados en el sprint
 */
router.post("/:id/srs/confirm", requireAuth, requireRole("ADMIN", "PM"), confirmSrs);

module.exports = router;
