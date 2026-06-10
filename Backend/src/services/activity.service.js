const prisma = require("../config/prisma");

async function logActivity({
  projectId,
  userId,
  userFullName,
  entityType,
  entityId,
  entityTitle,
  action,
  metadata,
}) {
  return prisma.activityLog.create({
    data: {
      projectId,
      userId,
      userFullName,
      entityType,
      entityId,
      entityTitle: entityTitle || null,
      action,
      metadata: metadata || null,
    },
  });
}

async function getProjectActivity({ projectId, userId, role, limit = 50 }) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId, leftAt: null } } },
  });

  if (!project) throw new Error("Proyecto no encontrado");

  if (role !== "ADMIN") {
    const hasAccess =
      project.pmId === userId ||
      project.createdById === userId ||
      project.members.length > 0;
    if (!hasAccess) throw new Error("No tienes acceso a este proyecto");
  }

  const activities = await prisma.activityLog.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(limit), 100),
  });

  return activities;
}

module.exports = { logActivity, getProjectActivity };
