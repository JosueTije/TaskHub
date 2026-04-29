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

  const completedStoryPoints = tickets
    .filter((ticket) => ticket.status === "DONE")
    .reduce(
      (sum, ticket) => sum + (ticket.storyPoints || 0),
      0
    );

  const progress = totalStoryPoints
    ? Math.round(
        (completedStoryPoints / totalStoryPoints) * 100
      )
    : 0;

  // ===============================
  // Hours Metrics
  // ===============================
  const estimatedHours = tickets.reduce(
    (sum, ticket) => sum + (ticket.estimatedHours || 0),
    0
  );

  const actualHours = tickets
    .filter((ticket) => ticket.status === "DONE")
    .reduce(
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

      estimatedHours,
      actualHours,
      hoursVariance,
      efficiency,
    },

    progressHistory,

    teamMetrics,
  };
}

module.exports = {
  getProjectDashboard,
};