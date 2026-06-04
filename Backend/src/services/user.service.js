const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/password");
const crypto = require("crypto");

const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  avatarUrl: true,
  status: true,
};

async function getActiveUsers({ page = 1, limit = 20, search = "" } = {}) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const where = {
    status: { in: ["ACTIVE", "PENDING_SETUP"] },
    deletedAt: null,
    ...(search.trim()
      ? {
          OR: [
            { fullName: { contains: search.trim(), mode: "insensitive" } },
            { email: { contains: search.trim(), mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: { fullName: "asc" },
      skip,
      take: safeLimit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

async function updateUser({ userId, fullName, role }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new Error("Usuario no encontrado");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(role !== undefined && { role }),
    },
    select: USER_SELECT,
  });
  return updated;
}

async function deleteUser({ userId, currentUserId }) {
  if (userId === currentUserId) throw new Error("No puedes eliminarte a ti mismo");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new Error("Usuario no encontrado");

  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", deletedAt: null },
    });
    if (adminCount <= 1) throw new Error("No puedes eliminar el único administrador del sistema");
  }

  await prisma.user.delete({ where: { id: userId } });
}

async function updateUserStatus({ userId, currentUserId, status }) {
  if (userId === currentUserId) throw new Error("No puedes cambiar el estado de tu propia cuenta");

  const allowed = ["ACTIVE", "INACTIVE"];
  if (!allowed.includes(status)) throw new Error("Estado inválido");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new Error("Usuario no encontrado");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: USER_SELECT,
  });
  return updated;
}

async function resetUserPassword({ userId }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new Error("Usuario no encontrado");

  const newPassword = crypto.randomBytes(8).toString("base64").slice(0, 12) + "!";
  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: true },
  });

  return { temporaryPassword: newPassword };
}

async function getUserMetrics({ userId }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, role: true },
  });
  if (!user) throw new Error("Usuario no encontrado");

  const memberships = await prisma.projectMember.findMany({
    where: { userId, leftAt: null },
    select: { projectId: true },
  });
  const projectIds = memberships.map((m) => m.projectId);

  const allTickets = await prisma.ticket.findMany({
    where: { assignedToId: userId },
    select: {
      id: true,
      status: true,
      priority: true,
      storyPoints: true,
      estimatedHours: true,
      actualHours: true,
      completedAt: true,
    },
  });

  const doneTickets = allTickets.filter((t) => t.status === "DONE");
  const inProgressTickets = allTickets.filter((t) =>
    ["IN_PROGRESS", "IN_REVIEW"].includes(t.status)
  );
  const blockedTickets = allTickets.filter((t) => t.status === "BLOCKED");

  const totalStoryPoints = allTickets.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const completedStoryPoints = doneTickets.reduce((s, t) => s + (t.storyPoints || 0), 0);

  const { PRIORITY_POINTS, ticketScore } = require("../utils/scoring");
  const points = doneTickets.reduce((s, t) => s + ticketScore(t), 0);

  const sprintsParticipated = await prisma.sprint.count({
    where: {
      projectId: { in: projectIds },
      tickets: { some: { assignedToId: userId } },
    },
  });

  return {
    projectsAssigned: projectIds.length,
    totalTickets: allTickets.length,
    completedTickets: doneTickets.length,
    inProgressTickets: inProgressTickets.length,
    blockedTickets: blockedTickets.length,
    totalStoryPoints,
    completedStoryPoints,
    points,
    sprintsParticipated,
    performance:
      allTickets.length > 0
        ? Math.round((doneTickets.length / allTickets.length) * 100)
        : 0,
  };
}

module.exports = {
  getActiveUsers,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  getUserMetrics,
};
