const prisma = require("../config/prisma");
const { PRIORITY_POINTS, ticketScore } = require("../utils/scoring");

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function daysBetween(start, end) {
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

async function checkProjectAccess({ projectId, userId, role }) {
  if (role === "ADMIN") return;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId, leftAt: null } } },
  });

  if (!project) throw new Error("Proyecto no encontrado");

  const hasAccess =
    project.pmId === userId ||
    project.createdById === userId ||
    project.members.length > 0;

  if (!hasAccess) throw new Error("No tienes acceso a este proyecto");
}

async function getProjectDashboard({ projectId, userId, role }) {
  await checkProjectAccess({ projectId, userId, role });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  const sprints = await prisma.sprint.findMany({
    where: { projectId },
    orderBy: { startDate: "asc" },
  });

  const tickets = await prisma.ticket.findMany({
    where: { projectId },
    include: {
      assignedTo: true,
    },
  });

  const members = await prisma.projectMember.findMany({
    where: {
      projectId,
      leftAt: null,
    },
    include: {
      user: true,
    },
  });

  const today = new Date();

  // ===============================
  // Basic Counters
  // ===============================
  const blocked = tickets.filter(
    (ticket) => ticket.status === "BLOCKED"
  ).length;

  const delayedTickets = tickets.filter((ticket) => {
    if (!ticket.dueDate) return false;

    return (
      new Date(ticket.dueDate) < today &&
      !["DONE", "CANCELLED"].includes(ticket.status)
    );
  }).length;

  // ===============================
  // Story Points Progress
  // ===============================
  const totalStoryPoints = tickets.reduce(
    (sum, ticket) => sum + (ticket.storyPoints || 0),
    0
  );

  const completedTickets = tickets.filter((t) => t.status === "DONE");

  const completedStoryPoints = completedTickets.reduce(
    (sum, ticket) => sum + (ticket.storyPoints || 0),
    0
  );

  // Fallback to ticket count ratio when no story points are defined
  const progress = totalStoryPoints
    ? Math.round((completedStoryPoints / totalStoryPoints) * 100)
    : tickets.length
    ? Math.round((completedTickets.length / tickets.length) * 100)
    : 0;

  // ===============================
  // Hours Metrics (symmetric: only DONE tickets for both sides)
  // ===============================
  const estimatedHours = completedTickets.reduce(
    (sum, ticket) => sum + (ticket.estimatedHours || 0),
    0
  );

  const actualHours = completedTickets.reduce(
    (sum, ticket) => sum + (ticket.actualHours || 0),
    0
  );

  const hoursVariance = actualHours - estimatedHours;

const efficiency =
  actualHours > 0
    ? Number((estimatedHours / actualHours).toFixed(2))
    : null;

  // ===============================
  // Planned Progress by Dates
  // ===============================
  let plannedProgress = 0;

  if (project?.startDate && project?.targetEndDate) {
    const start = new Date(project.startDate);
    const end = new Date(project.targetEndDate);

    const totalDays = Math.max(
      1,
      daysBetween(start, end)
    );

    const elapsedDays = daysBetween(start, today);

    plannedProgress = clamp(
      Math.round(
        (elapsedDays / totalDays) * 100
      ),
      0,
      100
    );
  }

const scheduleVariance =
  tickets.length === 0
    ? 0
    : progress - plannedProgress;

const hasWorkStarted = completedStoryPoints > 0;

const spi =
  hasWorkStarted && plannedProgress > 0
    ? Number((progress / plannedProgress).toFixed(2))
    : 1;

  // ===============================
  // Risk
  // ===============================
  let risk = "LOW";

  if (
    delayedTickets >= 3 ||
    blocked >= 3 ||
    spi < 0.8
  ) {
    risk = "HIGH";
  } else if (
    delayedTickets >= 1 ||
    blocked >= 1 ||
    spi < 1
  ) {
    risk = "MEDIUM";
  }

  // ===============================
  // Progress History by Sprint
  // ===============================
  let completedAccum = 0;

  const progressHistory = sprints.map(
    (sprint, index) => {
      const sprintTickets = tickets.filter(
        (ticket) =>
          ticket.sprintId === sprint.id
      );

      const sprintCompleted =
        sprintTickets
          .filter(
            (ticket) =>
              ticket.status === "DONE"
          )
          .reduce(
            (sum, ticket) =>
              sum +
              (ticket.storyPoints || 0),
            0
          );

      completedAccum += sprintCompleted;

      const actual = totalStoryPoints
        ? Math.round(
            (completedAccum /
              totalStoryPoints) *
              100
          )
        : 0;

      const planned = sprints.length
        ? Math.round(
            ((index + 1) /
              sprints.length) *
              100
          )
        : 0;

      return {
        date: sprint.name,
        planned,
        actual,
      };
    }
  );

  // ===============================
  // Team Metrics
  // ===============================
  const teamMetrics = members.map(
    (member) => {
      const userTickets = tickets.filter(
        (ticket) =>
          ticket.assignedToId ===
          member.userId
      );

      const userEstimated =
        userTickets.reduce(
          (sum, ticket) =>
            sum +
            (ticket.estimatedHours ||
              0),
          0
        );

      const userActual = userTickets
        .filter(
          (ticket) =>
            ticket.status === "DONE"
        )
        .reduce(
          (sum, ticket) =>
            sum +
            (ticket.actualHours || 0),
          0
        );

      const userStoryTotal =
        userTickets.reduce(
          (sum, ticket) =>
            sum +
            (ticket.storyPoints || 0),
          0
        );

      const userStoryDone =
        userTickets
          .filter(
            (ticket) =>
              ticket.status === "DONE"
          )
          .reduce(
            (sum, ticket) =>
              sum +
              (ticket.storyPoints || 0),
            0
          );

      const performance =
        userStoryTotal > 0
          ? Math.round(
              (userStoryDone /
                userStoryTotal) *
                100
            )
          : 0;

      return {
        id: member.user.id,
        name: member.user.fullName,
        tasksAssigned:
          userTickets.length,
        performance,
        estimatedHours:
          userEstimated,
        actualHours: userActual,
        status: "Active",
      };
    }
  );

  return {
    kpis: {
      progress,
      plannedProgress,
      completedStoryPoints,
      totalStoryPoints,

      blockedTickets: blocked,
      delayedMilestones:
        delayedTickets,

      scheduleVariance,
      spi,
      risk,
      officialRiskLevel: project?.riskLevel ?? null,

      estimatedHours,
      actualHours,
      hoursVariance,
      efficiency,
    },

    progressHistory,

    teamMetrics,
  };
}

// =========================================================
// Extended metrics for the Metrics page
// =========================================================


function computeBurndown(sprint, tickets) {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const today = new Date();
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const totalSP = tickets.reduce((s, t) => s + (t.storyPoints || 0), 0);

  const result = [];
  for (let i = 0; i < totalDays; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);
    if (dayDate > today && i > 0) break;

    const completedSP = tickets
      .filter((t) => t.status === "DONE" && t.completedAt && new Date(t.completedAt) <= dayDate)
      .reduce((s, t) => s + (t.storyPoints || 0), 0);

    result.push({
      day: `D${i + 1}`,
      remaining: Math.max(0, totalSP - completedSP),
      ideal: Math.max(0, Math.round(totalSP - (totalSP / totalDays) * i)),
      completed: completedSP,
    });
  }
  return result;
}

async function getProjectMetrics({ projectId, userId, role }) {
  const base = await getProjectDashboard({ projectId, userId, role });

  const sprints = await prisma.sprint.findMany({
    where: { projectId },
    orderBy: { startDate: "asc" },
    include: {
      tickets: {
        include: { assignedTo: { select: { id: true, fullName: true } } },
      },
    },
  });

  const allTickets = sprints.flatMap((s) => s.tickets);

  // Velocity history: story points done per sprint
  const velocityHistory = sprints.map((s) => {
    const done = s.tickets
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const commitment = s.capacity || s.tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    return { sprint: s.name, velocity: done, commitment };
  });

  // Active sprint details
  const activeSprint = sprints.find((s) => s.status === "ACTIVE") ?? null;
  let activeSprintData = null;
  if (activeSprint) {
    const st = activeSprint.tickets;
    const start = new Date(activeSprint.startDate);
    const end = new Date(activeSprint.endDate);
    const today = new Date();
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const rawDaysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, rawDaysRemaining);
    const isExpired = rawDaysRemaining < 0;
    const daysOverdue = isExpired ? Math.abs(rawDaysRemaining) : 0;

    const ticketsByPriority = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((priority) => {
      const p = st.filter((t) => t.priority === priority);
      return { priority, completed: p.filter((t) => t.status === "DONE").length, total: p.length };
    }).filter((p) => p.total > 0);

    const devMap = new Map();
    for (const t of st) {
      if (!t.assignedTo) continue;
      const name = t.assignedTo.fullName.split(" ")[0];
      if (!devMap.has(name)) devMap.set(name, { name, completed: 0, inProgress: 0 });
      const d = devMap.get(name);
      if (t.status === "DONE") d.completed++;
      else if (["IN_PROGRESS", "IN_REVIEW"].includes(t.status)) d.inProgress++;
    }

    activeSprintData = {
      id: activeSprint.id,
      name: activeSprint.name,
      daysRemaining,
      isExpired,
      daysOverdue,
      totalDays,
      capacity: activeSprint.capacity,
      ticketCounts: {
        total: st.length,
        done: st.filter((t) => t.status === "DONE").length,
        inProgress: st.filter((t) => ["IN_PROGRESS", "IN_REVIEW"].includes(t.status)).length,
        blocked: st.filter((t) => t.status === "BLOCKED").length,
        todo: st.filter((t) => t.status === "TODO").length,
        cancelled: st.filter((t) => t.status === "CANCELLED").length,
      },
      burndown: computeBurndown(activeSprint, st),
      ticketsByPriority,
      teamPerformance: [...devMap.values()],
    };
  }

  // Extended team metrics per member
  const members = await prisma.projectMember.findMany({
    where: { projectId, leftAt: null },
    include: { user: { select: { id: true, fullName: true } } },
  });

  const now = new Date();
  const teamMetrics = members.filter((m) => m.user).map((m) => {
    const myTickets = allTickets.filter((t) => t.assignedToId === m.userId);
    const myDone = myTickets.filter((t) => t.status === "DONE");
    const myBlocked = myTickets.filter((t) => t.status === "BLOCKED");

    const withEst = myDone.filter((t) => t.estimatedHours != null && t.actualHours != null);
    const accurate = withEst.filter((t) => t.actualHours <= t.estimatedHours * 1.15);
    const estimationAccuracy = withEst.length > 0 ? Math.round((accurate.length / withEst.length) * 100) : null;

    const points = myDone.reduce((s, t) => s + ticketScore(t), 0);

    const priorityDistribution = [
      { name: "Critical", value: myDone.filter((t) => t.priority === "CRITICAL").length, color: "#FF3B30" },
      { name: "High", value: myDone.filter((t) => t.priority === "HIGH").length, color: "#FF9F0A" },
      { name: "Medium", value: myDone.filter((t) => t.priority === "MEDIUM").length, color: "#007AFF" },
      { name: "Low", value: myDone.filter((t) => t.priority === "LOW").length, color: "#34C759" },
    ].filter((p) => p.value > 0);

    const weeklyEvolution = Array.from({ length: 4 }, (_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (3 - i) * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 7);
      const wt = myDone.filter(
        (t) => t.completedAt && new Date(t.completedAt) >= weekStart && new Date(t.completedAt) < weekEnd
      );
      return {
        week: `Sem ${i + 1}`,
        tickets: wt.length,
        points: wt.reduce((s, t) => s + ticketScore(t), 0),
      };
    });

    const recentTickets = [...myTickets]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5)
      .map((t) => ({
        id: t.id.slice(0, 7).toUpperCase(),
        title: t.title,
        priority: t.priority,
        status: t.status,
        estimatedHours: t.estimatedHours,
        actualHours: t.actualHours,
      }));

    return {
      id: m.userId,
      name: m.user.fullName,
      tasksAssigned: myTickets.length,
      ticketsCompleted: myDone.length,
      activeBlockers: myBlocked.length,
      estimationAccuracy,
      points,
      performance: myTickets.length > 0 ? Math.round((myDone.length / myTickets.length) * 100) : 0,
      priorityDistribution,
      weeklyEvolution,
      recentTickets,
    };
  });

  return {
    kpis: base.kpis,
    progressHistory: base.progressHistory,
    velocityHistory,
    activeSprint: activeSprintData,
    teamMetrics,
  };
}

module.exports = {
  getProjectDashboard,
  getProjectMetrics,
};