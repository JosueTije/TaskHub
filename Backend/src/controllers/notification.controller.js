const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../services/notification.service");

async function getNotificationsController(req, res) {
  try {
    const notifications = await getNotifications(req.user.sub);
    res.json({ notifications });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
}

async function markAsReadController(req, res) {
  try {
    await markAsRead(req.params.id, req.user.sub);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error al marcar notificación" });
  }
}

async function markAllAsReadController(req, res) {
  try {
    await markAllAsRead(req.user.sub);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error al marcar notificaciones" });
  }
}

async function deleteNotificationController(req, res) {
  try {
    await deleteNotification(req.params.id, req.user.sub);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar notificación" });
  }
}

module.exports = {
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
};
