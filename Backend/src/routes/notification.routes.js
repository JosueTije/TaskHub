const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
} = require("../controllers/notification.controller");

router.get("/", requireAuth, getNotificationsController);
router.patch("/read-all", requireAuth, markAllAsReadController);
router.patch("/:id/read", requireAuth, markAsReadController);
router.delete("/:id", requireAuth, deleteNotificationController);

module.exports = router;
