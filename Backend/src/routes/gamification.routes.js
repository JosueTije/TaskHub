const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth.middleware");
const { leaderboardController, projectGamificationController } = require("../controllers/gamification.controller");

/**
 * @swagger
 * tags:
 *   name: Gamification
 *   description: Ranking y puntos de gamificación
 */

/**
 * @swagger
 * /gamification/leaderboard:
 *   get:
 *     summary: Tabla de clasificación global de desarrolladores
 *     tags: [Gamification]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios ordenada por puntos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       points:
 *                         type: integer
 *                       rank:
 *                         type: integer
 */
router.get("/leaderboard", requireAuth, leaderboardController);

/**
 * @swagger
 * /gamification/project/{projectId}:
 *   get:
 *     summary: Puntos de gamificación por proyecto
 *     tags: [Gamification]
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
 *         description: Puntos y logros del equipo en el proyecto
 */
router.get("/project/:projectId", requireAuth, projectGamificationController);

module.exports = router;
