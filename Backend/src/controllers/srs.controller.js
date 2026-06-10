const { PDFParse }    = require("pdf-parse");
const prisma          = require("../config/prisma");
const { callGroqJson } = require("../services/groq.service");

// ── Developer workload query ──────────────────────────────────────────────────

async function getDeveloperWorkload(projectId, sprintId) {
  const members = await prisma.projectMember.findMany({
    where: { projectId, leftAt: null, user: { role: "DEVELOPER" } },
    include: { user: { select: { id: true, fullName: true } } },
  });

  if (members.length === 0) return [];

  const memberIds = members.map((m) => m.userId);

  const [workloads, totalDone] = await Promise.all([
    // Active workload in this sprint
    prisma.ticket.groupBy({
      by: ["assignedToId"],
      where: { sprintId, assignedToId: { in: memberIds }, status: { notIn: ["CANCELLED", "DONE"] } },
      _count: { id: true },
      _sum: { estimatedHours: true },
    }),
    // Tickets done in this sprint (productivity signal)
    prisma.ticket.groupBy({
      by: ["assignedToId"],
      where: { sprintId, assignedToId: { in: memberIds }, status: "DONE" },
      _count: { id: true },
    }),
  ]);

  const activeMap = Object.fromEntries(
    workloads.map((w) => [w.assignedToId, { count: w._count.id, hours: w._sum.estimatedHours ?? 0 }])
  );
  const doneMap = Object.fromEntries(totalDone.map((w) => [w.assignedToId, w._count.id]));

  return members.map((m) => ({
    id: m.userId,
    name: m.user.fullName,
    ticketsActivos: activeMap[m.userId]?.count ?? 0,
    horasComprometidas: activeMap[m.userId]?.hours ?? 0,
    ticketsCompletados: doneMap[m.userId] ?? 0,
  }));
}

// ── Sanitizer ─────────────────────────────────────────────────────────────────

const VALID_PRIORITIES = ["HIGH", "MEDIUM", "LOW", "CRITICAL"];

function toDateStr(val, fallback) {
  const d = new Date(val);
  return isNaN(d.getTime()) ? fallback : d.toISOString().slice(0, 10);
}

function sanitizeTickets(raw, sprintStart, sprintEnd, validDevIds) {
  const n = (raw || []).length || 1;
  const start = new Date(sprintStart);
  const end = new Date(sprintEnd);
  const sliceMs = (end - start) / n;

  return (raw || []).slice(0, 15).map((t, i) => {
    // Fallback dates: divide sprint into equal slices
    const fbStart = new Date(start.getTime() + sliceMs * i).toISOString().slice(0, 10);
    const fbEnd = new Date(Math.min(start.getTime() + sliceMs * (i + 1), end.getTime())).toISOString().slice(0, 10);

    const startDate = toDateStr(t.startDate, fbStart);
    const dueDate = toDateStr(t.dueDate, fbEnd);

    const clampedStart = startDate < sprintStart || startDate > sprintEnd ? sprintStart : startDate;
    const clampedDue = dueDate < clampedStart ? fbEnd : dueDate > sprintEnd ? sprintEnd : dueDate;

    const hours = parseFloat(t.estimatedHours);
    const sp = parseInt(t.storyPoints, 10);

    return {
      title: String(t.title || "").slice(0, 80) || `Requerimiento ${i + 1}`,
      description: String(t.description || ""),
      priority: VALID_PRIORITIES.includes(t.priority) ? t.priority : "MEDIUM",
      storyPoints: Number.isInteger(sp) && sp >= 1 && sp <= 13 ? sp : 3,
      estimatedHours: !isNaN(hours) && hours > 0 && hours <= 160 ? hours : null,
      startDate: clampedStart,
      dueDate: clampedDue,
      assignedToId: validDevIds.includes(t.assignedToId) ? t.assignedToId : null,
    };
  });
}

// ── Controllers ───────────────────────────────────────────────────────────────

async function analyzeSrs(req, res) {
  const { id: sprintId } = req.params;

  if (!req.file) {
    return res.status(400).json({ code: "E-01", message: "No se adjuntó ningún archivo PDF" });
  }

  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { project: true },
  });

  if (!sprint) return res.status(404).json({ message: "Sprint no encontrado" });
  if (sprint.status !== "ACTIVE") {
    return res.status(422).json({ code: "E-03", message: "El sprint no está activo" });
  }

  // Extract PDF text
  let pdfText;
  try {
    const parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    pdfText = result.text;
  } catch {
    return res.status(422).json({ code: "E-01", message: "No se pudo leer el archivo PDF" });
  }

  if (!pdfText || pdfText.trim().length < 50) {
    return res.status(422).json({ code: "E-04", message: "El PDF no contiene suficiente texto para analizar" });
  }

  // Fetch developer workload
  const developers = await getDeveloperWorkload(sprint.projectId, sprintId);

  const sprintStart = new Date(sprint.startDate).toISOString().slice(0, 10);
  const sprintEnd = new Date(sprint.endDate).toISOString().slice(0, 10);
  const srsText = pdfText.slice(0, 8000);

  const devContext = developers.length > 0
    ? `\nDesarrolladores disponibles. Para "assignedToId" usa el id EXACTAMENTE como aparece aquí:\n${JSON.stringify(developers, null, 2)}\n\nAsigna cada ticket al desarrollador más adecuado considerando: menor carga de trabajo (horasComprometidas y ticketsActivos), afinidad temática con el ticket, y balance del equipo. Si hay un solo desarrollador, asígnale todos los tickets.`
    : "\nNo hay desarrolladores registrados en el proyecto. Usa null para assignedToId.";

  const messages = [
    {
      role: "system",
      content: `Eres un analista de software experto en documentos SRS. Extrae los requerimientos funcionales y conviértelos en tickets de desarrollo. Responde ÚNICAMENTE en JSON válido sin texto adicional ni markdown.

Reglas de los campos:
- "title": máximo 80 caracteres, específico y orientado a acción
- "description": 2-3 oraciones que expliquen el QUÉ y el POR QUÉ del requerimiento
- "priority": SOLO UNO de "HIGH", "MEDIUM", "LOW" — basado en impacto en el negocio
- "storyPoints": entero de 1 a 13 según complejidad técnica (1=trivial, 5=medio, 13=muy complejo)
- "estimatedHours": horas reales de trabajo (decimal, ej: 4.0, 8.0, 16.0). Debe ser coherente con storyPoints.
- "startDate": YYYY-MM-DD dentro del sprint, ordenadas por prioridad y dependencia lógica
- "dueDate": YYYY-MM-DD posterior a startDate, dentro del sprint
- "assignedToId": el id EXACTO del desarrollador asignado (string)
${devContext}

Formato exacto de respuesta:
{
  "tickets": [
    {
      "title": "...",
      "description": "...",
      "priority": "HIGH",
      "storyPoints": 5,
      "estimatedHours": 12.0,
      "startDate": "${sprintStart}",
      "dueDate": "${sprintEnd}",
      "assignedToId": "${developers[0]?.id ?? "null"}"
    }
  ]
}`,
    },
    {
      role: "user",
      content: `Analiza el siguiente documento SRS y extrae entre 3 y 15 tickets de desarrollo. Proyecto: "${sprint.project.name}". Sprint: ${sprintStart} al ${sprintEnd}.\n\nDocumento SRS:\n${srsText}`,
    },
  ];

  try {
    const result = await callGroqJson(messages);

    if (!Array.isArray(result.tickets) || result.tickets.length === 0) {
      return res.status(422).json({ code: "E-04", message: "No se pudieron identificar requerimientos en el documento" });
    }

    const validDevIds = developers.map((d) => d.id);
    const tickets = sanitizeTickets(result.tickets, sprintStart, sprintEnd, validDevIds);

    // Return tickets + developer list so the frontend can show a dropdown
    return res.json({ tickets, developers });
  } catch (err) {
    if (err.code === "ai_unavailable") {
      return res.status(503).json({ code: "E-02", message: "El servicio de IA no está disponible en este momento" });
    }
    if (err.name === "TimeoutError") {
      return res.status(408).json({ message: "El análisis tardó demasiado. Intenta de nuevo." });
    }
    if (err.code === "invalid_json") {
      return res.status(422).json({ code: "E-04", message: "El modelo no pudo procesar el documento. Intenta con otro archivo." });
    }
    console.error("srs-analyze error:", err.message);
    return res.status(500).json({ message: "Error al analizar el SRS" });
  }
}

async function confirmSrs(req, res) {
  const { id: sprintId } = req.params;
  const { tickets } = req.body;

  if (!Array.isArray(tickets) || tickets.length === 0) {
    return res.status(400).json({ message: "Se requiere un array de tickets no vacío" });
  }

  const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
  if (!sprint) return res.status(404).json({ message: "Sprint no encontrado" });
  if (sprint.status !== "ACTIVE") {
    return res.status(422).json({ code: "E-03", message: "El sprint no está activo" });
  }

  // Validate that any assignedToId values actually belong to this project
  const candidateIds = [...new Set(tickets.map((t) => t.assignedToId).filter(Boolean))];
  let validDevIds = [];
  if (candidateIds.length > 0) {
    const members = await prisma.projectMember.findMany({
      where: { projectId: sprint.projectId, userId: { in: candidateIds }, leftAt: null, user: { role: "DEVELOPER" } },
      select: { userId: true },
    });
    validDevIds = members.map((m) => m.userId);
  }

  const createdById = req.user.sub;

  try {
    const created = await prisma.$transaction(
      tickets.slice(0, 15).map((t) => {
        const hours = parseFloat(t.estimatedHours);
        const startDate = t.startDate ? new Date(t.startDate) : null;
        const dueDate = t.dueDate ? new Date(t.dueDate) : null;
        const assignedToId = validDevIds.includes(t.assignedToId) ? t.assignedToId : null;

        return prisma.ticket.create({
          data: {
            sprintId,
            projectId: sprint.projectId,
            title: String(t.title || "").slice(0, 80),
            description: String(t.description || "") || null,
            priority: VALID_PRIORITIES.includes(t.priority) ? t.priority : "MEDIUM",
            storyPoints: t.storyPoints ? parseInt(t.storyPoints, 10) : null,
            estimatedHours: !isNaN(hours) && hours > 0 ? hours : null,
            startDate: startDate && !isNaN(startDate) ? startDate : null,
            dueDate: dueDate && !isNaN(dueDate) ? dueDate : null,
            assignedToId,
            status: "TODO",
            createdById,
          },
        });
      })
    );

    return res.status(201).json({ created: created.length, tickets: created });
  } catch (err) {
    console.error("srs-confirm error:", err.message);
    return res.status(500).json({ message: "Error al crear los tickets" });
  }
}

module.exports = { analyzeSrs, confirmSrs };
