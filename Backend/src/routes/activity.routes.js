const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { getProjectActivityController } = require("../controllers/activity.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activity
 *   description: Historial de actividad de proyectos
 */

/**
 * @swagger
 * /activity/projects/{projectId}/activity:
 *   get:
 *     summary: Historial de actividad reciente del proyecto
 *     tags: [Activity]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número máximo de eventos a devolver
 *     responses:
 *       200:
 *         description: Lista de eventos de actividad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get("/projects/:projectId/activity", requireAuth, getProjectActivityController);

module.exports = router;
