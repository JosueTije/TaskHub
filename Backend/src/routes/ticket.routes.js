const express = require("express");

const {
  createTicketController,
  getTicketsBySprintController,
  getTicketByIdController,
  updateTicketController,
  updateTicketStatusController,
  deleteTicketController,
} = require("../controllers/ticket.controller");

const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
  "/sprint/:sprintId",
  requireAuth,
  requireRole("ADMIN", "PM"),
  createTicketController
);

router.get(
  "/sprint/:sprintId",
  requireAuth,
  getTicketsBySprintController
);

router.get(
  "/:id",
  requireAuth,
  getTicketByIdController
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PM"),
  updateTicketController
);

router.patch(
  "/:id/status",
  requireAuth,
  updateTicketStatusController
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PM"),
  deleteTicketController
);

module.exports = router;