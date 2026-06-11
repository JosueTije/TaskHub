const express = require("express");
const { createUser } = require("../controllers/admin.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Operaciones exclusivas de administrador
 */

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuario creado — se envía OTP por correo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos o email ya registrado
 *       403:
 *         description: Sin permisos de administrador
 */
router.post("/users", requireAuth, requireRole("ADMIN"), createUser);

module.exports = router;
