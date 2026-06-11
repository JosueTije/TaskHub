const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const {
  getProjectDashboardController,
  getProjectMetricsController,
  getSprintKpisController,
} = require("../controllers/analytics.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Métricas y analíticas de proyectos y sprints
 */

/**
 * @swagger
 * /analytics/project/{projectId}/dashboard:
 *   get:
 *     summary: Dashboard principal del proyecto
 *     tags: [Analytics]
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
 *         description: Métricas del sprint activo, progreso, burndown y datos del equipo
 */
router.get("/project/:projectId/dashboard", requireAuth, getProjectDashboardController);

/**
 * @swagger
 * /analytics/project/{projectId}/metrics:
 *   get:
 *     summary: Métricas históricas del proyecto
 *     tags: [Analytics]
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
 *         description: Velocidad, historial de progreso, métricas del equipo y distribución por prioridad
 */
router.get("/project/:projectId/metrics", requireAuth, getProjectMetricsController);

/**
 * @swagger
 * /analytics/project/{projectId}/sprint/{sprintId}/kpis:
 *   get:
 *     summary: KPIs de un sprint específico
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KPIs del sprint (velocidad, completion rate, story points, varianza)
 */
router.get("/project/:projectId/sprint/:sprintId/kpis", requireAuth, getSprintKpisController);

module.exports = router;
