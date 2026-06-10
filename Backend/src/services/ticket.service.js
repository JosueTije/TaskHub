const prisma = require("../config/prisma");
const { clearLeaderboardCache } = require("./gamification.service");
const { ticketScore } = require("../utils/scoring");
const { embedTicket } = require("./rag.service");

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
      throw new Error("El proyecto no existe o no tienes acceso");
    }

    return project;
  }

  if (role === "DEVELOPER" || role === "VIEWER") {
    if (project.members.length === 0) {
      throw new Error("El proyecto no existe o no tienes acceso");
    }

    return project;
  }

  throw new Error("No tienes permisos para acceder a este recurso");
}

async function createTicket({
  sprintId,
  title,
  description,
  priority,
  storyPoints,
  assignedToId,
  estimatedHours,
  actualHours,
  startDate,
  dueDate,
  parentTicketId,
  userId,
  role,
}) {
  if (!sprintId || !title) {
    throw new Error("sprintId y title son obligatorios");
  }

  if (!["ADMIN", "PM"].includes(role)) {
    throw new Error("No tienes permisos para crear tickets");
  }

  if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
    throw new Error("La fecha límite no puede ser anterior a la fecha de inicio");
  }

  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: {
      project: true,
    },
  });

  if (!sprint) {
    throw new Error("El sprint no existe");
  }

  if (sprint.status === "COMPLETED" || sprint.status === "CANCELLED") {
    throw new Error("No se pueden crear tickets en un sprint cerrado o cancelado");
  }

  await validateProjectAccess({
    projectId: sprint.projectId,
    userId,
    role,
  });

  // Capacity check — non-blocking, returns warning
  let capacityWarning = null;
  if (sprint.capacity > 0 && estimatedHours != null && Number(estimatedHours) > 0) {
    const { _sum } = await prisma.ticket.aggregate({
      where: { sprintId, status: { not: "CANCELLED" } },
      _sum: { estimatedHours: true },
    });
    const committed = _sum.estimatedHours ?? 0;
    const newTotal = committed + Number(estimatedHours);
    if (newTotal > sprint.capacity) {
      capacityWarning = {
        committed: newTotal,
        capacity: sprint.capacity,
        percentage: Math.round((newTotal / sprint.capacity) * 100),
      };
    }
  }

  if (assignedToId) {
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: sprint.projectId,
        userId: assignedToId,
        leftAt: null,
        user: {
          role: "DEVELOPER",
        },
      },
    });

    if (!member) {
      throw new Error("El usuario asignado debe ser developer y pertenecer al proyecto");
    }
  }

  if (parentTicketId) {
    const parentTicket = await prisma.ticket.findFirst({
      where: {
        id: parentTicketId,
        projectId: sprint.projectId,
      },
    });

    if (!parentTicket) {
      throw new Error("El ticket padre no existe en este proyecto");
    }
  }

  const ticket = await prisma.ticket.create({
    data: {
      projectId: sprint.projectId,
      sprintId,
      parentTicketId: parentTicketId || null,
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || "MEDIUM",
      storyPoints:
        storyPoints !== undefined && storyPoints !== null
          ? Number(storyPoints)
          : null,
      assignedToId: assignedToId || null,
      createdById: userId,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours:
        estimatedHours !== undefined && estimatedHours !== null
          ? Number(estimatedHours)
          : null,
      actualHours:
        actualHours !== undefined && actualHours !== null
          ? Number(actualHours)
          : null,
    },
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
      sprint: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  // fire-and-forget — don't block the response
  embedTicket(ticket.id);

  return { ticket, capacityWarning };
}

async function getTicketsBySprint({ sprintId, userId, role }) {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
  });

  if (!sprint) {
    throw new Error("El sprint no existe");
  }

  await validateProjectAccess({
    projectId: sprint.projectId,
    userId,
    role,
  });

  const tickets = await prisma.ticket.findMany({
    where: {
      sprintId,
    },
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
  });

  return tickets;
}

async function getTicketById({ ticketId, userId, role }) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
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
      sprint: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      project: true,
    },
  });

  if (!ticket) {
    throw new Error("El ticket no existe");
  }

  await validateProjectAccess({
    projectId: ticket.projectId,
    userId,
    role,
  });

  return ticket;
}

async function updateTicket({
  ticketId,
  title,
  description,
  priority,
  storyPoints,
  assignedToId,
  estimatedHours,
  actualHours,
  startDate,
  dueDate,
  userId,
  role,
}) {
  if (!["ADMIN", "PM"].includes(role)) {
    throw new Error("No tienes permisos para editar tickets");
  }

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new Error("El ticket no existe");
  }

  await validateProjectAccess({
    projectId: ticket.projectId,
    userId,
    role,
  });

  if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
    throw new Error("La fecha límite no puede ser anterior a la fecha de inicio");
  }

  if (assignedToId) {
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: ticket.projectId,
        userId: assignedToId,
        leftAt: null,
        user: {
          role: "DEVELOPER",
        },
      },
    });

    if (!member) {
      throw new Error("El usuario asignado debe ser developer y pertenecer al proyecto");
    }
  }

  // Capacity check on hour change — non-blocking, returns warning
  let capacityWarning = null;
  if (estimatedHours !== undefined && estimatedHours !== null) {
    const sprint = await prisma.sprint.findUnique({ where: { id: ticket.sprintId } });
    if (sprint && sprint.capacity > 0) {
      const { _sum } = await prisma.ticket.aggregate({
        where: { sprintId: ticket.sprintId, status: { not: "CANCELLED" }, id: { not: ticketId } },
        _sum: { estimatedHours: true },
      });
      const othersCommitted = _sum.estimatedHours ?? 0;
      const newTotal = othersCommitted + Number(estimatedHours);
      if (newTotal > sprint.capacity) {
        capacityWarning = {
          committed: newTotal,
          capacity: sprint.capacity,
          percentage: Math.round((newTotal / sprint.capacity) * 100),
        };
      }
    }
  }

  const updatedTicket = await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      title: title !== undefined ? title.trim() : undefined,
      description:
        description !== undefined ? description?.trim() || null : undefined,
      priority: priority !== undefined ? priority : undefined,
      storyPoints:
        storyPoints !== undefined && storyPoints !== null
          ? Number(storyPoints)
          : undefined,
      assignedToId:
        assignedToId !== undefined ? assignedToId || null : undefined,
      startDate:
        startDate !== undefined
          ? startDate
            ? new Date(startDate)
            : null
          : undefined,
      dueDate:
        dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      estimatedHours:
        estimatedHours !== undefined && estimatedHours !== null
          ? Number(estimatedHours)
          : undefined,
      actualHours:
        actualHours !== undefined && actualHours !== null
          ? Number(actualHours)
          : undefined,
    },
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
      sprint: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  embedTicket(updatedTicket.id);

  return { ticket: updatedTicket, capacityWarning };
}

async function updateTicketStatus({ ticketId, status, actualHours, userId, role }) {
  const validStatuses = [
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "BLOCKED",
    "DONE",
    "CANCELLED",
  ];

  if (!validStatuses.includes(status)) {
    throw new Error("Estado de ticket inválido");
  }

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new Error("El ticket no existe");
  }

  await validateProjectAccess({
    projectId: ticket.projectId,
    userId,
    role,
  });

  const isMovingToInProgress = status === "IN_PROGRESS" && !ticket.startedAt;
  const isMovingToDone = status === "DONE";
  const isLeavingDone = ticket.status === "DONE" && status !== "DONE";

  if (isMovingToDone || isLeavingDone) {
    clearLeaderboardCache();
  }

  const updatedTicket = await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status,
      startedAt: isMovingToInProgress ? new Date() : ticket.startedAt,
      completedAt: isMovingToDone ? new Date() : isLeavingDone ? null : ticket.completedAt,
      actualHours:
        ["ADMIN", "PM"].includes(role) && actualHours !== undefined && actualHours !== null
          ? Number(actualHours)
          : isLeavingDone
          ? null
          : ticket.actualHours,
    },
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
      sprint: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  // GamificationEvent persistence
  if (isMovingToDone && updatedTicket.assignedToId) {
    const score = ticketScore(updatedTicket);
    try {
      await prisma.gamificationEvent.upsert({
        where: { ticketId: updatedTicket.id },
        update: {
          points: score,
          priority: updatedTicket.priority,
          storyPoints: updatedTicket.storyPoints,
          estimatedHours: updatedTicket.estimatedHours,
          actualHours: updatedTicket.actualHours,
          precision: updatedTicket.estimatedHours != null && updatedTicket.actualHours != null
            ? updatedTicket.actualHours <= updatedTicket.estimatedHours * 1.15
            : false,
        },
        create: {
          ticketId: updatedTicket.id,
          userId: updatedTicket.assignedToId,
          projectId: updatedTicket.projectId,
          points: score,
          priority: updatedTicket.priority,
          storyPoints: updatedTicket.storyPoints,
          estimatedHours: updatedTicket.estimatedHours,
          actualHours: updatedTicket.actualHours,
          precision: updatedTicket.estimatedHours != null && updatedTicket.actualHours != null
            ? updatedTicket.actualHours <= updatedTicket.estimatedHours * 1.15
            : false,
        },
      });
    } catch (e) {
      console.error("[Gamification] upsert failed:", e.message);
    }
  } else if (isLeavingDone) {
    prisma.gamificationEvent.deleteMany({
      where: { ticketId: updatedTicket.id },
    }).catch(() => {});
  }

  embedTicket(updatedTicket.id);

  return updatedTicket;
}

async function deleteTicket({ ticketId, userId, role }) {
  if (!["ADMIN", "PM"].includes(role)) {
    throw new Error("No tienes permisos para eliminar tickets");
  }

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new Error("El ticket no existe");
  }

  await validateProjectAccess({
    projectId: ticket.projectId,
    userId,
    role,
  });

  await prisma.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  return {
    message: "Ticket eliminado correctamente",
  };
}

module.exports = {
  createTicket,
  getTicketsBySprint,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
};