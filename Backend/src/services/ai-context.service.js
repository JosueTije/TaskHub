const prisma = require("../config/prisma");

const contextCache = new Map(); // { projectId: { data, expiresAt } }
const CACHE_TTL_MS = parseInt(process.env.AI_CONTEXT_CACHE_TTL_MS || "120000");

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

async function buildAiContext({ projectId, userId, role }) {
  const cached = contextCache.get(projectId);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  await checkProjectAccess({ projectId, userId, role });

  const [project, sprints, allTickets, members, gamification, historicalProjects] =
    await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: { pm: { select: { fullName: true } } },
      }),
      prisma.sprint.findMany({
        where: { projectId },
        orderBy: { startDate: "asc" },
        include: {
          tickets: {
            include: { assignedTo: { select: { id: true, fullName: true } } },
          },
        },
      }),
      prisma.ticket.findMany({
        where: { projectId },
        include: { assignedTo: { select: { id: true, fullName: true } } },
      }),
      prisma.projectMember.findMany({
        where: { projectId, leftAt: null },
        include: { user: { select: { id: true, fullName: true, role: true } } },
      }),
      prisma.gamificationEvent.findMany({ where: { projectId } }),
      prisma.project.findMany({
        where: { status: "ARCHIVED" },
        include: { tickets: { select: { status: true } } },
        take: 5,
        orderBy: { archivedAt: "desc" },
      }),
    ]);

  if (!project) throw new Error("Proyecto no encontrado");

  const today = new Date();

  // ── Sprint classification ──────────────────────────────────────────────
  const activeSprint = sprints.find((s) => s.status === "ACTIVE") || null;

  function enrichSprint(sprint) {
    const st = sprint.tickets || [];
    return {
      id: sprint.id,
      name: sprint.name,
      number: sprints.findIndex((s) => s.id === sprint.id) + 1,
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      capacityHours: sprint.capacity,
      githubBranch: sprint.githubBranch || null,
      totalTickets: st.length,
      completedTickets: st.filter((t) => t.status === "DONE").length,
      blockedTickets: st.filter((t) => t.status === "BLOCKED").length,
      inProgressTickets: st.filter((t) =>
        ["IN_PROGRESS", "IN_REVIEW"].includes(t.status)
      ).length,
    };
  }

  const activeSprintFull = activeSprint
    ? {
        ...enrichSprint(activeSprint),
        tickets: activeSprint.tickets.map((t) => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          storyPoints: t.storyPoints,
          estimatedHours: t.estimatedHours,
          usedHours: t.actualHours,
          assignee: t.assignedTo?.fullName || null,
          hasPR: !!t.githubPrNumber,
        })),
      }
    : null;

  // ── KPIs ───────────────────────────────────────────────────────────────
  const activeTickets = allTickets.filter((t) => t.status !== "CANCELLED");
  const totalSP = activeTickets.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const doneTickets = allTickets.filter((t) => t.status === "DONE");
  const doneSP = doneTickets.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const progress = totalSP
    ? Math.round((doneSP / totalSP) * 100)
    : activeTickets.length
    ? Math.round((doneTickets.length / activeTickets.length) * 100)
    : 0;

  let plannedProgress = 0;
  if (project.startDate && project.targetEndDate) {
    const start = new Date(project.startDate);
    const end = new Date(project.targetEndDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / 86400000));
    const elapsed = Math.ceil((today - start) / 86400000);
    plannedProgress = Math.max(0, Math.min(100, Math.round((elapsed / totalDays) * 100)));
  }

  const estimatedHours = doneTickets.reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const usedHours = doneTickets.reduce((s, t) => s + (t.actualHours || 0), 0);
  const efficiency = usedHours > 0 ? Number((estimatedHours / usedHours).toFixed(2)) : null;
  const spi = progress > 0 && plannedProgress > 0 ? Number((progress / plannedProgress).toFixed(2)) : null;
  const scheduleVariance = activeTickets.length > 0 ? progress - plannedProgress : 0;
  const blockedCount = allTickets.filter((t) => t.status === "BLOCKED").length;

  // ── Team metrics ───────────────────────────────────────────────────────
  const activeSprintTickets = activeSprint?.tickets || [];
  const team = members
    .filter((m) => m.user)
    .map((m) => {
      const mt = allTickets.filter((t) => t.assignedToId === m.userId && t.status !== "CANCELLED");
      const done = mt.filter((t) => t.status === "DONE");
      const blocked = mt.filter((t) => t.status === "BLOCKED");
      const inProgress = mt.filter((t) => t.status === "IN_PROGRESS");
      const inReview = mt.filter((t) => t.status === "IN_REVIEW");
      const todo = mt.filter((t) => t.status === "TODO");

      // Sprint activo — carga actual
      const activeMt = activeSprintTickets.filter(
        (t) => t.assignedToId === m.userId && t.status !== "CANCELLED"
      );
      const activeDone     = activeMt.filter((t) => t.status === "DONE");
      const activeIp       = activeMt.filter((t) => ["IN_PROGRESS", "IN_REVIEW"].includes(t.status));
      const activeBlocked  = activeMt.filter((t) => t.status === "BLOCKED");
      const activeTodo     = activeMt.filter((t) => t.status === "TODO");

      // Tickets retrasados (dueDate pasada, no terminados)
      const overdue = mt.filter(
        (t) => t.dueDate && new Date(t.dueDate) < today && !["DONE", "CANCELLED"].includes(t.status)
      );

      // Story points
      const spAssigned = mt.reduce((s, t) => s + (t.storyPoints || 0), 0);
      const spDone     = done.reduce((s, t) => s + (t.storyPoints || 0), 0);
      const spActive   = activeMt.reduce((s, t) => s + (t.storyPoints || 0), 0);

      // Horas
      const estTotal = mt.reduce((s, t) => s + (t.estimatedHours || 0), 0);
      const usedTotal = done.reduce((s, t) => s + (t.actualHours || 0), 0);
      // Horas pendientes estimadas en sprint activo (tickets no-DONE)
      const pendingHours = activeMt
        .filter((t) => t.status !== "DONE")
        .reduce((s, t) => s + (t.estimatedHours || 0), 0);

      // Ciclo promedio: días entre startedAt y completedAt para tickets DONE
      const cycleTickets = done.filter((t) => t.startedAt && t.completedAt);
      const avgCycleDays =
        cycleTickets.length > 0
          ? Number(
              (
                cycleTickets.reduce(
                  (s, t) =>
                    s + (new Date(t.completedAt) - new Date(t.startedAt)) / 86400000,
                  0
                ) / cycleTickets.length
              ).toFixed(1)
            )
          : null;

      // Precisión de estimación (de gamificación)
      const gEvents = gamification.filter((g) => g.userId === m.userId);
      const gpts = gEvents.reduce((s, g) => s + g.points, 0);
      const precisionRate =
        gEvents.length > 0
          ? Math.round((gEvents.filter((g) => g.precision).length / gEvents.length) * 100)
          : null;

      return {
        name: m.user.fullName,
        role: m.user.role,
        // General
        assignedTickets: mt.length,
        completedTickets: done.length,
        rendimiento: mt.length > 0 ? Math.round((done.length / mt.length) * 100) : 0,
        // Estado de tickets generales
        todoTickets: todo.length,
        inProgressTickets: inProgress.length,
        inReviewTickets: inReview.length,
        blockedTickets: blocked.length,
        overdueTickets: overdue.length,
        // Sprint activo
        activeSprintTotal: activeMt.length,
        activeSprintDone: activeDone.length,
        activeSprintInProgress: activeIp.length,
        activeSprintBlocked: activeBlocked.length,
        activeSprintTodo: activeTodo.length,
        activeSprintPendingHours: pendingHours,
        // Story points
        storyPointsAssigned: spAssigned,
        storyPointsDone: spDone,
        activeSprintSP: spActive,
        // Horas y eficiencia
        estimatedHours: estTotal,
        usedHours: usedTotal,
        efficiency: usedTotal > 0 ? Number((estTotal / usedTotal).toFixed(2)) : null,
        avgCycleDays,
        precisionRate,
        gamificationPoints: gpts,
      };
    });

  // ── Historical benchmark ───────────────────────────────────────────────
  const historicalBenchmark = historicalProjects
    .map((hp) => {
      const start = hp.startDate ? new Date(hp.startDate) : null;
      const endReal = hp.actualEndDate || hp.archivedAt ? new Date(hp.actualEndDate || hp.archivedAt) : null;
      const planned =
        hp.startDate && hp.targetEndDate
          ? Math.ceil((new Date(hp.targetEndDate) - new Date(hp.startDate)) / 86400000)
          : null;
      const actual = start && endReal ? Math.ceil((endReal - start) / 86400000) : null;
      const hDone = hp.tickets.filter((t) => t.status === "DONE").length;
      const completionPercent = hp.tickets.length > 0 ? Math.round((hDone / hp.tickets.length) * 100) : null;
      return { projectName: hp.name, plannedDurationDays: planned, actualDurationDays: actual, completionPercent };
    })
    .filter((h) => h.plannedDurationDays || h.actualDurationDays);

  const data = {
    generatedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      targetEndDate: project.targetEndDate,
      actualEndDate: project.actualEndDate,
      status: project.status,
      riskLevel: project.riskLevel,
      pm: project.pm?.fullName || null,
      githubRepo: project.githubRepo || null,
      githubRepoUrl: project.githubRepoUrl || null,
    },
    sprints: {
      total: sprints.length,
      active: activeSprintFull,
      completed: sprints.filter((s) => s.status === "COMPLETED").map(enrichSprint),
      upcoming: sprints.filter((s) => s.status === "PLANNING").map(enrichSprint),
    },
    kpis: {
      progressPercent: progress,
      plannedProgress,
      spi,
      scheduleVariance,
      estimatedHours,
      usedHours,
      efficiency,
      blockedTickets: blockedCount,
    },
    team,
    historicalBenchmark,
  };

  contextCache.set(projectId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

function invalidateContextCache(projectId) {
  contextCache.delete(projectId);
}

function hasEnoughData(context) {
  const hasTickets =
    (context.sprints.active?.totalTickets ?? 0) > 0 ||
    context.sprints.completed.some((s) => s.totalTickets > 0);
  return context.sprints.total > 0 && hasTickets;
}

module.exports = { buildAiContext, invalidateContextCache, hasEnoughData };
