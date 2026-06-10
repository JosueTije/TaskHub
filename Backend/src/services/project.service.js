const prisma = require("../config/prisma");

function normalizeProjectCode(code) {
  return code.trim().toUpperCase().replace(/\s+/g, "-");
}

async function createProject({
  name,
  code,
  description,
  pmId,
  riskLevel,
  startDate,
  targetEndDate,
  budget,
  memberIds,
  createdById,
  creatorRole,
}) {
  if (!name || !code || !startDate || !targetEndDate) {
    throw new Error("name, code, startDate y targetEndDate son obligatorios");
  }

  if (!["ADMIN", "PM"].includes(creatorRole)) {
    throw new Error("No tienes permisos para crear proyectos");
  }

  const normalizedCode = normalizeProjectCode(code);

  const start = new Date(startDate);
  const end = new Date(targetEndDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Las fechas no son válidas");
  }

  if (end < start) {
    throw new Error("La fecha fin no puede ser menor que la fecha inicio");
  }

  const existingProject = await prisma.project.findUnique({
    where: {
      code: normalizedCode,
    },
  });

  if (existingProject) {
    throw new Error("Ya existe un proyecto con ese código");
  }

  if (pmId) {
    const pmUser = await prisma.user.findFirst({
      where: {
        id: pmId,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!pmUser) {
      throw new Error("El PM seleccionado no existe o no está activo");
    }

    if (!["PM", "ADMIN"].includes(pmUser.role)) {
      throw new Error("El usuario seleccionado como PM no tiene rol válido");
    }
  }

  let validMembers = [];

  if (Array.isArray(memberIds) && memberIds.length > 0) {
    validMembers = await prisma.user.findMany({
      where: {
        id: {
          in: memberIds,
        },
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (validMembers.length !== new Set(memberIds).size) {
      throw new Error("Uno o más miembros no existen o no están activos");
    }
  }

  const allMemberIds = new Set([
    createdById,
    ...(pmId ? [pmId] : []),
    ...validMembers.map((u) => u.id),
  ]);

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        name: name.trim(),
        code: normalizedCode,
        description: description?.trim() || null,
        riskLevel: riskLevel || "LOW",
        createdById,
        pmId: pmId || null,
        startDate: start,
        targetEndDate: end,
        budget: budget !== undefined && budget !== null ? Number(budget) : null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        pm: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (allMemberIds.size > 0) {
      await tx.projectMember.createMany({
        data: Array.from(allMemberIds).map((userId) => ({
          projectId: createdProject.id,
          userId,
        })),
      });
    }

    return createdProject;
  });

  const members = await prisma.projectMember.findMany({
    where: {
      projectId: project.id,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return {
    ...project,
    members: members.map((m) => m.user),
  };
}

async function getProjects({ userId, role }) {
  const notArchived = { status: { not: "ARCHIVED" }, archivedAt: null };
  let where = notArchived;

  if (role === "PM") {
    where = {
      ...notArchived,
      OR: [
        { pmId: userId },
        { createdById: userId },
        { members: { some: { userId, leftAt: null } } },
      ],
    };
  }

  if (role === "DEVELOPER" || role === "VIEWER") {
    where = {
      ...notArchived,
      members: { some: { userId, leftAt: null } },
    };
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      pm: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      members: {
        where: {
          leftAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          sprints: true,
          tickets: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    code: project.code,
    description: project.description,
    status: project.status,
    riskLevel: project.riskLevel,
    startDate: project.startDate,
    targetEndDate: project.targetEndDate,
    actualEndDate: project.actualEndDate,
    budget: project.budget,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    pm: project.pm,
    createdBy: project.createdBy,
    members: project.members.map((member) => member.user),
    githubRepo: project.githubRepo ?? null,
    githubRepoUrl: project.githubRepoUrl ?? null,
    stats: {
      membersCount: project._count.members,
      sprintsCount: project._count.sprints,
      ticketsCount: project._count.tickets,
    },
  }));
}

async function addProjectMember({ projectId, userId, currentUserId, role }) {
  if (!["ADMIN", "PM"].includes(role)) {
    throw new Error("No tienes permisos para agregar developers");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Proyecto no encontrado");
  }

  if (role === "PM" && project.pmId !== currentUserId) {
    throw new Error("Solo el PM asignado puede agregar miembros");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (user.role !== "DEVELOPER") {
    throw new Error("Solo puedes agregar usuarios con rol DEVELOPER");
  }

  const existingMember = await prisma.projectMember.findFirst({
    where: { projectId, userId },
  });

  if (existingMember) {
    if (!existingMember.leftAt) {
      throw new Error("Este developer ya pertenece al proyecto");
    }

    const member = await prisma.projectMember.update({
      where: { id: existingMember.id },
      data: { leftAt: null, joinedAt: new Date() },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true, avatarUrl: true },
        },
      },
    });
    return member;
  }

  const member = await prisma.projectMember.create({
    data: { projectId, userId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, role: true, avatarUrl: true },
      },
    },
  });

  return member;
}

async function getArchivedProjects({ userId, role }) {
  const base = { status: "ARCHIVED", archivedAt: { not: null } };
  let where = base;

  if (role !== "ADMIN") {
    where = {
      ...base,
      OR: [
        { pmId: userId },
        { createdById: userId },
        { members: { some: { userId, leftAt: null } } },
      ],
    };
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      pm: { select: { id: true, fullName: true, email: true, role: true } },
      createdBy: { select: { id: true, fullName: true, email: true, role: true } },
      members: {
        where: { leftAt: null },
        include: { user: { select: { id: true, fullName: true, email: true, role: true, avatarUrl: true } } },
      },
      _count: { select: { members: { where: { leftAt: null } }, sprints: true, tickets: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    code: project.code,
    description: project.description,
    status: project.status,
    riskLevel: project.riskLevel,
    startDate: project.startDate,
    targetEndDate: project.targetEndDate,
    actualEndDate: project.actualEndDate,
    archivedAt: project.archivedAt,
    budget: project.budget,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    pm: project.pm,
    createdBy: project.createdBy,
    members: project.members.map((m) => m.user),
    stats: {
      membersCount: project._count.members,
      sprintsCount: project._count.sprints,
      ticketsCount: project._count.tickets,
    },
  }));
}

const PROJECT_INCLUDE = {
  pm: { select: { id: true, fullName: true, email: true, role: true } },
  createdBy: { select: { id: true, fullName: true, email: true, role: true } },
  members: {
    where: { leftAt: null },
    include: {
      user: { select: { id: true, fullName: true, email: true, role: true, avatarUrl: true } },
    },
  },
  _count: { select: { members: true, sprints: true, tickets: true } },
};

function formatProject(project) {
  return {
    id: project.id,
    name: project.name,
    code: project.code,
    description: project.description,
    status: project.status,
    riskLevel: project.riskLevel,
    startDate: project.startDate,
    targetEndDate: project.targetEndDate,
    actualEndDate: project.actualEndDate,
    budget: project.budget,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    pm: project.pm,
    createdBy: project.createdBy,
    members: project.members.map((m) => m.user),
    githubRepo: project.githubRepo ?? null,
    githubRepoUrl: project.githubRepoUrl ?? null,
    stats: {
      membersCount: project._count.members,
      sprintsCount: project._count.sprints,
      ticketsCount: project._count.tickets,
    },
  };
}

async function getProjectById({ projectId, userId, role }) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: PROJECT_INCLUDE,
  });

  if (!project) throw new Error("Proyecto no encontrado");

  if (role !== "ADMIN") {
    const isMember = project.members.some((m) => m.user?.id === userId);
    const isOwner = project.pmId === userId || project.createdById === userId;
    if (!isMember && !isOwner) throw new Error("No tienes acceso a este proyecto");
  }

  return formatProject(project);
}

async function updateProject({ projectId, userId, role, data }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Proyecto no encontrado");

  if (role === "PM" && project.pmId !== userId && project.createdById !== userId) {
    throw new Error("No tienes permisos para editar este proyecto");
  }
  if (!["ADMIN", "PM"].includes(role)) throw new Error("No tienes permisos para editar proyectos");

  const { name, description, pmId, riskLevel, startDate, targetEndDate, budget } = data;

  if (startDate && targetEndDate) {
    const start = new Date(startDate);
    const end = new Date(targetEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("Fechas inválidas");
    if (end < start) throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio");
  }

  if (pmId) {
    const pm = await prisma.user.findFirst({ where: { id: pmId, status: "ACTIVE", deletedAt: null } });
    if (!pm) throw new Error("El PM seleccionado no existe o no está activo");
    if (!["PM", "ADMIN"].includes(pm.role)) throw new Error("El usuario seleccionado no tiene rol válido de PM");
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(pmId !== undefined && { pmId: pmId || null }),
      ...(riskLevel !== undefined && { riskLevel }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(targetEndDate !== undefined && { targetEndDate: new Date(targetEndDate) }),
      ...(budget !== undefined && { budget: budget ? Number(budget) : null }),
    },
    include: PROJECT_INCLUDE,
  });

  return formatProject(updated);
}

async function updateProjectStatus({ projectId, userId, role, status }) {
  const allowed = ["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"];
  if (!allowed.includes(status)) throw new Error(`Estado inválido: ${status}`);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Proyecto no encontrado");

  if (status === "ARCHIVED" && role !== "ADMIN") {
    throw new Error("Solo un ADMIN puede archivar proyectos");
  }
  if (!["ADMIN", "PM"].includes(role)) throw new Error("No tienes permisos para cambiar el estado del proyecto");
  if (role === "PM" && project.pmId !== userId && project.createdById !== userId) {
    throw new Error("Solo el PM asignado puede cambiar el estado de este proyecto");
  }

  if (status === "ARCHIVED") {
    const activeSprints = await prisma.sprint.count({
      where: { projectId, status: "ACTIVE" },
    });
    if (activeSprints > 0) {
      throw new Error(`No puedes archivar un proyecto con ${activeSprints} sprint${activeSprints > 1 ? "s" : ""} activo${activeSprints > 1 ? "s" : ""}`);
    }

    const openTickets = await prisma.ticket.count({
      where: {
        projectId,
        status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"] },
      },
    });
    if (openTickets > 0) {
      throw new Error(`El proyecto tiene ${openTickets} ticket${openTickets > 1 ? "s" : ""} pendiente${openTickets > 1 ? "s" : ""}. Ciérralos antes de archivar`);
    }
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      status,
      archivedAt: status === "ARCHIVED" ? new Date() : null,
    },
    include: PROJECT_INCLUDE,
  });

  return formatProject(updated);
}

async function removeProjectMember({ projectId, userId, currentUserId, role }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Proyecto no encontrado");

  if (!["ADMIN", "PM"].includes(role)) throw new Error("No tienes permisos para quitar miembros");
  if (role === "PM" && project.pmId !== currentUserId && project.createdById !== currentUserId) {
    throw new Error("Solo el PM asignado puede quitar miembros");
  }

  if (project.pmId === userId) throw new Error("No puedes quitar al PM asignado del proyecto");

  const member = await prisma.projectMember.findFirst({
    where: { projectId, userId, leftAt: null },
  });
  if (!member) throw new Error("El usuario no es miembro activo del proyecto");

  await prisma.projectMember.update({
    where: { id: member.id },
    data: { leftAt: new Date() },
  });
}

async function getArchivedProjectHistory({ projectId, userId, role }) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      pm: { select: { id: true, fullName: true, email: true, role: true } },
      createdBy: { select: { id: true, fullName: true, email: true, role: true } },
      members: {
        where: { leftAt: null },
        include: { user: { select: { id: true, fullName: true, email: true, role: true, avatarUrl: true } } },
      },
    },
  });

  if (!project) throw new Error("Proyecto no encontrado");
  if (project.status !== "ARCHIVED") throw new Error("Este proyecto no está archivado");

  if (role !== "ADMIN") {
    const isMember = await prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    const isOwner = project.pmId === userId || project.createdById === userId;
    if (!isMember && !isOwner) throw new Error("No tienes acceso a este proyecto");
  }

  const sprints = await prisma.sprint.findMany({
    where: { projectId },
    include: {
      tickets: {
        include: {
          assignedTo: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  const TICKET_STATUS_ORDER = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"];

  function computeSprintMetrics(tickets) {
    const ticketsByStatus = Object.fromEntries(TICKET_STATUS_ORDER.map((s) => [s, 0]));
    const teamMap = {};
    let plannedPoints = 0;
    let completedPoints = 0;

    for (const t of tickets) {
      ticketsByStatus[t.status] = (ticketsByStatus[t.status] ?? 0) + 1;

      const pts = t.storyPoints ?? 0;
      if (t.status !== "CANCELLED") plannedPoints += pts;
      if (t.status === "DONE") completedPoints += pts;

      if (t.assignedTo) {
        const key = t.assignedTo.id;
        if (!teamMap[key]) {
          teamMap[key] = {
            memberId: t.assignedTo.id,
            fullName: t.assignedTo.fullName,
            avatarUrl: t.assignedTo.avatarUrl ?? null,
            ticketsCount: 0,
            storyPointsCompleted: 0,
          };
        }
        teamMap[key].ticketsCount += 1;
        if (t.status === "DONE") teamMap[key].storyPointsCompleted += pts;
      }
    }

    return {
      ticketsByStatus,
      storyPoints: { planned: plannedPoints, completed: completedPoints },
      teamAssignments: Object.values(teamMap),
    };
  }

  const sprintData = sprints.map((sprint) => {
    const plannedDays = Math.round(
      (new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24)
    );
    const actualDays = sprint.completedAt
      ? Math.round(
          (new Date(sprint.completedAt) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24)
        )
      : null;

    return {
      id: sprint.id,
      name: sprint.name,
      goal: sprint.goal,
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      completedAt: sprint.completedAt,
      metrics: {
        ...computeSprintMetrics(sprint.tickets),
        timing: {
          plannedDays,
          actualDays,
          onTime: actualDays !== null ? actualDays <= plannedDays : null,
        },
      },
      tickets: sprint.tickets.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        storyPoints: t.storyPoints,
        assignedTo: t.assignedTo,
        startDate: t.startDate,
        dueDate: t.dueDate,
        completedAt: t.completedAt,
      })),
    };
  });

  const allTickets = sprints.flatMap((s) => s.tickets);
  const totalMetrics = computeSprintMetrics(allTickets);
  const doneCount = totalMetrics.ticketsByStatus["DONE"] ?? 0;
  const nonCancelledCount = allTickets.filter((t) => t.status !== "CANCELLED").length;

  const plannedDuration = project.targetEndDate
    ? Math.round(
        (new Date(project.targetEndDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
      )
    : null;
  const actualDuration =
    project.actualEndDate
      ? Math.round(
          (new Date(project.actualEndDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
        )
      : project.archivedAt
      ? Math.round(
          (new Date(project.archivedAt) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
        )
      : null;

  return {
    project: {
      id: project.id,
      name: project.name,
      code: project.code,
      description: project.description,
      status: project.status,
      riskLevel: project.riskLevel,
      startDate: project.startDate,
      targetEndDate: project.targetEndDate,
      actualEndDate: project.actualEndDate,
      archivedAt: project.archivedAt,
      pm: project.pm,
      members: project.members.map((m) => m.user),
    },
    sprints: sprintData,
    totals: {
      durationDays: { planned: plannedDuration, actual: actualDuration },
      tickets: { total: allTickets.length, byStatus: totalMetrics.ticketsByStatus },
      storyPoints: totalMetrics.storyPoints,
      completionRate: nonCancelledCount > 0 ? Math.round((doneCount / nonCancelledCount) * 100) : 0,
      teamAssignments: totalMetrics.teamAssignments,
    },
  };
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  addProjectMember,
  removeProjectMember,
  getArchivedProjects,
  getArchivedProjectHistory,
};