const prisma = require("../config/prisma");
const { getIO } = require("../config/socket");

function emitToUser(userId, notification) {
  try { getIO()?.to(`user:${userId}`).emit("notification:new", { notification }); } catch {}
}

async function createNotification({ userId, type, title, description, projectName = null }) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, description, projectName },
  });
  emitToUser(userId, notification);
  return notification;
}

async function notifyProjectAdminsAndPMs({ projectId, type, title, description, projectName, excludeUserId }) {
  const members = await prisma.projectMember.findMany({
    where: {
      projectId,
      leftAt: null,
      user: { role: { in: ["ADMIN", "PM"] }, deletedAt: null },
    },
    select: { userId: true },
  });

  const targets = members.map((m) => m.userId).filter((id) => id !== excludeUserId);
  if (!targets.length) return;

  await prisma.notification.createMany({
    data: targets.map((userId) => ({ userId, type, title, description, projectName })),
  });

  // notify each target in real-time
  targets.forEach((userId) =>
    emitToUser(userId, { userId, type, title, description, projectName, read: false, createdAt: new Date().toISOString() })
  );
}

async function getNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

async function markAsRead(id, userId) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

async function deleteNotification(id, userId) {
  return prisma.notification.deleteMany({
    where: { id, userId },
  });
}

module.exports = {
  createNotification,
  notifyProjectAdminsAndPMs,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
