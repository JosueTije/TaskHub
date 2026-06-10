const { buildAiContext, hasEnoughData }               = require("../services/ai-context.service");
const { generateExecutiveSummaryPdf, generateRiskAnalysisPdf } = require("../services/ai-pdf.service");
const { callGroqJson }                                 = require("../services/groq.service");

const INSUFFICIENT_DATA_RESPONSE = {
  message:
    "No hay suficientes datos del proyecto para generar un análisis significativo. Agrega sprints y tickets para obtener un resumen completo.",
};

// ── Context serializer ────────────────────────────────────────────────────────

function contextToString(context) {
  const { project, sprints, kpis, team, historicalBenchmark } = context;
  const active = sprints.active;

  const teamStr = team
    .map(
      (m) =>
        `  - ${m.name} (${m.role}): ${m.assignedTickets} asignados, ${m.completedTickets} completados, ${m.rendimiento}% rendimiento, ${m.blockedTickets} bloqueados, ${m.gamificationPoints} puntos gamificación`
    )
    .join("\n");

  const sprintTicketsStr = active
    ? active.tickets
        .slice(0, 15)
        .map(
          (t) =>
            `    - [${t.priority}] ${t.title} → ${t.status}${t.assignee ? ` (${t.assignee})` : ""}${t.hasPR ? " [PR abierto]" : ""}`
        )
        .join("\n")
    : "Sin sprint activo";

  const histStr = historicalBenchmark.length
    ? historicalBenchmark
        .map(
          (h) =>
            `  - ${h.projectName}: planeado ${h.plannedDurationDays}d, real ${h.actualDurationDays}d, ${h.completionPercent}% completado`
        )
        .join("\n")
    : "Sin proyectos históricos disponibles";

  return `PROYECTO: ${project.name}
Estado: ${project.status} | Riesgo: ${project.riskLevel} | PM: ${project.pm || "Sin asignar"}
Fechas: ${project.startDate ? new Date(project.startDate).toLocaleDateString("es") : "N/D"} → ${project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString("es") : "N/D"}
GitHub: ${project.githubRepo || "No configurado"}

KPIs:
  Avance: ${kpis.progressPercent}% (planeado: ${kpis.plannedProgress}%)
  SPI: ${kpis.spi ?? "N/A"} | Schedule Variance: ${kpis.scheduleVariance}%
  Horas estimadas (DONE): ${kpis.estimatedHours}h | Horas reales: ${kpis.usedHours}h
  Eficiencia: ${kpis.efficiency ?? "N/A"} | Tickets bloqueados: ${kpis.blockedTickets}

SPRINTS: ${sprints.total} total
  Sprint activo: ${active ? `${active.name} (${active.completedTickets}/${active.totalTickets} tickets, ${active.blockedTickets} bloqueados)` : "Ninguno"}
  Sprints completados: ${sprints.completed.length}
  Sprints próximos: ${sprints.upcoming.length}

TICKETS DEL SPRINT ACTIVO:
${sprintTicketsStr}

EQUIPO:
${teamStr || "  Sin miembros"}

BENCHMARK HISTÓRICO:
${histStr}`;
}

// ── Error helper ──────────────────────────────────────────────────────────────

function handleAiError(err, res, context) {
  if (err.message === "No tienes acceso a este proyecto")
    return res.status(403).json({ message: err.message });
  if (err.code === "ai_unavailable")
    return res.status(503).json({ error: "ai_unavailable", message: "El servicio de IA no está disponible en este momento." });
  if (err.name === "TimeoutError")
    return res.status(408).json({ message: "La generación tardó demasiado. Intenta de nuevo." });
  if (err.code === "invalid_json")
    return res.status(422).json({ message: "El modelo no devolvió una respuesta válida. Intenta de nuevo." });
  console.error(`[${context}]`, err.message);
  return res.status(500).json({ message: "Error al generar el análisis" });
}

// ── Controllers ───────────────────────────────────────────────────────────────

async function getAiContextController(req, res) {
  const { projectId } = req.params;
  try {
    const context = await buildAiContext({ projectId, userId: req.user.sub, role: req.user.role });
    res.json(context);
  } catch (err) {
    if (err.message === "No tienes acceso a este proyecto") return res.status(403).json({ message: err.message });
    if (err.message === "Proyecto no encontrado") return res.status(404).json({ message: err.message });
    console.error("ai-context error:", err.message);
    res.status(500).json({ message: "Error al obtener el contexto del proyecto" });
  }
}

async function executiveSummaryController(req, res) {
  const { projectId } = req.params;
  try {
    const context = await buildAiContext({ projectId, userId: req.user.sub, role: req.user.role });

    if (!hasEnoughData(context)) {
      return res.status(422).json(INSUFFICIENT_DATA_RESPONSE);
    }

    const dataStr = contextToString(context);

    const messages = [
      {
        role: "system",
        content: `Eres un consultor senior de gestión de proyectos. Analiza los siguientes datos del proyecto y genera un resumen ejecutivo profesional en español. El resumen debe ser claro, directo y útil para un stakeholder que no conoce los detalles técnicos. Responde ÚNICAMENTE en JSON válido sin texto adicional ni markdown. Para los campos de opción, elige SOLO UN valor:
{
  "resumenGeneral": "Párrafo de 3-4 oraciones describiendo el estado actual del proyecto",
  "estadoSprint": "Párrafo de 2-3 oraciones sobre el sprint activo",
  "rendimientoEquipo": "Párrafo de 2-3 oraciones sobre el desempeño del equipo",
  "proyeccionCierre": "Párrafo de 2 oraciones proyectando la fecha de cierre basado en el ritmo actual",
  "recomendaciones": [
    { "prioridad": "Alta", "accion": "texto de la recomendación concreta" }
  ],
  "nivelConfianza": "Medio",
  "razonConfianza": "Por qué el modelo tiene ese nivel de confianza en el análisis"
}`,
      },
      { role: "user", content: `Datos del proyecto:\n\n${dataStr}` },
    ];

    const aiAnalysis = await callGroqJson(messages);

    const pdfBuffer = await generateExecutiveSummaryPdf({ context, aiAnalysis });

    const safeName = context.project.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const dateTag  = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="resumen-ejecutivo-${safeName}-${dateTag}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    handleAiError(err, res, "executive-summary");
  }
}

async function riskAnalysisController(req, res) {
  const { projectId } = req.params;
  try {
    const context = await buildAiContext({ projectId, userId: req.user.sub, role: req.user.role });

    if (!hasEnoughData(context)) {
      return res.status(422).json(INSUFFICIENT_DATA_RESPONSE);
    }

    const dataStr = contextToString(context);

    const messages = [
      {
        role: "system",
        content: `Eres un experto en gestión de riesgos de proyectos de software. Analiza los datos del proyecto y genera un análisis de riesgo detallado. Responde ÚNICAMENTE en JSON válido sin texto adicional ni markdown. Para cada campo que muestra opciones separadas por "|", elige SOLO UNA opción:
{
  "nivelRiesgoGlobal": "Alto",
  "justificacionGlobal": "Una oración explicando el nivel global",
  "riesgos": [
    {
      "categoria": "Cronograma",
      "nivel": "Medio",
      "descripcion": "Qué está pasando concretamente",
      "impacto": "Qué puede pasar si no se atiende",
      "recomendacion": "Acción concreta y específica para mitigarlo",
      "urgencia": "Esta semana"
    }
  ],
  "fortalezas": [
    "Aspecto positivo del proyecto que reduce el riesgo general"
  ],
  "indicadorSemaforo": {
    "cronograma": "verde",
    "equipo": "verde",
    "calidad": "verde",
    "capacidad": "verde"
  }
}`,
      },
      { role: "user", content: `Datos del proyecto:\n\n${dataStr}` },
    ];

    const riskData = await callGroqJson(messages);
    res.json({ riskData, generatedAt: new Date().toISOString() });
  } catch (err) {
    handleAiError(err, res, "risk-analysis");
  }
}

async function riskAnalysisPdfController(req, res) {
  const { projectId } = req.params;
  const { riskData }  = req.body;

  if (!riskData) {
    return res.status(400).json({ message: "riskData es requerido en el body" });
  }

  try {
    const context   = await buildAiContext({ projectId, userId: req.user.sub, role: req.user.role });
    const pdfBuffer = await generateRiskAnalysisPdf({ context, riskData });

    const safeName = context.project.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const dateTag  = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="analisis-riesgo-${safeName}-${dateTag}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    if (err.message === "No tienes acceso a este proyecto") return res.status(403).json({ message: err.message });
    console.error("risk-analysis-pdf error:", err.message);
    res.status(500).json({ message: "Error al generar el PDF de análisis de riesgo" });
  }
}

module.exports = {
  getAiContextController,
  executiveSummaryController,
  riskAnalysisController,
  riskAnalysisPdfController,
};
