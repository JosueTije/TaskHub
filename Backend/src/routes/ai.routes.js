const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { chatController } = require("../controllers/ai.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Chat con asistente IA sobre el proyecto
 */

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Enviar mensaje al asistente IA del proyecto
 *     tags: [AI]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message, projectId]
 *             properties:
 *               message:
 *                 type: string
 *                 example: ¿Cuáles son los principales riesgos del sprint actual?
 *               projectId:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Respuesta del asistente IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *       403:
 *         description: Solo ADMIN o PM
 */
router.post("/chat", requireAuth, requireRole("ADMIN", "PM"), chatController);

module.exports = router;
