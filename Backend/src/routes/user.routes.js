const express = require("express");
const { getUsersController, addProjectMember, getDevelopers, updateUserController, deleteUserController, updateUserStatusController, resetUserPasswordController, getUserMetricsController } = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Solo ADMIN
 */
router.get("/", requireAuth, requireRole("ADMIN"), getUsersController);

/**
 * @swagger
 * /users/developers:
 *   get:
 *     summary: Listar desarrolladores disponibles
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios con rol DEVELOPER
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 developers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get("/developers", requireAuth, requireRole("ADMIN", "PM"), getDevelopers);

/**
 * @swagger
 * /users/{userId}:
 *   patch:
 *     summary: Actualizar datos de un usuario
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, PM, DEVELOPER]
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       403:
 *         description: Solo ADMIN
 *       404:
 *         description: Usuario no encontrado
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       403:
 *         description: Solo ADMIN
 */
router.patch("/:userId", requireAuth, requireRole("ADMIN"), updateUserController);
router.delete("/:userId", requireAuth, requireRole("ADMIN"), deleteUserController);

/**
 * @swagger
 * /users/{userId}/status:
 *   patch:
 *     summary: Activar o desactivar usuario
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch("/:userId/status", requireAuth, requireRole("ADMIN"), updateUserStatusController);

/**
 * @swagger
 * /users/{userId}/reset-password:
 *   post:
 *     summary: Resetear contraseña de un usuario (admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Se envía nuevo OTP al correo del usuario
 */
router.post("/:userId/reset-password", requireAuth, requireRole("ADMIN"), resetUserPasswordController);

/**
 * @swagger
 * /users/{userId}/metrics:
 *   get:
 *     summary: Obtener métricas de productividad de un usuario
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Métricas del usuario (tickets completados, horas, rendimiento)
 */
router.get("/:userId/metrics", requireAuth, requireRole("ADMIN"), getUserMetricsController);

router.post("/:projectId/members", requireAuth, addProjectMember);

module.exports = router;
