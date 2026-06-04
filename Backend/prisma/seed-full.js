/**
 * Full mock seed — 6 devs, 2 PMs, 4 projects con escenarios distintos
 * Corre con: node prisma/seed-full.js
 */
require("dotenv").config();
const prisma = require("../src/config/prisma");
const bcrypt = require("bcryptjs");

// ─── helpers ─────────────────────────────────────────────────────────────────

const d = (str) => new Date(str);

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function upsertUser(data) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: { fullName: data.fullName, role: data.role, status: "ACTIVE", mustChangePassword: false },
    create: data,
  });
}

async function addMembers(projectId, userIds) {
  await prisma.projectMember.createMany({
    data: userIds.map((userId) => ({ projectId, userId })),
    skipDuplicates: true,
  });
}

async function upsertProject(code, data) {
  return prisma.project.upsert({
    where: { code },
    update: {},
    create: { code, ...data },
  });
}

function ticket({ title, status, priority, sp, devId, pmId, projectId, sprintId, est, actual, completedAt, dueDate, startedAt }) {
  return {
    title,
    description: `${title}. Tarea generada por seed.`,
    status,
    priority,
    storyPoints: sp,
    estimatedHours: est ?? sp * 2,
    actualHours: status === "DONE" ? (actual ?? sp * 2) : null,
    assignedToId: devId,
    createdById: pmId,
    projectId,
    sprintId,
    completedAt: status === "DONE" ? (completedAt ?? null) : null,
    startedAt: ["IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE"].includes(status) ? (startedAt ?? null) : null,
    dueDate: dueDate ?? null,
  };
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding...");

  const devHash  = await bcrypt.hash("Dev123!", 10);
  const pmHash   = await bcrypt.hash("PM123!", 10);
  const adminHash = await bcrypt.hash("Admin123!", 10);

  // ── Users ──────────────────────────────────────────────────────────────────

  const admin = await upsertUser({
    email: "admin@taskhub.com", passwordHash: adminHash,
    fullName: "Admin TaskHub", role: "ADMIN", status: "ACTIVE", mustChangePassword: false,
  });

  const pm1 = await upsertUser({
    email: "pm@taskhub.com", passwordHash: pmHash,
    fullName: "Ana Martínez", role: "PM", status: "ACTIVE", mustChangePassword: false,
  });

  const pm2 = await upsertUser({
    email: "pm2@taskhub.com", passwordHash: pmHash,
    fullName: "Roberto García", role: "PM", status: "ACTIVE", mustChangePassword: false,
  });

  const carlos = await upsertUser({
    email: "carlos@taskhub.com", passwordHash: devHash,
    fullName: "Carlos Mendoza", role: "DEVELOPER", status: "ACTIVE", mustChangePassword: false,
  });

  const sofia = await upsertUser({
    email: "sofia@taskhub.com", passwordHash: devHash,
    fullName: "Sofía Torres", role: "DEVELOPER", status: "ACTIVE", mustChangePassword: false,
  });

  const diego = await upsertUser({
    email: "diego@taskhub.com", passwordHash: devHash,
    fullName: "Diego Morales", role: "DEVELOPER", status: "ACTIVE", mustChangePassword: false,
  });

  const andrea = await upsertUser({
    email: "andrea@taskhub.com", passwordHash: devHash,
    fullName: "Andrea López", role: "DEVELOPER", status: "ACTIVE", mustChangePassword: false,
  });

  const miguel = await upsertUser({
    email: "miguel@taskhub.com", passwordHash: devHash,
    fullName: "Miguel Ángel Ruiz", role: "DEVELOPER", status: "ACTIVE", mustChangePassword: false,
  });

  const laura = await upsertUser({
    email: "laura@taskhub.com", passwordHash: devHash,
    fullName: "Laura Sánchez", role: "DEVELOPER", status: "ACTIVE", mustChangePassword: false,
  });

  // Keep existing dev@taskhub.com and dev2@taskhub.com working
  await upsertUser({
    email: "dev@taskhub.com", passwordHash: devHash,
    fullName: "Developer TaskHub", role: "DEVELOPER", status: "ACTIVE", mustChangePassword: false,
  });
  await upsertUser({
    email: "dev2@taskhub.com", passwordHash: devHash,
    fullName: "Dev Two TaskHub", role: "DEVELOPER", status: "ACTIVE", mustChangePassword: false,
  });

  console.log("✅ Usuarios creados");

  // ══════════════════════════════════════════════════════════════════════════
  // PROJECT 1 — E-Commerce Platform (ACTIVE, MEDIUM risk, on track)
  // SPI ~1.0, 1 blocker, 1 delayed
  // ══════════════════════════════════════════════════════════════════════════

  const p1 = await upsertProject("ECOM-2026", {
    name: "E-Commerce Platform",
    description: "Plataforma de ventas online con carrito, pagos y gestión de inventario.",
    status: "ACTIVE", riskLevel: "MEDIUM",
    createdById: admin.id, pmId: pm1.id,
    startDate: d("2026-04-01"), targetEndDate: d("2026-07-31"),
    budget: 180000,
  });
  await addMembers(p1.id, [admin.id, pm1.id, carlos.id, sofia.id, diego.id, andrea.id]);

  const p1s1 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p1.id, name: "Sprint 1 – Setup" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p1.id, name: "Sprint 1 – Setup", goal: "Infraestructura y autenticación",
      status: "COMPLETED", capacity: 40,
      startDate: d("2026-04-01"), endDate: d("2026-04-14"), completedAt: d("2026-04-14"),
    },
  });

  const p1s2 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p1.id, name: "Sprint 2 – Catálogo" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p1.id, name: "Sprint 2 – Catálogo", goal: "Catálogo de productos y búsqueda",
      status: "COMPLETED", capacity: 45,
      startDate: d("2026-04-15"), endDate: d("2026-04-30"), completedAt: d("2026-04-30"),
    },
  });

  const p1s3 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p1.id, name: "Sprint 3 – Carrito y Pagos" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p1.id, name: "Sprint 3 – Carrito y Pagos", goal: "Flujo de compra completo",
      status: "ACTIVE", capacity: 50,
      startDate: d("2026-05-05"), endDate: d("2026-05-23"),
    },
  });

  const p1s4 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p1.id, name: "Sprint 4 – Admin Panel" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p1.id, name: "Sprint 4 – Admin Panel", goal: "Panel de administración y reportes",
      status: "PLANNING", capacity: 45,
      startDate: d("2026-06-02"), endDate: d("2026-06-16"),
    },
  });

  const p1tickets = [
    // Sprint 1 – all done
    ticket({ title: "Configurar monorepo y CI/CD",           status: "DONE", priority: "HIGH",     sp: 5,  devId: carlos.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s1.id, est: 10, actual: 9,  completedAt: d("2026-04-03") }),
    ticket({ title: "Diseñar schema de base de datos",        status: "DONE", priority: "HIGH",     sp: 8,  devId: sofia.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s1.id, est: 16, actual: 18, completedAt: d("2026-04-06") }),
    ticket({ title: "Implementar autenticación JWT",           status: "DONE", priority: "CRITICAL", sp: 8,  devId: carlos.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s1.id, est: 16, actual: 14, completedAt: d("2026-04-08") }),
    ticket({ title: "Setup de entorno de producción",          status: "DONE", priority: "MEDIUM",   sp: 5,  devId: diego.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s1.id, est: 10, actual: 11, completedAt: d("2026-04-10") }),
    ticket({ title: "Crear endpoints de usuarios",             status: "DONE", priority: "HIGH",     sp: 5,  devId: andrea.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s1.id, est: 10, actual: 10, completedAt: d("2026-04-13") }),
    ticket({ title: "Tests unitarios de autenticación",        status: "DONE", priority: "MEDIUM",   sp: 3,  devId: sofia.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s1.id, est: 6,  actual: 5,  completedAt: d("2026-04-14") }),
    // Sprint 2 – all done
    ticket({ title: "CRUD de productos",                       status: "DONE", priority: "HIGH",     sp: 8,  devId: carlos.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s2.id, est: 16, actual: 15, completedAt: d("2026-04-18") }),
    ticket({ title: "Subida de imágenes (S3)",                 status: "DONE", priority: "HIGH",     sp: 5,  devId: diego.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s2.id, est: 10, actual: 12, completedAt: d("2026-04-21") }),
    ticket({ title: "Motor de búsqueda y filtros",             status: "DONE", priority: "HIGH",     sp: 8,  devId: sofia.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s2.id, est: 16, actual: 16, completedAt: d("2026-04-24") }),
    ticket({ title: "Sistema de categorías",                   status: "DONE", priority: "MEDIUM",   sp: 5,  devId: andrea.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s2.id, est: 10, actual: 9,  completedAt: d("2026-04-25") }),
    ticket({ title: "Paginación en listados",                  status: "DONE", priority: "LOW",      sp: 3,  devId: carlos.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s2.id, est: 6,  actual: 4,  completedAt: d("2026-04-27") }),
    ticket({ title: "UI de catálogo de productos",             status: "DONE", priority: "HIGH",     sp: 8,  devId: sofia.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s2.id, est: 16, actual: 17, completedAt: d("2026-04-29") }),
    // Sprint 3 – mixed (active now)
    ticket({ title: "Implementar carrito de compras",          status: "DONE",        priority: "CRITICAL", sp: 13, devId: carlos.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s3.id, est: 26, actual: 24, completedAt: d("2026-05-09") }),
    ticket({ title: "Integración con Stripe",                  status: "DONE",        priority: "CRITICAL", sp: 13, devId: diego.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s3.id, est: 26, actual: 28, completedAt: d("2026-05-13") }),
    ticket({ title: "UI de checkout",                          status: "IN_REVIEW",   priority: "HIGH",     sp: 8,  devId: sofia.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s3.id, startedAt: d("2026-05-14") }),
    ticket({ title: "Manejo de errores en pagos",              status: "IN_PROGRESS", priority: "HIGH",     sp: 5,  devId: andrea.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s3.id, startedAt: d("2026-05-16") }),
    ticket({ title: "Notificaciones de compra por email",      status: "BLOCKED",     priority: "HIGH",     sp: 5,  devId: carlos.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s3.id, startedAt: d("2026-05-12"), dueDate: d("2026-05-17") }),
    ticket({ title: "Tests de integración de pagos",           status: "TODO",        priority: "HIGH",     sp: 5,  devId: diego.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s3.id }),
    ticket({ title: "Pantalla de confirmación de orden",       status: "TODO",        priority: "MEDIUM",   sp: 3,  devId: sofia.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s3.id }),
    // Sprint 4 – planning
    ticket({ title: "Panel de gestión de órdenes",             status: "TODO",        priority: "HIGH",     sp: 8,  devId: carlos.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s4.id }),
    ticket({ title: "Reportes de ventas",                      status: "TODO",        priority: "MEDIUM",   sp: 5,  devId: andrea.id, pmId: pm1.id, projectId: p1.id, sprintId: p1s4.id }),
    ticket({ title: "Dashboard de inventario",                 status: "TODO",        priority: "MEDIUM",   sp: 5,  devId: diego.id,  pmId: pm1.id, projectId: p1.id, sprintId: p1s4.id }),
  ];

  await prisma.ticket.createMany({ data: p1tickets, skipDuplicates: false });
  console.log("✅ Proyecto 1 creado (E-Commerce Platform)");

  // ══════════════════════════════════════════════════════════════════════════
  // PROJECT 2 — Mobile Banking App (ACTIVE, HIGH risk, behind schedule)
  // SPI ~0.65, 4 blockers, 4 delayed
  // ══════════════════════════════════════════════════════════════════════════

  const p2 = await upsertProject("MBANK-2026", {
    name: "Mobile Banking App",
    description: "Aplicación bancaria móvil con transferencias, pagos y seguridad biométrica.",
    status: "ACTIVE", riskLevel: "HIGH",
    createdById: admin.id, pmId: pm2.id,
    startDate: d("2026-03-15"), targetEndDate: d("2026-06-30"),
    budget: 320000,
  });
  await addMembers(p2.id, [admin.id, pm2.id, carlos.id, miguel.id, laura.id]);

  const p2s1 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p2.id, name: "Sprint 1 – Core Banking" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p2.id, name: "Sprint 1 – Core Banking", goal: "Modelo de datos bancario y auth",
      status: "COMPLETED", capacity: 50,
      startDate: d("2026-03-15"), endDate: d("2026-03-31"), completedAt: d("2026-04-02"),
    },
  });

  const p2s2 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p2.id, name: "Sprint 2 – Transferencias" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p2.id, name: "Sprint 2 – Transferencias", goal: "Módulo de transferencias y saldos",
      status: "COMPLETED", capacity: 55,
      startDate: d("2026-04-01"), endDate: d("2026-04-20"), completedAt: d("2026-04-24"),
    },
  });

  const p2s3 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p2.id, name: "Sprint 3 – Seguridad" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p2.id, name: "Sprint 3 – Seguridad", goal: "Biometría, cifrado y auditoría",
      status: "ACTIVE", capacity: 60,
      startDate: d("2026-04-28"), endDate: d("2026-05-25"),
    },
  });

  const p2s4 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p2.id, name: "Sprint 4 – UI Móvil" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p2.id, name: "Sprint 4 – UI Móvil", goal: "Interfaz nativa iOS y Android",
      status: "PLANNING", capacity: 55,
      startDate: d("2026-06-02"), endDate: d("2026-06-20"),
    },
  });

  const p2tickets = [
    // Sprint 1
    ticket({ title: "Modelo de datos: cuentas y transacciones",  status: "DONE", priority: "CRITICAL", sp: 13, devId: carlos.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s1.id, est: 26, actual: 32, completedAt: d("2026-03-22") }),
    ticket({ title: "Autenticación bancaria multifactor",         status: "DONE", priority: "CRITICAL", sp: 13, devId: miguel.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s1.id, est: 26, actual: 35, completedAt: d("2026-03-27") }),
    ticket({ title: "Encriptación de datos sensibles",            status: "DONE", priority: "HIGH",     sp: 8,  devId: laura.id,  pmId: pm2.id, projectId: p2.id, sprintId: p2s1.id, est: 16, actual: 20, completedAt: d("2026-03-29") }),
    ticket({ title: "Setup de ambiente de staging bancario",      status: "DONE", priority: "HIGH",     sp: 5,  devId: carlos.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s1.id, est: 10, actual: 14, completedAt: d("2026-03-31") }),
    // Sprint 2
    ticket({ title: "API de transferencias internas",             status: "DONE", priority: "CRITICAL", sp: 13, devId: miguel.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s2.id, est: 26, actual: 38, completedAt: d("2026-04-10") }),
    ticket({ title: "API de transferencias SPEI",                 status: "DONE", priority: "CRITICAL", sp: 13, devId: carlos.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s2.id, est: 26, actual: 30, completedAt: d("2026-04-15") }),
    ticket({ title: "Consulta de saldos en tiempo real",          status: "DONE", priority: "HIGH",     sp: 8,  devId: laura.id,  pmId: pm2.id, projectId: p2.id, sprintId: p2s2.id, est: 16, actual: 19, completedAt: d("2026-04-18") }),
    ticket({ title: "Historial de movimientos",                   status: "DONE", priority: "HIGH",     sp: 5,  devId: miguel.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s2.id, est: 10, actual: 16, completedAt: d("2026-04-22") }),
    ticket({ title: "Límites diarios de transferencia",           status: "DONE", priority: "MEDIUM",   sp: 5,  devId: carlos.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s2.id, est: 10, actual: 13, completedAt: d("2026-04-24") }),
    // Sprint 3 – active, behind
    ticket({ title: "Autenticación biométrica (Face ID)",         status: "IN_PROGRESS", priority: "CRITICAL", sp: 13, devId: miguel.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s3.id, startedAt: d("2026-04-29"), dueDate: d("2026-05-10") }),
    ticket({ title: "Autenticación biométrica (Touch ID)",        status: "BLOCKED",     priority: "CRITICAL", sp: 13, devId: laura.id,  pmId: pm2.id, projectId: p2.id, sprintId: p2s3.id, startedAt: d("2026-05-02"), dueDate: d("2026-05-12") }),
    ticket({ title: "Auditoría de accesos y transacciones",       status: "BLOCKED",     priority: "HIGH",     sp: 8,  devId: carlos.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s3.id, startedAt: d("2026-05-05"), dueDate: d("2026-05-14") }),
    ticket({ title: "Detección de fraude con ML",                 status: "BLOCKED",     priority: "HIGH",     sp: 13, devId: miguel.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s3.id, startedAt: d("2026-05-07"), dueDate: d("2026-05-16") }),
    ticket({ title: "Certificados SSL y pinning",                 status: "BLOCKED",     priority: "CRITICAL", sp: 8,  devId: laura.id,  pmId: pm2.id, projectId: p2.id, sprintId: p2s3.id, startedAt: d("2026-05-08"), dueDate: d("2026-05-15") }),
    ticket({ title: "Notificaciones push de movimientos",         status: "TODO",        priority: "HIGH",     sp: 5,  devId: carlos.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s3.id, dueDate: d("2026-05-18") }),
    ticket({ title: "Cifrado de base de datos en reposo",         status: "TODO",        priority: "CRITICAL", sp: 8,  devId: miguel.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s3.id, dueDate: d("2026-05-19") }),
    ticket({ title: "Pruebas de penetración",                     status: "TODO",        priority: "HIGH",     sp: 8,  devId: laura.id,  pmId: pm2.id, projectId: p2.id, sprintId: p2s3.id }),
    ticket({ title: "Documentación de seguridad",                 status: "TODO",        priority: "MEDIUM",   sp: 3,  devId: carlos.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s3.id }),
    // Sprint 4 – planning
    ticket({ title: "UI nativa iOS – pantalla principal",         status: "TODO", priority: "HIGH",   sp: 8,  devId: miguel.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s4.id }),
    ticket({ title: "UI nativa Android – pantalla principal",     status: "TODO", priority: "HIGH",   sp: 8,  devId: laura.id,  pmId: pm2.id, projectId: p2.id, sprintId: p2s4.id }),
    ticket({ title: "Animaciones de transición",                  status: "TODO", priority: "LOW",    sp: 3,  devId: carlos.id, pmId: pm2.id, projectId: p2.id, sprintId: p2s4.id }),
  ];

  await prisma.ticket.createMany({ data: p2tickets, skipDuplicates: false });
  console.log("✅ Proyecto 2 creado (Mobile Banking App)");

  // ══════════════════════════════════════════════════════════════════════════
  // PROJECT 3 — DataFlow Analytics (ACTIVE, LOW risk, ahead of schedule)
  // SPI ~1.3 — equipo pequeño pero muy eficiente
  // ══════════════════════════════════════════════════════════════════════════

  const p3 = await upsertProject("DFLOW-2026", {
    name: "DataFlow Analytics",
    description: "Plataforma de analítica de datos en tiempo real con visualizaciones interactivas.",
    status: "ACTIVE", riskLevel: "LOW",
    createdById: admin.id, pmId: pm1.id,
    startDate: d("2026-04-15"), targetEndDate: d("2026-07-15"),
    budget: 120000,
  });
  await addMembers(p3.id, [admin.id, pm1.id, sofia.id, andrea.id, laura.id]);

  const p3s1 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p3.id, name: "Sprint 1 – Ingesta de Datos" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p3.id, name: "Sprint 1 – Ingesta de Datos", goal: "Pipeline ETL y conectores",
      status: "COMPLETED", capacity: 35,
      startDate: d("2026-04-15"), endDate: d("2026-04-30"), completedAt: d("2026-04-28"),
    },
  });

  const p3s2 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p3.id, name: "Sprint 2 – Visualizaciones" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p3.id, name: "Sprint 2 – Visualizaciones", goal: "Charts interactivos y dashboards",
      status: "COMPLETED", capacity: 40,
      startDate: d("2026-05-01"), endDate: d("2026-05-14"), completedAt: d("2026-05-13"),
    },
  });

  const p3s3 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p3.id, name: "Sprint 3 – ML y Predicciones" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p3.id, name: "Sprint 3 – ML y Predicciones", goal: "Modelos predictivos integrados",
      status: "ACTIVE", capacity: 45,
      startDate: d("2026-05-15"), endDate: d("2026-05-31"),
    },
  });

  const p3s4 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p3.id, name: "Sprint 4 – Exportación" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p3.id, name: "Sprint 4 – Exportación", goal: "Reportes PDF, Excel y alertas",
      status: "PLANNING", capacity: 35,
      startDate: d("2026-06-02"), endDate: d("2026-06-16"),
    },
  });

  const p3tickets = [
    // Sprint 1 – done ahead of schedule
    ticket({ title: "Conector PostgreSQL",          status: "DONE", priority: "HIGH",     sp: 5,  devId: sofia.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s1.id, est: 10, actual: 8,  completedAt: d("2026-04-18") }),
    ticket({ title: "Conector MySQL",               status: "DONE", priority: "MEDIUM",   sp: 3,  devId: andrea.id, pmId: pm1.id, projectId: p3.id, sprintId: p3s1.id, est: 6,  actual: 4,  completedAt: d("2026-04-20") }),
    ticket({ title: "Pipeline ETL con Kafka",        status: "DONE", priority: "HIGH",     sp: 8,  devId: laura.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s1.id, est: 16, actual: 13, completedAt: d("2026-04-23") }),
    ticket({ title: "Almacenamiento en ClickHouse", status: "DONE", priority: "HIGH",     sp: 8,  devId: sofia.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s1.id, est: 16, actual: 14, completedAt: d("2026-04-25") }),
    ticket({ title: "API de consulta de datos",     status: "DONE", priority: "HIGH",     sp: 5,  devId: andrea.id, pmId: pm1.id, projectId: p3.id, sprintId: p3s1.id, est: 10, actual: 8,  completedAt: d("2026-04-27") }),
    // Sprint 2 – done
    ticket({ title: "Gráficas de línea y barras",   status: "DONE", priority: "HIGH",     sp: 8,  devId: sofia.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s2.id, est: 16, actual: 13, completedAt: d("2026-05-04") }),
    ticket({ title: "Heatmaps y treemaps",           status: "DONE", priority: "MEDIUM",   sp: 5,  devId: laura.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s2.id, est: 10, actual: 8,  completedAt: d("2026-05-06") }),
    ticket({ title: "Dashboard configurable",        status: "DONE", priority: "CRITICAL", sp: 13, devId: andrea.id, pmId: pm1.id, projectId: p3.id, sprintId: p3s2.id, est: 26, actual: 21, completedAt: d("2026-05-09") }),
    ticket({ title: "Filtros y drill-down",          status: "DONE", priority: "HIGH",     sp: 8,  devId: sofia.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s2.id, est: 16, actual: 13, completedAt: d("2026-05-11") }),
    ticket({ title: "Refresh automático en tiempo real", status: "DONE", priority: "HIGH", sp: 5, devId: laura.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s2.id, est: 10, actual: 9,  completedAt: d("2026-05-12") }),
    // Sprint 3 – active, ahead
    ticket({ title: "Modelo de regresión lineal",   status: "DONE",        priority: "HIGH",   sp: 8,  devId: andrea.id, pmId: pm1.id, projectId: p3.id, sprintId: p3s3.id, est: 16, actual: 12, completedAt: d("2026-05-17") }),
    ticket({ title: "Detección de anomalías",        status: "DONE",        priority: "HIGH",   sp: 8,  devId: sofia.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s3.id, est: 16, actual: 14, completedAt: d("2026-05-19") }),
    ticket({ title: "Predicción de series temporales", status: "IN_REVIEW", priority: "HIGH",   sp: 13, devId: laura.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s3.id, startedAt: d("2026-05-18") }),
    ticket({ title: "API de predicciones",           status: "IN_PROGRESS", priority: "MEDIUM", sp: 5,  devId: andrea.id, pmId: pm1.id, projectId: p3.id, sprintId: p3s3.id, startedAt: d("2026-05-19") }),
    ticket({ title: "Visualización de predicciones", status: "TODO",        priority: "MEDIUM", sp: 5,  devId: sofia.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s3.id }),
    // Sprint 4 – planning
    ticket({ title: "Exportación a PDF",             status: "TODO", priority: "HIGH",   sp: 5,  devId: laura.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s4.id }),
    ticket({ title: "Exportación a Excel",           status: "TODO", priority: "HIGH",   sp: 5,  devId: andrea.id, pmId: pm1.id, projectId: p3.id, sprintId: p3s4.id }),
    ticket({ title: "Sistema de alertas por email",  status: "TODO", priority: "MEDIUM", sp: 5,  devId: sofia.id,  pmId: pm1.id, projectId: p3.id, sprintId: p3s4.id }),
  ];

  await prisma.ticket.createMany({ data: p3tickets, skipDuplicates: false });
  console.log("✅ Proyecto 3 creado (DataFlow Analytics)");

  // ══════════════════════════════════════════════════════════════════════════
  // PROJECT 4 — Legacy Migration (COMPLETED / ARCHIVED)
  // ══════════════════════════════════════════════════════════════════════════

  const p4 = await upsertProject("LEGCY-2025", {
    name: "Legacy System Migration",
    description: "Migración del sistema ERP legacy a arquitectura de microservicios moderna.",
    status: "ARCHIVED", riskLevel: "LOW",
    createdById: admin.id, pmId: pm2.id,
    startDate: d("2025-10-01"), targetEndDate: d("2026-01-31"),
    actualEndDate: d("2026-01-28"),
    archivedAt: d("2026-02-01"),
    budget: 200000,
  });
  await addMembers(p4.id, [admin.id, pm2.id, carlos.id, miguel.id]);

  const p4s1 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p4.id, name: "Sprint 1 – Análisis" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p4.id, name: "Sprint 1 – Análisis", goal: "Mapeo del sistema legacy",
      status: "COMPLETED", capacity: 30,
      startDate: d("2025-10-01"), endDate: d("2025-10-15"), completedAt: d("2025-10-15"),
    },
  });

  const p4s2 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p4.id, name: "Sprint 2 – Migración DB" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p4.id, name: "Sprint 2 – Migración DB", goal: "Migración de base de datos",
      status: "COMPLETED", capacity: 40,
      startDate: d("2025-10-16"), endDate: d("2025-11-05"), completedAt: d("2025-11-04"),
    },
  });

  const p4s3 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p4.id, name: "Sprint 3 – Microservicios" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p4.id, name: "Sprint 3 – Microservicios", goal: "Extracción de servicios core",
      status: "COMPLETED", capacity: 50,
      startDate: d("2025-11-06"), endDate: d("2025-12-05"), completedAt: d("2025-12-04"),
    },
  });

  const p4s4 = await prisma.sprint.upsert({
    where: { id: (await prisma.sprint.findFirst({ where: { projectId: p4.id, name: "Sprint 4 – Cutover" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      projectId: p4.id, name: "Sprint 4 – Cutover", goal: "Cutover final y estabilización",
      status: "COMPLETED", capacity: 40,
      startDate: d("2026-01-05"), endDate: d("2026-01-28"), completedAt: d("2026-01-28"),
    },
  });

  const p4tickets = [
    // Sprint 1
    ticket({ title: "Mapeo de entidades legacy",          status: "DONE", priority: "HIGH",   sp: 8,  devId: carlos.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s1.id, est: 16, actual: 14, completedAt: d("2025-10-07") }),
    ticket({ title: "Documentar APIs existentes",         status: "DONE", priority: "MEDIUM", sp: 5,  devId: miguel.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s1.id, est: 10, actual: 9,  completedAt: d("2025-10-10") }),
    ticket({ title: "Plan de migración de datos",         status: "DONE", priority: "HIGH",   sp: 5,  devId: carlos.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s1.id, est: 10, actual: 11, completedAt: d("2025-10-14") }),
    // Sprint 2
    ticket({ title: "Scripts de migración de datos",      status: "DONE", priority: "CRITICAL", sp: 13, devId: miguel.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s2.id, est: 26, actual: 24, completedAt: d("2025-10-25") }),
    ticket({ title: "Validación de integridad de datos",  status: "DONE", priority: "HIGH",     sp: 8,  devId: carlos.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s2.id, est: 16, actual: 15, completedAt: d("2025-10-30") }),
    ticket({ title: "Rollback plan y backups",            status: "DONE", priority: "HIGH",     sp: 5,  devId: miguel.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s2.id, est: 10, actual: 9,  completedAt: d("2025-11-03") }),
    // Sprint 3
    ticket({ title: "Microservicio de usuarios",          status: "DONE", priority: "HIGH",     sp: 8,  devId: carlos.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s3.id, est: 16, actual: 15, completedAt: d("2025-11-15") }),
    ticket({ title: "Microservicio de pedidos",           status: "DONE", priority: "CRITICAL", sp: 13, devId: miguel.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s3.id, est: 26, actual: 24, completedAt: d("2025-11-25") }),
    ticket({ title: "API Gateway",                        status: "DONE", priority: "HIGH",     sp: 8,  devId: carlos.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s3.id, est: 16, actual: 14, completedAt: d("2025-12-01") }),
    ticket({ title: "Service mesh y descubrimiento",      status: "DONE", priority: "HIGH",     sp: 8,  devId: miguel.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s3.id, est: 16, actual: 17, completedAt: d("2025-12-03") }),
    // Sprint 4
    ticket({ title: "Pruebas de carga y stress",          status: "DONE", priority: "HIGH",     sp: 8,  devId: carlos.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s4.id, est: 16, actual: 14, completedAt: d("2026-01-10") }),
    ticket({ title: "Cutover en producción",              status: "DONE", priority: "CRITICAL", sp: 13, devId: miguel.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s4.id, est: 26, actual: 22, completedAt: d("2026-01-20") }),
    ticket({ title: "Monitoreo post-cutover",             status: "DONE", priority: "HIGH",     sp: 5,  devId: carlos.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s4.id, est: 10, actual: 9,  completedAt: d("2026-01-25") }),
    ticket({ title: "Documentación final",               status: "DONE", priority: "MEDIUM",   sp: 3,  devId: miguel.id, pmId: pm2.id, projectId: p4.id, sprintId: p4s4.id, est: 6,  actual: 5,  completedAt: d("2026-01-27") }),
  ];

  await prisma.ticket.createMany({ data: p4tickets, skipDuplicates: false });
  console.log("✅ Proyecto 4 creado (Legacy Migration — archivado)");

  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed completo!");
  console.log("\n📋 Usuarios disponibles:");
  console.log("  admin@taskhub.com     → Admin123!");
  console.log("  pm@taskhub.com        → PM123!     (Ana Martínez)");
  console.log("  pm2@taskhub.com       → PM123!     (Roberto García)");
  console.log("  carlos@taskhub.com    → Dev123!    (Carlos Mendoza)");
  console.log("  sofia@taskhub.com     → Dev123!    (Sofía Torres)");
  console.log("  diego@taskhub.com     → Dev123!    (Diego Morales)");
  console.log("  andrea@taskhub.com    → Dev123!    (Andrea López)");
  console.log("  miguel@taskhub.com    → Dev123!    (Miguel Ángel Ruiz)");
  console.log("  laura@taskhub.com     → Dev123!    (Laura Sánchez)");
  console.log("\n📦 Proyectos:");
  console.log("  E-Commerce Platform   → ACTIVE  / MEDIUM risk / on track");
  console.log("  Mobile Banking App    → ACTIVE  / HIGH risk   / 4 blockers");
  console.log("  DataFlow Analytics    → ACTIVE  / LOW risk    / ahead");
  console.log("  Legacy Migration      → ARCHIVED (completado)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
