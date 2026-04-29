const prisma = require("../config/prisma");

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
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

  const total = tickets.length;
  const done = tickets.filter(t => t.status === "DONE").length;
  const blocked = tickets.filter(t => t.status === "BLOCKED").length;

  const progress = total ? Math.round((done / total) * 100) : 0;

  // ===============================
  // Planned progress by dates
  // ===============================
  const today = new Date();

  let plannedProgress = 0;

  if (project?.startDate && project?.targetEndDate) {
    const start = new Date(project.startDate);
    const end = new Date(project.targetEndDate);

    const totalDays = Math.max(
      1,
      Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    );

    const elapsed = Math.ceil(
      (today - start) / (1000 * 60 * 60 * 24)
    );

    plannedProgress = clamp(
      Math.round((elapsed / totalDays) * 100),
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

  if (blocked >= 3 || spi < 0.8) {
    risk = "HIGH";
  } else if (blocked >= 1 || spi < 1) {
    risk = "MEDIUM";
  }

  // ===============================
  // Progress History by Sprint
  // ===============================
  let completedAccum = 0;

  const progressHistory = sprints.map((sprint, index) => {
    const sprintTickets = tickets.filter(
      t => t.sprintId === sprint.id
    );

    const sprintDone = sprintTickets.filter(
      t => t.status === "DONE"
    ).length;

    completedAccum += sprintDone;

    const actual =
      total > 0
        ? Math.round((completedAccum / total) * 100)
        : 0;

    const planned = Math.round(
      ((index + 1) / sprints.length) * 100
    );

    return {
      date: sprint.name,
      planned,
      actual,
    };
  });

  // ===============================
  // Team Metrics
  // ===============================
  const teamMetrics = members.map(member => {
    const userTickets = tickets.filter(
      t => t.assignedToId === member.userId
    );

    const completed = userTickets.filter(
      t => t.status === "DONE"
    ).length;

    const performance =
      userTickets.length > 0
        ? Math.round((completed / userTickets.length) * 100)
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
      blockedTickets: blocked,
      delayedMilestones: blocked,
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