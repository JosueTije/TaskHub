const express = require("express");
const {
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
} = require("../controllers/project.controller");
const { getProjectBranchesController } = require("../controllers/branches.controller");
const {
  getAiContextController,
  executiveSummaryController,
  riskAnalysisController,
  riskAnalysisPdfController,
} = require("../controllers/ai-analysis.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Gestión de proyectos
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Listar proyectos del usuario autenticado
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *   post:
 *     summary: Crear nuevo proyecto
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Proyecto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       403:
 *         description: Solo ADMIN o PM
 */
router.get("/", requireAuth, getProjectsController);
router.post("/", requireAuth, requireRole("ADMIN", "PM"), createProjectController);

/**
 * @swagger
 * /projects/archived:
 *   get:
 *     summary: Listar proyectos archivados
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get("/archived", requireAuth, requireRole("ADMIN", "PM"), getArchivedProjectsController);

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Obtener proyecto por ID
 *     tags: [Projects]
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
 *         description: Datos del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Proyecto no encontrado
 *   put:
 *     summary: Actualizar proyecto
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 */
router.get("/:projectId", requireAuth, getProjectByIdController);
router.put("/:projectId", requireAuth, requireRole("ADMIN", "PM"), updateProjectController);

/**
 * @swagger
 * /projects/{projectId}/status:
 *   patch:
 *     summary: Cambiar estado del proyecto
 *     tags: [Projects]
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
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, ON_HOLD, COMPLETED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch("/:projectId/status", requireAuth, requireRole("ADMIN", "PM"), updateProjectStatusController);

/**
 * @swagger
 * /projects/{projectId}/members:
 *   post:
 *     summary: Agregar miembro al proyecto
 *     tags: [Projects]
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
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Miembro agregado
 */
router.post("/:projectId/members", requireAuth, addProjectMemberController);

/**
 * @swagger
 * /projects/{projectId}/members/{userId}:
 *   delete:
 *     summary: Remover miembro del proyecto
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembro removido
 */
router.delete("/:projectId/members/:userId", requireAuth, requireRole("ADMIN", "PM"), removeProjectMemberController);

/**
 * @swagger
 * /projects/{projectId}/github/setup:
 *   post:
 *     summary: Configurar integración con GitHub
 *     tags: [Projects]
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
 *             type: object
 *             required: [repoUrl]
 *             properties:
 *               repoUrl:
 *                 type: string
 *                 example: https://github.com/org/repo
 *     responses:
 *       200:
 *         description: GitHub configurado — devuelve webhook URL y secret
 */
router.post("/:projectId/github/setup", requireAuth, requireRole("ADMIN", "PM"), setupProjectGithubController);

/**
 * @swagger
 * /projects/{projectId}/branches:
 *   get:
 *     summary: Listar branches de GitHub del proyecto
 *     tags: [Projects]
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
 *         description: Lista de branches
 */
router.get("/:projectId/branches", requireAuth, getProjectBranchesController);

/**
 * @swagger
 * /projects/{projectId}/history:
 *   get:
 *     summary: Historial de cambios del proyecto
 *     tags: [Projects]
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
 *         description: Lista de eventos históricos del proyecto
 */
router.get("/:projectId/history", requireAuth, requireRole("ADMIN", "PM"), getArchivedProjectHistoryController);

/**
 * @swagger
 * /projects/{projectId}/ai-context:
 *   get:
 *     summary: Obtener contexto del proyecto para análisis IA
 *     tags: [Projects]
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
 *         description: Contexto estructurado del proyecto (sprints, tickets, métricas)
 */
router.get("/:projectId/ai-context", requireAuth, requireRole("ADMIN", "PM"), getAiContextController);

/**
 * @swagger
 * /projects/{projectId}/ai/executive-summary:
 *   post:
 *     summary: Generar resumen ejecutivo con IA
 *     tags: [Projects]
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
 *         description: Resumen ejecutivo generado
 */
router.post("/:projectId/ai/executive-summary", requireAuth, requireRole("ADMIN", "PM"), executiveSummaryController);

/**
 * @swagger
 * /projects/{projectId}/ai/risk-analysis:
 *   post:
 *     summary: Generar análisis de riesgos con IA
 *     tags: [Projects]
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
 *         description: Análisis de riesgos generado
 */
router.post("/:projectId/ai/risk-analysis", requireAuth, requireRole("ADMIN", "PM"), riskAnalysisController);

/**
 * @swagger
 * /projects/{projectId}/ai/risk-analysis/pdf:
 *   post:
 *     summary: Exportar análisis de riesgos en PDF
 *     tags: [Projects]
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
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post("/:projectId/ai/risk-analysis/pdf", requireAuth, requireRole("ADMIN", "PM"), riskAnalysisPdfController);

module.exports = router;
