const prisma = require("../config/prisma");
const { PRIORITY_POINTS, ticketScore } = require("../utils/scoring");

// ── In-memory leaderboard cache (5-minute TTL) ────────────────────────────
const LEADERBOARD_TTL_MS = 5 * 60 * 1000;
let _leaderboardCache = null;
let _leaderboardExpiry = 0;

function clearLeaderboardCache() {
  _leaderboardCache = null;
  _leaderboardExpiry = 0;
}

function getBadge(points) {
  if (points >= 2000) return "Legend";
  if (points >= 1500) return "Master";
  if (points >= 1000) return "Expert";
  if (points >= 600) return "Pro";
  if (points >= 300) return "Advanced";
  return "Intermediate";
}


function computeStreak(tickets) {
  const days = new Set(
    tickets
      .filter((t) => t.completedAt)
      .map((t) => new Date(t.completedAt).toISOString().split("T")[0])
  );
  if (!days.size) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toISOString().split("T")[0])) streak++;
    else break;
  }
  return streak;
}

function devStats(doneTickets) {
  let totalPoints = 0;
  let highPriority = 0;
  let withEst = 0;
  let accurate = 0;
  for (const t of doneTickets) {
    totalPoints += ticketScore(t);
    if (t.priority === "HIGH" || t.priority === "CRITICAL") highPriority++;
    if (t.estimatedHours != null) {
      withEst++;
      if (t.actualHours != null && t.actualHours <= t.estimatedHours * 1.15)
        accurate++;
    }
  }
  const estimationAccuracy =
    withEst > 0 ? Math.round((accurate / withEst) * 100) : null;
  const criticalTickets = doneTickets.filter(
    (t) => t.priority === "CRITICAL"
  ).length;
  return { totalPoints, highPriorityTickets: highPriority, estimationAccuracy, criticalTickets };
}

function weeklyEvolution(doneTickets) {
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - (3 - i) * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 7);
    const wt = doneTickets.filter((t) => {
      if (!t.completedAt) return false;
      const d = new Date(t.completedAt);
      return d >= weekStart && d < weekEnd;
    });
    return { week: `Sem ${i + 1}`, points: wt.reduce((s, t) => s + ticketScore(t), 0), tickets: wt.length };
  });
}

async function getLeaderboard() {
  if (_leaderboardCache && Date.now() < _leaderboardExpiry) {
    return _leaderboardCache;
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      status: "DONE",
      assignedToId: { not: null },
      assignedTo: {
        status: "ACTIVE",
        deletedAt: null,
        NOT: { fullName: { contains: "TaskHub" } },
      },
    },
    select: {
      id: true,
      priority: true,
      storyPoints: true,
      estimatedHours: true,
      actualHours: true,
      completedAt: true,
      assignedToId: true,
      assignedTo: { select: { id: true, fullName: true } },
      sprint: {
        select: {
          project: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Group by developer
  const devMap = new Map();
  for (const t of tickets) {
    if (!t.assignedTo) continue;
    const devId = t.assignedTo.id;
    if (!devMap.has(devId)) {
      devMap.set(devId, {
        id: devId,
        name: t.assignedTo.fullName,
        tickets: [],
        projectCount: {},
      });
    }
    const dev = devMap.get(devId);
    dev.tickets.push(t);
    const projId = t.sprint?.project?.id;
    if (projId) {
      const projName = t.sprint.project.name;
      if (!dev.projectCount[projId])
        dev.projectCount[projId] = { name: projName, count: 0 };
      dev.projectCount[projId].count++;
    }
  }

  const developers = [];
  for (const [, dev] of devMap) {
    const stats = devStats(dev.tickets);
    const streak = computeStreak(dev.tickets);
    let mainProject = "—";
    let maxCount = 0;
    for (const [, p] of Object.entries(dev.projectCount)) {
      if (p.count > maxCount) {
        maxCount = p.count;
        mainProject = p.name;
      }
    }
    developers.push({
      id: dev.id,
      name: dev.name,
      mainProject,
      streak,
      ...stats,
      badge: getBadge(stats.totalPoints),
    });
  }

  developers.sort((a, b) => b.totalPoints - a.totalPoints);
  developers.forEach((d, i) => {
    d.position = i + 1;
  });

  // Top projects by score
  const projects = await prisma.project.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: {
      id: true,
      name: true,
      members: { select: { user: { select: { role: true } } } },
      sprints: {
        select: {
          tickets: {
            select: {
              id: true,
              status: true,
              priority: true,
              storyPoints: true,
              estimatedHours: true,
              actualHours: true,
            },
          },
        },
      },
    },
  });

  const topProjects = projects
    .map((p) => {
      const allTickets = p.sprints.flatMap((s) => s.tickets);
      const doneTickets = allTickets.filter((t) => t.status === "DONE");
      const score = doneTickets.reduce((sum, t) => sum + ticketScore(t), 0);
      const completion =
        allTickets.length > 0
          ? Math.round((doneTickets.length / allTickets.length) * 100)
          : 0;
      const devCount = p.members.filter((m) => m.user.role === "DEVELOPER").length;
      return { id: p.id, name: p.name, score, completion, developers: devCount };
    })
    .sort((a, b) => b.score - a.score);

  // Weekly trend for top 3 projects
  const top3Ids = topProjects.slice(0, 3).map((p) => p.id);
  const now = new Date();
  const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - (3 - i) * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 7);
    const entry = { week: `Sem ${i + 1}` };
    for (const pid of top3Ids) {
      entry[pid] = tickets
        .filter((t) => {
          if (!t.completedAt) return false;
          const d = new Date(t.completedAt);
          return d >= weekStart && d < weekEnd && t.sprint?.project?.id === pid;
        })
        .reduce((sum, t) => sum + ticketScore(t), 0);
    }
    return entry;
  });

  const result = { developers: developers.slice(0, 20), topProjects: topProjects.slice(0, 3), weeklyTrend };
  _leaderboardCache = result;
  _leaderboardExpiry = Date.now() + LEADERBOARD_TTL_MS;
  return result;
}

async function getProjectGamification(projectId, userId, role) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      pmId: true,
      createdById: true,
      members: {
        select: {
          userId: true,
          user: { select: { id: true, fullName: true, role: true } },
        },
      },
      sprints: {
        select: {
          id: true,
          name: true,
          status: true,
          tickets: {
            select: {
              id: true,
              status: true,
              priority: true,
              storyPoints: true,
              estimatedHours: true,
              actualHours: true,
              completedAt: true,
              assignedToId: true,
            },
          },
        },
      },
    },
  });

  if (!project) throw new Error("Proyecto no encontrado");

  if (role !== "ADMIN") {
    const isMember = project.members.some((m) => m.userId === userId);
    const isOwner = project.pmId === userId || project.createdById === userId;
    if (!isMember && !isOwner) throw new Error("No tienes acceso a este proyecto");
  }

  const activeSprint = project.sprints.find((s) => s.status === "ACTIVE") ?? null;
  const allTickets = project.sprints.flatMap((s) => s.tickets);
  const doneTickets = allTickets.filter((t) => t.status === "DONE");

  const developers = project.members
    .filter((m) => m.user.role === "DEVELOPER")
    .map((m) => {
      const myDone = doneTickets.filter((t) => t.assignedToId === m.userId);
      const stats = devStats(myDone);
      const streak = computeStreak(myDone);
      const evolution = weeklyEvolution(myDone);
      const weeksActive = evolution.filter((w) => w.tickets > 0).length;
      const consistency = Math.round((weeksActive / 4) * 100);
      const totalEvoPoints = evolution.reduce((s, w) => s + w.points, 0);
      const trend = totalEvoPoints === 0
        ? "neutral"
        : evolution[3].points >= evolution[0].points ? "up" : "down";

      let currentSprintPoints = 0;
      let sprintCompletion = 0;
      if (activeSprint) {
        const mySprintTickets = activeSprint.tickets.filter(
          (t) => t.assignedToId === m.userId
        );
        const mySprintDone = mySprintTickets.filter((t) => t.status === "DONE");
        currentSprintPoints = mySprintDone.reduce(
          (s, t) => s + ticketScore(t),
          0
        );
        sprintCompletion =
          mySprintTickets.length > 0
            ? Math.round((mySprintDone.length / mySprintTickets.length) * 100)
            : 0;
      }

      return {
        id: m.userId,
        name: m.user.fullName,
        ...stats,
        badge: getBadge(stats.totalPoints),
        streak,
        currentSprintPoints,
        sprintCompletion,
        weeklyEvolution: evolution,
        consistency,
        trend,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((d, i) => ({ ...d, position: i + 1 }));

  const totalScore = developers.reduce((s, d) => s + d.totalPoints, 0);

  let sprintWinner = null;
  if (activeSprint && developers.length > 0) {
    const winner = developers.reduce(
      (best, d) => (d.currentSprintPoints > best.currentSprintPoints ? d : best),
      developers[0]
    );
    if (winner.currentSprintPoints > 0) {
      sprintWinner = {
        name: winner.name,
        points: winner.currentSprintPoints,
        completion: winner.sprintCompletion,
        sprintName: activeSprint.name,
      };
    }
  }

  return { projectName: project.name, totalScore, developers, sprintWinner };
}

module.exports = { getLeaderboard, getProjectGamification, clearLeaderboardCache };
