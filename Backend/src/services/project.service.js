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
  let where = {
    archivedAt: null,
  };

  if (role === "ADMIN") {
    where = {
      archivedAt: null,
    };
  }

  if (role === "PM") {
    where = {
      archivedAt: null,
      OR: [
        { pmId: userId },
        { createdById: userId },
        {
          members: {
            some: {
              userId,
              leftAt: null,
            },
          },
        },
      ],
    };
  }

  if (role === "DEVELOPER" || role === "VIEWER") {
    where = {
      archivedAt: null,
      members: {
        some: {
          userId,
          leftAt: null,
        },
      },
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
    where: {
      projectId,
      userId,
      leftAt: null,
    },
  });

  if (existingMember) {
    throw new Error("Este developer ya pertenece al proyecto");
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId,
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
  });

  return member;
}

module.exports = {
  createProject,
  getProjects,
  addProjectMember
};