const { createTicket, updateTicketStatus } = require("../services/ticket.service");

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock("../config/prisma", () => ({
  sprint: { findUnique: jest.fn() },
  ticket: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({}),
  },
  project: { findFirst: jest.fn() },
  projectMember: { findFirst: jest.fn() },
  gamificationEvent: {
    upsert: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("../services/gamification.service", () => ({
  clearLeaderboardCache: jest.fn(),
}));

jest.mock("../services/rag.service", () => ({
  embedTicket: jest.fn(),
}));

jest.mock("../utils/scoring", () => ({
  ticketScore: jest.fn(() => 10),
}));

const prisma = require("../config/prisma");

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockProject = {
  id: "proj-1",
  pmId: "user-pm",
  createdById: "user-pm",
  archivedAt: null,
  members: [{ userId: "user-pm", leftAt: null }],
};

const mockSprint = {
  id: "sprint-1",
  projectId: "proj-1",
  status: "ACTIVE",
  capacity: 100,
  project: mockProject,
};

const mockTicket = {
  id: "ticket-1",
  projectId: "proj-1",
  sprintId: "sprint-1",
  status: "TODO",
  startedAt: null,
  completedAt: null,
  actualHours: null,
  assignedToId: "dev-1",
  estimatedHours: 8,
  storyPoints: 3,
  priority: "MEDIUM",
};

// ── createTicket ──────────────────────────────────────────────────────────────
describe("createTicket", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lanza error si faltan sprintId o title", async () => {
    await expect(createTicket({ sprintId: null, title: "", userId: "u1", role: "PM" }))
      .rejects.toThrow("sprintId y title son obligatorios");
  });

  test("lanza error si el rol no es ADMIN ni PM", async () => {
    await expect(createTicket({ sprintId: "s1", title: "T1", userId: "u1", role: "DEVELOPER" }))
      .rejects.toThrow("No tienes permisos para crear tickets");
  });

  test("lanza error si dueDate es anterior a startDate", async () => {
    await expect(createTicket({
      sprintId: "s1",
      title: "T1",
      userId: "u1",
      role: "PM",
      startDate: "2025-06-10",
      dueDate: "2025-06-01",
    })).rejects.toThrow("La fecha límite no puede ser anterior");
  });

  test("lanza error si el sprint no existe", async () => {
    prisma.sprint.findUnique.mockResolvedValue(null);

    await expect(createTicket({ sprintId: "nope", title: "T", userId: "u1", role: "PM" }))
      .rejects.toThrow("El sprint no existe");
  });

  test("lanza error si el sprint está cerrado", async () => {
    prisma.sprint.findUnique.mockResolvedValue({ ...mockSprint, status: "COMPLETED" });

    await expect(createTicket({ sprintId: "sprint-1", title: "T", userId: "u1", role: "PM" }))
      .rejects.toThrow("sprint cerrado o cancelado");
  });

  test("crea el ticket correctamente con rol PM", async () => {
    prisma.sprint.findUnique.mockResolvedValue(mockSprint);
    prisma.project.findFirst.mockResolvedValue(mockProject);
    prisma.ticket.aggregate.mockResolvedValue({ _sum: { estimatedHours: 10 } });
    prisma.ticket.create.mockResolvedValue({ ...mockTicket, title: "Mi ticket" });

    const { ticket } = await createTicket({
      sprintId: "sprint-1",
      title: "Mi ticket",
      userId: "user-pm",
      role: "PM",
    });

    expect(ticket.title).toBe("Mi ticket");
    expect(prisma.ticket.create).toHaveBeenCalledTimes(1);
  });
});

// ── updateTicketStatus ────────────────────────────────────────────────────────
describe("updateTicketStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lanza error con estado inválido", async () => {
    await expect(updateTicketStatus({ ticketId: "t1", status: "INVALID", userId: "u1", role: "PM" }))
      .rejects.toThrow("Estado de ticket inválido");
  });

  test("lanza error si el ticket no existe", async () => {
    prisma.ticket.findUnique.mockResolvedValue(null);

    await expect(updateTicketStatus({ ticketId: "nope", status: "IN_PROGRESS", userId: "u1", role: "PM" }))
      .rejects.toThrow("El ticket no existe");
  });

  test("DEVELOPER no puede mover a IN_REVIEW", async () => {
    prisma.ticket.findUnique.mockResolvedValue(mockTicket);

    await expect(updateTicketStatus({ ticketId: "ticket-1", status: "IN_REVIEW", userId: "dev-1", role: "DEVELOPER" }))
      .rejects.toThrow("No tienes permiso para asignar ese estado al ticket");
  });

  test("DEVELOPER no puede mover a DONE desde un estado que no es DONE", async () => {
    prisma.ticket.findUnique.mockResolvedValue({ ...mockTicket, status: "IN_PROGRESS" });

    await expect(updateTicketStatus({ ticketId: "ticket-1", status: "DONE", userId: "dev-1", role: "DEVELOPER" }))
      .rejects.toThrow("No tienes permiso para asignar ese estado al ticket");
  });

  test("DEVELOPER puede guardar actualHours si el ticket ya está DONE", async () => {
    const doneTicket = { ...mockTicket, status: "DONE" };
    prisma.ticket.findUnique.mockResolvedValue(doneTicket);
    prisma.project.findFirst.mockResolvedValue(mockProject);
    prisma.ticket.update.mockResolvedValue({ ...doneTicket, actualHours: 6 });
    prisma.gamificationEvent.upsert.mockResolvedValue({});

    const result = await updateTicketStatus({
      ticketId: "ticket-1",
      status: "DONE",
      actualHours: 6,
      userId: "dev-1",
      role: "DEVELOPER",
    });

    expect(result.actualHours).toBe(6);
  });

  test("PM puede mover ticket de TODO a IN_PROGRESS", async () => {
    prisma.ticket.findUnique.mockResolvedValue(mockTicket);
    prisma.project.findFirst.mockResolvedValue(mockProject);
    prisma.ticket.update.mockResolvedValue({ ...mockTicket, status: "IN_PROGRESS", startedAt: new Date() });

    const result = await updateTicketStatus({
      ticketId: "ticket-1",
      status: "IN_PROGRESS",
      userId: "user-pm",
      role: "PM",
    });

    expect(result.status).toBe("IN_PROGRESS");
  });
});
