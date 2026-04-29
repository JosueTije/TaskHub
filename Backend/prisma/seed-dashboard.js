const prisma = require("../src/config/prisma");

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", deletedAt: null },
  });

  const pm = await prisma.user.findFirst({
    where: { role: "PM", deletedAt: null },
  });

  const developers = await prisma.user.findMany({
    where: { role: "DEVELOPER", deletedAt: null },
    take: 3,
  });

  if (!admin || !pm || developers.length < 2) {
    throw new Error("Necesitas al menos 1 ADMIN, 1 PM y 2 DEVELOPERS activos.");
  }

  const project = await prisma.project.create({
    data: {
      name: "TaskHub Analytics Demo",
      code: `TASKHUB-DEMO-${Date.now()}`,
      description: "Proyecto demo para probar KPIs, métricas y gráficas reales.",
      status: "ACTIVE",
      riskLevel: "MEDIUM",
      createdById: admin.id,
      pmId: pm.id,
      startDate: new Date("2026-04-01"),
      targetEndDate: new Date("2026-06-30"),
      budget: 150000,
    },
  });

  await prisma.projectMember.createMany({
    data: [admin.id, pm.id, ...developers.map((d) => d.id)].map((userId) => ({
      projectId: project.id,
      userId,
    })),
    skipDuplicates: true,
  });

  const sprint1 = await prisma.sprint.create({
    data: {
      projectId: project.id,
      name: "Sprint 1 - Foundation",
      goal: "Configurar base del proyecto",
      status: "COMPLETED",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-14"),
      completedAt: new Date("2026-04-14"),
      capacity: 40,
    },
  });

  const sprint2 = await prisma.sprint.create({
    data: {
      projectId: project.id,
      name: "Sprint 2 - Core Features",
      goal: "Construir funcionalidades principales",
      status: "ACTIVE",
      startDate: new Date("2026-04-15"),
      endDate: new Date("2026-04-30"),
      capacity: 45,
    },
  });

  const sprint3 = await prisma.sprint.create({
    data: {
      projectId: project.id,
      name: "Sprint 3 - Dashboard & Analytics",
      goal: "Conectar métricas reales",
      status: "PLANNING",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-05-15"),
      capacity: 50,
    },
  });

  const tickets = [
    {
      sprintId: sprint1.id,
      title: "Configurar repositorio frontend",
      status: "DONE",
      priority: "HIGH",
      storyPoints: 5,
      assignedToId: developers[0].id,
      completedAt: new Date("2026-04-05"),
    },
    {
      sprintId: sprint1.id,
      title: "Configurar backend Express",
      status: "DONE",
      priority: "HIGH",
      storyPoints: 8,
      assignedToId: developers[1].id,
      completedAt: new Date("2026-04-08"),
    },
    {
      sprintId: sprint1.id,
      title: "Crear modelos Prisma",
      status: "DONE",
      priority: "MEDIUM",
      storyPoints: 5,
      assignedToId: developers[0].id,
      completedAt: new Date("2026-04-10"),
    },
    {
      sprintId: sprint1.id,
      title: "Configurar autenticación JWT",
      status: "DONE",
      priority: "HIGH",
      storyPoints: 8,
      assignedToId: developers[1].id,
      completedAt: new Date("2026-04-13"),
    },
    {
      sprintId: sprint2.id,
      title: "Crear tickets desde frontend",
      status: "DONE",
      priority: "HIGH",
      storyPoints: 8,
      assignedToId: developers[0].id,
      completedAt: new Date("2026-04-20"),
    },
    {
      sprintId: sprint2.id,
      title: "Actualizar estado de tickets",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: 5,
      assignedToId: developers[1].id,
      startedAt: new Date("2026-04-22"),
    },
    {
      sprintId: sprint2.id,
      title: "Corregir persistencia de tickets",
      status: "BLOCKED",
      priority: "HIGH",
      storyPoints: 13,
      assignedToId: developers[0].id,
      startedAt: new Date("2026-04-23"),
    },
    {
      sprintId: sprint2.id,
      title: "Mostrar KPIs reales",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      storyPoints: 8,
      assignedToId: developers[1].id,
      startedAt: new Date("2026-04-24"),
    },
    {
      sprintId: sprint2.id,
      title: "Diseñar vista Kanban",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: 5,
      assignedToId: developers[0].id,
    },
    {
      sprintId: sprint3.id,
      title: "Crear endpoint analytics dashboard",
      status: "TODO",
      priority: "HIGH",
      storyPoints: 8,
      assignedToId: developers[1].id,
    },
    {
      sprintId: sprint3.id,
      title: "Crear gráfica Planned vs Actual",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: 5,
      assignedToId: developers[0].id,
    },
    {
      sprintId: sprint3.id,
      title: "Crear métricas por developer",
      status: "TODO",
      priority: "LOW",
      storyPoints: 3,
      assignedToId: developers[1].id,
    },
  ];

  for (const ticket of tickets) {
    await prisma.ticket.create({
      data: {
        projectId: project.id,
        sprintId: ticket.sprintId,
        title: ticket.title,
        description: `Ticket demo: ${ticket.title}`,
        status: ticket.status,
        priority: ticket.priority,
        storyPoints: ticket.storyPoints,
        estimatedHours: ticket.storyPoints,
        assignedToId: ticket.assignedToId,
        createdById: pm.id,
        startedAt: ticket.startedAt || null,
        completedAt: ticket.completedAt || null,
      },
    });
  }

  console.log("Proyecto demo creado:");
  console.log(project.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });