const prisma = require("../config/prisma");

async function validateProjectAccess({ projectId, userId, role }) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      archivedAt: null,
    },
    include: {
      members: {
        where: {
          userId,
          leftAt: null,
        },
      },
    },
  });

  if (!project) {
    throw new Error("El proyecto no existe o está archivado");
  }

  if (role === "ADMIN") return project;

  if (role === "PM") {
    const hasAccess =
      project.pmId === userId ||
      project.createdById === userId ||
      project.members.length > 0;

    if (!hasAccess) {
      throw new Error("No tienes acceso a este proyecto");
    }

    return project;
  }

  if (role === "DEVELOPER" || role === "VIEWER") {
    if (project.members.length === 0) {
      throw new Error("No tienes acceso a este proyecto");
    }

    return project;
  }

  throw new Error("Rol no autorizado");
}

async function createSprint({
  projectId,
  name,
  goal,
  startDate,
  endDate,
  capacity,
  userId,
  role,
}) {
  if (!projectId || !name || !startDate || !endDate) {
    throw new Error("projectId, name, startDate y endDate son obligatorios");
  }

  if (!["ADMIN", "PM"].includes(role)) {
    throw new Error("No tienes permisos para crear sprints");
  }

  await validateProjectAccess({ projectId, userId, role });

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Las fechas no son válidas");
  }

  if (end < start) {
    throw new Error("La fecha fin no puede ser menor que la fecha inicio");
  }

  const overlappingSprint = await prisma.sprint.findFirst({
    where: {
      projectId,
      status: {
        in: ["PLANNING", "ACTIVE"],
      },
      OR: [
        {
          startDate: {
            lte: end,
          },
          endDate: {
            gte: start,
          },
        },
      ],
    },
  });

  if (overlappingSprint) {
    throw new Error("Ya existe un sprint activo o en planeación con fechas traslapadas");
  }

  const sprint = await prisma.sprint.create({
    data: {
      projectId,
      name: name.trim(),
      goal: goal?.trim() || null,
      startDate: start,
      endDate: end,
      capacity: capacity !== undefined && capacity !== null ? Number(capacity) : 0,
      status: "PLANNING",
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  return sprint;
}

async function getSprintsByProject({ projectId, userId, role }) {
  await validateProjectAccess({ projectId, userId, role });

  const sprints = await prisma.sprint.findMany({
    where: {
      projectId,
    },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return sprints;
}

async function getSprintById({ sprintId, userId, role }) {
  const sprint = await prisma.sprint.findUnique({
    where: {
      id: sprintId,
    },
    include: {
      project: {
        include: {
          members: {
            where: {
              userId,
              leftAt: null,
            },
          },
        },
      },
      tickets: {
        include: {
          assignedTo: {
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
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!sprint) {
    throw new Error("El sprint no existe");
  }

  await validateProjectAccess({
    projectId: sprint.projectId,
    userId,
    role,
  });

  return sprint;
}

async function updateSprint({
  sprintId,
  name,
  goal,
  startDate,
  endDate,
  capacity,
  userId,
  role,
}) {
  if (!["ADMIN", "PM"].includes(role)) {
    throw new Error("No tienes permisos para editar sprints");
  }

  const sprint = await prisma.sprint.findUnique({
    where: {
      id: sprintId,
    },
  });

  if (!sprint) {
    throw new Error("El sprint no existe");
  }

  await validateProjectAccess({
    projectId: sprint.projectId,
    userId,
    role,
  });

  const start = startDate ? new Date(startDate) : sprint.startDate;
  const end = endDate ? new Date(endDate) : sprint.endDate;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Las fechas no son válidas");
  }

  if (end < start) {
    throw new Error("La fecha fin no puede ser menor que la fecha inicio");
  }

  const overlappingSprint = await prisma.sprint.findFirst({
    where: {
      id: {
        not: sprintId,
      },
      projectId: sprint.projectId,
      status: {
        in: ["PLANNING", "ACTIVE"],
      },
      OR: [
        {
          startDate: {
            lte: end,
          },
          endDate: {
            gte: start,
          },
        },
      ],
    },
  });

  if (overlappingSprint) {
    throw new Error("Ya existe otro sprint activo o en planeación con fechas traslapadas");
  }

  const updatedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      name: name !== undefined ? name.trim() : undefined,
      goal: goal !== undefined ? goal?.trim() || null : undefined,
      startDate: start,
      endDate: end,
      capacity: capacity !== undefined && capacity !== null ? Number(capacity) : undefined,
    },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  return updatedSprint;
}

async function updateSprintStatus({ sprintId, status, userId, role }) {
  if (!["ADMIN", "PM"].includes(role)) {
    throw new Error("No tienes permisos para cambiar el estado del sprint");
  }

  const validStatuses = ["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"];

  if (!validStatuses.includes(status)) {
    throw new Error("Estado de sprint inválido");
  }

  const sprint = await prisma.sprint.findUnique({
    where: {
      id: sprintId,
    },
  });

  if (!sprint) {
    throw new Error("El sprint no existe");
  }

  await validateProjectAccess({
    projectId: sprint.projectId,
    userId,
    role,
  });

  if (status === "ACTIVE") {
    const activeSprint = await prisma.sprint.findFirst({
      where: {
        projectId: sprint.projectId,
        id: {
          not: sprintId,
        },
        status: "ACTIVE",
      },
    });

    if (activeSprint) {
      throw new Error("Ya existe un sprint activo en este proyecto");
    }
  }

  const updatedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  return updatedSprint;
}

async function deleteSprint({ sprintId, userId, role }) {
  if (!["ADMIN", "PM"].includes(role)) {
    throw new Error("No tienes permisos para eliminar sprints");
  }

  const sprint = await prisma.sprint.findUnique({
    where: {
      id: sprintId,
    },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  if (!sprint) {
    throw new Error("El sprint no existe");
  }

  await validateProjectAccess({
    projectId: sprint.projectId,
    userId,
    role,
  });

  if (sprint._count.tickets > 0) {
    throw new Error("No puedes eliminar un sprint que tiene tickets");
  }

  await prisma.sprint.delete({
    where: {
      id: sprintId,
    },
  });

  return {
    message: "Sprint eliminado correctamente",
  };
}

module.exports = {
  createSprint,
  getSprintsByProject,
  getSprintById,
  updateSprint,
  updateSprintStatus,
  deleteSprint,
};