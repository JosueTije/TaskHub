const express = require("express");
const router = express.Router();
const {
  loginController,
  verifyOtpController,
  setNewPasswordController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  resendOtpController,
} = require("../controllers/auth.controller");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y gestión de sesión
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso — devuelve token OTP o acceso directo
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", loginController);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verificar código OTP de primer acceso
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpRequest'
 *     responses:
 *       200:
 *         description: OTP válido — devuelve token para establecer contraseña
 *       401:
 *         description: OTP inválido o expirado
 */
router.post("/verify-otp", verifyOtpController);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Reenviar código OTP al correo
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP reenviado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.post("/resend-otp", resendOtpController);

/**
 * @swagger
 * /auth/set-password:
 *   post:
 *     summary: Establecer contraseña en primer acceso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetPasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña establecida y sesión iniciada
 *       400:
 *         description: Contraseña no cumple requisitos de seguridad
 */
router.post("/set-password", setNewPasswordController);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada — cookie eliminada
 */
router.post("/logout", logoutController);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar enlace de recuperación de contraseña
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado
 */
router.post("/forgot-password", forgotPasswordController);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token de recuperación
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: NewPass123!
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post("/reset-password", resetPasswordController);

module.exports = router;
