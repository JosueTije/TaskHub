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
  const activeTickets = tickets.filter((t) => t.status !== "CANCELLED");

  const totalStoryPoints = activeTickets.reduce(
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
    : activeTickets.length
    ? Math.round((completedTickets.length / activeTickets.length) * 100)
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

  // SPI y SV solo tienen sentido cuando hay un sprint activo con trabajo pendiente.
  // Si todos los tickets son DONE (sin sprint activo), las fórmulas se disparan
  // porque progress=100% contra un plannedProgress bajo → SPI=25, SV=96.
  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const activeSprintTickets = activeSprint
    ? tickets.filter((t) => t.sprintId === activeSprint.id && t.status !== "CANCELLED")
    : [];

  const activeSprintTotalSP = activeSprintTickets.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const activeSprintDoneSP = activeSprintTickets
    .filter((t) => t.status === "DONE")
    .reduce((s, t) => s + (t.storyPoints || 0), 0);
  let activeSprintProgress = null;
  if (activeSprintTotalSP > 0) {
    activeSprintProgress = Math.round((activeSprintDoneSP / activeSprintTotalSP) * 100);
  } else if (activeSprintTickets.length > 0) {
    const doneCnt = activeSprintTickets.filter((t) => t.status === "DONE").length;
    activeSprintProgress = Math.round((doneCnt / activeSprintTickets.length) * 100);
  }

const scheduleVariance =
  activeSprintTickets.length === 0
    ? null
    : activeSprintProgress - plannedProgress;

const hasWorkStarted = activeSprintDoneSP > 0 || activeSprintTickets.some((t) => t.status === "DONE");

const spi =
  activeSprintTickets.length > 0 && hasWorkStarted && plannedProgress > 0
    ? Number((activeSprintProgress / plannedProgress).toFixed(2))
    : null;

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
  // For each sprint, use the snapshot (saved at close time) so that deleted
  // incomplete tickets don't inflate the "actual" percentage retroactively.
  const progressHistory = sprints.map((sprint, index) => {
    let sprintDoneSP;
    let sprintTotalSP;

    if (sprint.status === "COMPLETED" && sprint.snapshotTotalSP != null) {
      // Use the snapshot captured before any tickets were deleted
      sprintDoneSP = sprint.snapshotCompletedSP ?? 0;
      sprintTotalSP = sprint.snapshotTotalSP;
    } else {
      // Active / planning sprint — use live ticket data
      const sprintTickets = tickets.filter(
        (t) => t.sprintId === sprint.id && t.status !== "CANCELLED"
      );
      sprintTotalSP = sprintTickets.reduce((s, t) => s + (t.storyPoints || 0), 0);
      sprintDoneSP = sprintTickets
        .filter((t) => t.status === "DONE")
        .reduce((s, t) => s + (t.storyPoints || 0), 0);
    }

    const actual = sprintTotalSP > 0
      ? Math.round((sprintDoneSP / sprintTotalSP) * 100)
      : 0;

    const planned = sprints.length
      ? Math.round(((index + 1) / sprints.length) * 100)
      : 0;

    return {
      date: sprint.name,
      planned,
      actual,
      doneSP: sprintDoneSP,
      totalSP: sprintTotalSP,
    };
  });

  // ===============================
  // Team Metrics
  // ===============================
  const teamMetrics = members.map(
    (member) => {
      const userTickets = tickets.filter(
        (ticket) =>
          ticket.assignedToId === member.userId &&
          ticket.status !== "CANCELLED"
      );

      const userEstimated =
        userTickets.reduce(
          (sum, ticket) =>
            sum + (ticket.estimatedHours || 0),
          0
        );

      const userActual = userTickets
        .filter((ticket) => ticket.status === "DONE")
        .reduce(
          (sum, ticket) => sum + (ticket.actualHours || 0),
          0
        );

      const userStoryTotal =
        userTickets.reduce(
          (sum, ticket) => sum + (ticket.storyPoints || 0),
          0
        );

      const userStoryDone =
        userTickets
          .filter((ticket) => ticket.status === "DONE")
          .reduce(
            (sum, ticket) => sum + (ticket.storyPoints || 0),
            0
          );

      const performance =
        userStoryTotal > 0
          ? Math.round((userStoryDone / userStoryTotal) * 100)
          : 0;

      return {
        id: member.user.id,
        name: member.user.fullName,
        tasksAssigned: userTickets.length,
        performance,
        estimatedHours: userEstimated,
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

  // Velocity history: story points done per sprint (exclude cancelled)
  const velocityHistory = sprints.map((s) => {
    const activeSprintTickets = s.tickets.filter((t) => t.status !== "CANCELLED");
    const done = activeSprintTickets
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const commitment = s.capacity || activeSprintTickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
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
      const p = st.filter((t) => t.priority === priority && t.status !== "CANCELLED");
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

    const stActive = st.filter((t) => t.status !== "CANCELLED");
    activeSprintData = {
      id: activeSprint.id,
      name: activeSprint.name,
      daysRemaining,
      isExpired,
      daysOverdue,
      totalDays,
      capacity: activeSprint.capacity,
      ticketCounts: {
        total: stActive.length,
        done: stActive.filter((t) => t.status === "DONE").length,
        inProgress: stActive.filter((t) => ["IN_PROGRESS", "IN_REVIEW"].includes(t.status)).length,
        blocked: stActive.filter((t) => t.status === "BLOCKED").length,
        todo: stActive.filter((t) => t.status === "TODO").length,
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
    const myTickets = allTickets.filter((t) => t.assignedToId === m.userId && t.status !== "CANCELLED");
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

async function getSprintKpis({ projectId, sprintId, userId, role }) {
  await checkProjectAccess({ projectId, userId, role });

  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: {
      tickets: {
        select: {
          id: true,
          status: true,
          storyPoints: true,
          estimatedHours: true,
          actualHours: true,
          dueDate: true,
        },
      },
    },
  });

  if (!sprint || sprint.projectId !== projectId) {
    throw new Error("Sprint no encontrado en este proyecto");
  }

  const tickets = sprint.tickets.filter((t) => t.status !== "CANCELLED");
  const doneTickets = tickets.filter((t) => t.status === "DONE");

  const totalSP = tickets.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const doneSP = doneTickets.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const progress = totalSP > 0 ? Math.round((doneSP / totalSP) * 100) : tickets.length > 0 ? Math.round((doneTickets.length / tickets.length) * 100) : 0;

  const today = new Date();
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const totalDays = Math.max(1, Math.ceil((end - start) / 86400000));
  const elapsedDays = Math.ceil((today - start) / 86400000);
  const plannedProgress = clamp(Math.round((elapsedDays / totalDays) * 100), 0, 100);

  const hasWorkStarted = doneSP > 0 || doneTickets.length > 0;
  const spi = hasWorkStarted && plannedProgress > 0
    ? Number((progress / plannedProgress).toFixed(2))
    : null;

  const scheduleVariance = tickets.length === 0 ? null : progress - plannedProgress;

  const estimatedHours = tickets.reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const actualHours = doneTickets.reduce((s, t) => s + (t.actualHours || 0), 0);
  const efficiency = actualHours > 0 ? Number((estimatedHours / actualHours).toFixed(2)) : null;

  const blocked = tickets.filter((t) => t.status === "BLOCKED").length;
  const delayed = tickets.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < today && !["DONE", "CANCELLED"].includes(t.status);
  }).length;

  return {
    sprintId,
    sprintName: sprint.name,
    sprintStatus: sprint.status,
    progress,
    plannedProgress,
    spi,
    scheduleVariance,
    estimatedHours,
    actualHours,
    efficiency,
    blockedTickets: blocked,
    delayedMilestones: delayed,
    totalTickets: tickets.length,
    doneTickets: doneTickets.length,
  };
}

module.exports = {
  getProjectDashboard,
  getProjectMetrics,
  getSprintKpis,
};