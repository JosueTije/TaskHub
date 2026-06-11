const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskHub API",
      version: "1.0.0",
      description:
        "API REST para TaskHub — gestión ágil de proyectos de software con sprints, tickets, analíticas e IA.",
    },
    servers: [
      { url: "http://localhost:4000", description: "Local" },
      { url: "https://taskhub-vb6l.onrender.com", description: "Producción" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────────
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@taskhub.com" },
            password: { type: "string", example: "Admin123!" },
          },
        },
        OtpRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "string", example: "123456" },
          },
        },
        SetPasswordRequest: {
          type: "object",
          required: ["password"],
          properties: {
            password: { type: "string", example: "NewPass123!" },
          },
        },
        // ── User ─────────────────────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            fullName: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["ADMIN", "PM", "DEVELOPER"] },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateUserRequest: {
          type: "object",
          required: ["fullName", "email", "role"],
          properties: {
            fullName: { type: "string", example: "Juan Pérez" },
            email: { type: "string", format: "email", example: "juan@empresa.com" },
            role: { type: "string", enum: ["ADMIN", "PM", "DEVELOPER"] },
          },
        },
        // ── Project ──────────────────────────────────────────────────────────
        Project: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            code: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"] },
            riskLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
            startDate: { type: "string", format: "date" },
            targetEndDate: { type: "string", format: "date" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateProjectRequest: {
          type: "object",
          required: ["name", "code"],
          properties: {
            name: { type: "string", example: "Sistema de Facturación" },
            code: { type: "string", example: "SFAC" },
            description: { type: "string" },
            pmId: { type: "string" },
            riskLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "LOW" },
            startDate: { type: "string", format: "date" },
            targetEndDate: { type: "string", format: "date" },
            memberIds: { type: "array", items: { type: "string" } },
          },
        },
        // ── Sprint ───────────────────────────────────────────────────────────
        Sprint: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            status: { type: "string", enum: ["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"] },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            capacity: { type: "number" },
            projectId: { type: "string" },
          },
        },
        CreateSprintRequest: {
          type: "object",
          required: ["name", "startDate", "endDate"],
          properties: {
            name: { type: "string", example: "Sprint 1" },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            capacity: { type: "number", example: 80 },
          },
        },
        // ── Ticket ───────────────────────────────────────────────────────────
        Ticket: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"] },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
            storyPoints: { type: "integer" },
            estimatedHours: { type: "number" },
            actualHours: { type: "number" },
            sprintId: { type: "string" },
            projectId: { type: "string" },
            assignedToId: { type: "string", nullable: true },
          },
        },
        CreateTicketRequest: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", example: "Implementar módulo de login" },
            description: { type: "string" },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
            storyPoints: { type: "integer", example: 5 },
            estimatedHours: { type: "number", example: 8 },
            assignedToId: { type: "string" },
            startDate: { type: "string", format: "date" },
            dueDate: { type: "string", format: "date" },
          },
        },
        UpdateTicketStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"] },
            actualHours: { type: "number", example: 6.5 },
          },
        },
        // ── Notification ─────────────────────────────────────────────────────
        Notification: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            read: { type: "boolean" },
            projectName: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Error ────────────────────────────────────────────────────────────
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
