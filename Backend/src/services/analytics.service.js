const prisma = require("../config/prisma");

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function daysBetween(start, end) {
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

async function getProjectDashboard({ projectId }) {
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

  const blocked = tickets.filter((t) => t.status === "BLOCKED").length;

  const delayedTickets = tickets.filter((t) => {
    if (!t.dueDate) return false;

    return (
      new Date(t.dueDate) < today &&
      !["DONE", "CANCELLED"].includes(t.status)
    );
  }).length;

  // ===============================
  // Real progress by story points
  // ===============================
  const totalStoryPoints = tickets.reduce(
    (sum, t) => sum + (t.storyPoints || 0),
    0
  );

  const doneStoryPoints = tickets
    .filter((t) => t.status === "DONE")
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  const progress = totalStoryPoints
    ? Math.round((doneStoryPoints / totalStoryPoints) * 100)
    : 0;

  // ===============================
  // Planned progress by project dates
  // ===============================
  let plannedProgress = 0;

  if (project?.startDate && project?.targetEndDate) {
    const start = new Date(project.startDate);
    const end = new Date(project.targetEndDate);

    const totalDays = Math.max(1, daysBetween(start, end));
    const elapsedDays = daysBetween(start, today);

    plannedProgress = clamp(
      Math.round((elapsedDays / totalDays) * 100),
      0,
      100
    );
  }

  const scheduleVariance = progress - plannedProgress;

  const spi =
    plannedProgress > 0
      ? Number((progress / plannedProgress).toFixed(2))
      : 1;

  // ===============================
  // Risk logic
  // ===============================
  let risk = "LOW";

  if (delayedTickets >= 3 || blocked >= 3 || spi < 0.8) {
    risk = "HIGH";
  } else if (delayedTickets >= 1 || blocked >= 1 || spi < 1) {
    risk = "MEDIUM";
  }

  // ===============================
  // Progress History by Sprint
  // ===============================
  let completedStoryPointsAccum = 0;

  const progressHistory = sprints.map((sprint, index) => {
    const sprintTickets = tickets.filter(
      (t) => t.sprintId === sprint.id
    );

    const sprintDoneStoryPoints = sprintTickets
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    completedStoryPointsAccum += sprintDoneStoryPoints;

    const actual = totalStoryPoints
      ? Math.round((completedStoryPointsAccum / totalStoryPoints) * 100)
      : 0;

    const planned = sprints.length
      ? Math.round(((index + 1) / sprints.length) * 100)
      : 0;

    return {
      date: sprint.name,
      planned,
      actual,
    };
  });

  // ===============================
  // Team Metrics
  // ===============================
  const teamMetrics = members.map((member) => {
    const userTickets = tickets.filter(
      (t) => t.assignedToId === member.userId
    );

    const userTotalStoryPoints = userTickets.reduce(
      (sum, t) => sum + (t.storyPoints || 0),
      0
    );

    const userDoneStoryPoints = userTickets
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const performance = userTotalStoryPoints
      ? Math.round((userDoneStoryPoints / userTotalStoryPoints) * 100)
      : 0;

    return {
      id: member.user.id,
      name: member.user.fullName,
      tasksAssigned: userTickets.length,
      performance,
      status: "Active",
    };
  });

  return {
    kpis: {
      progress,
      plannedProgress,
      completedStoryPoints: doneStoryPoints,
      totalStoryPoints,
      blockedTickets: blocked,
      delayedMilestones: delayedTickets,
      scheduleVariance,
      spi,
      risk,
    },

    progressHistory,

    teamMetrics,
  };
}

module.exports = {
  getProjectDashboard,
};