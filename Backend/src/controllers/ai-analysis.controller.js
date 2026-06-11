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

  // ── Team: desglose completo por miembro ──────────────────────────────────
  const teamStr = team
    .map((m) => {
      const sprintLine = active
        ? `Sprint activo: ${m.activeSprintTotal} tickets (TODO:${m.activeSprintTodo} | IN_PROGRESS+IN_REVIEW:${m.activeSprintInProgress} | BLOCKED:${m.activeSprintBlocked} | DONE:${m.activeSprintDone}) | ${m.activeSprintSP} SP | ${m.activeSprintPendingHours}h pendientes estimadas`
        : "Sin sprint activo";
      const hoursLine =
        m.estimatedHours > 0
          ? `Horas totales: ${m.estimatedHours}h estimadas → ${m.usedHours}h reales (eficiencia ${m.efficiency ?? "N/A"})`
          : "Sin horas registradas";
      const cycleStr = m.avgCycleDays === null ? "Sin ciclos completados" : `Ciclo promedio: ${m.avgCycleDays}d/ticket`;
      const precStr  = m.precisionRate === null ? "" : `Precisión estimación: ${m.precisionRate}%`;
      const overdueStr = m.overdueTickets > 0 ? ` | ⚠ ${m.overdueTickets} RETRASADOS` : "";
      const precPart   = precStr ? ` | ${precStr}` : "";

      return `  ${m.name} (${m.role}):
    Global: ${m.assignedTickets} asignados | ${m.completedTickets} completados (${m.rendimiento}%) | ${m.storyPointsDone}/${m.storyPointsAssigned} SP | ${m.blockedTickets} bloqueados${overdueStr}
    ${sprintLine}
    ${hoursLine} | ${cycleStr}${precPart}
    Gamificación: ${m.gamificationPoints} pts`;
    })
    .join("\n");

  // ── Tickets del sprint activo agrupados por asignado ────────────────────
  const sprintTicketsStr = active
    ? active.tickets
        .slice(0, 20)
        .map((t) => {
          const who   = t.assignee ? ` → ${t.assignee}` : " → Sin asignar";
          const sp    = t.storyPoints   ? ` (${t.storyPoints}SP)` : "";
          const est   = t.estimatedHours ? ` est:${t.estimatedHours}h` : "";
          const real  = t.usedHours      ? ` real:${t.usedHours}h`     : "";
          const pr    = t.hasPR ? " [PR]" : "";
          return `    - [${t.priority}][${t.status}] ${t.title}${who}${sp}${est}${real}${pr}`;
        })
        .join("\n")
    : "Sin sprint activo";

  // ── Sprints completados con velocidad ───────────────────────────────────
  const completedStr = sprints.completed.length
    ? sprints.completed
        .map(
          (s) =>
            `  - ${s.name}: ${s.completedTickets}/${s.totalTickets} tickets completados, ${s.blockedTickets} bloqueados`
        )
        .join("\n")
    : "  Ninguno";

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

KPIs GENERALES:
  Avance: ${kpis.progressPercent}% (planeado: ${kpis.plannedProgress}%)
  SPI: ${kpis.spi ?? "N/A"} | Schedule Variance: ${kpis.scheduleVariance}%
  Horas estimadas (DONE): ${kpis.estimatedHours}h | Horas reales: ${kpis.usedHours}h
  Eficiencia global: ${kpis.efficiency ?? "N/A"} | Tickets bloqueados: ${kpis.blockedTickets}

SPRINTS: ${sprints.total} total
  Sprint activo: ${active ? `${active.name} (${active.completedTickets}/${active.totalTickets} tickets | ${active.inProgressTickets} en progreso | ${active.blockedTickets} bloqueados)` : "Ninguno"}
  Sprints completados (${sprints.completed.length}):
${completedStr}
  Sprints próximos: ${sprints.upcoming.length}

TICKETS DEL SPRINT ACTIVO (${active?.totalTickets ?? 0} tickets):
${sprintTicketsStr}

EQUIPO (${team.length} miembros):
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
        content: `Eres un consultor senior de gestión de proyectos de software. Analiza los datos del proyecto y genera un resumen ejecutivo profesional en español.
Los datos incluyen métricas detalladas POR MIEMBRO DEL EQUIPO: tickets asignados/completados, carga en sprint activo, horas estimadas vs reales, tickets retrasados, ciclo promedio y precisión de estimación. DEBES usar estos datos para mencionar miembros específicos por nombre cuando sea relevante.
Responde ÚNICAMENTE en JSON válido sin texto adicional ni markdown:
{
  "resumenGeneral": "Párrafo de 3-4 oraciones describiendo el estado actual del proyecto con métricas concretas",
  "estadoSprint": "Párrafo de 2-3 oraciones sobre el sprint activo: cuántos tickets hay en cada estado y qué está bloqueado",
  "rendimientoEquipo": "Párrafo de 3-4 oraciones analizando el equipo. Menciona por nombre a quién tiene mayor carga, quién tiene tickets retrasados, quién tiene mejor/peor precisión de estimación, y cualquier desequilibrio notable",
  "cargaEquipo": [
    {
      "nombre": "nombre del miembro",
      "cargaActual": "descripción breve de su carga en el sprint activo (N tickets, N SP pendientes)",
      "estado": "Sobrecargado | Balanceado | Con capacidad disponible",
      "alertas": "lista de alertas si tiene bloqueados, retrasados o baja precisión, o vacío si no hay"
    }
  ],
  "proyeccionCierre": "Párrafo de 2 oraciones proyectando la fecha de cierre basado en el SPI y ritmo actual",
  "recomendaciones": [
    { "prioridad": "Alta | Media | Baja", "accion": "Acción concreta y específica, mencionando nombres cuando aplique" }
  ],
  "nivelConfianza": "Alto | Medio | Bajo",
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
        content: `Eres un experto en gestión de riesgos de proyectos de software. Analiza los datos del proyecto y genera un análisis de riesgo detallado en español.
Los datos incluyen métricas POR MIEMBRO: carga en sprint activo, tickets bloqueados, retrasados, horas estimadas vs reales y precisión de estimación. Úsalos para identificar riesgos de capacidad y personas específicas.
Responde ÚNICAMENTE en JSON válido sin texto adicional ni markdown. Elige SOLO UNA opción donde se muestran alternativas con "|":
{
  "nivelRiesgoGlobal": "Crítico | Alto | Medio | Bajo",
  "justificacionGlobal": "2 oraciones explicando el nivel global con datos concretos",
  "riesgos": [
    {
      "categoria": "Cronograma | Equipo | Capacidad | Calidad | Técnico | Externo",
      "nivel": "Crítico | Alto | Medio | Bajo",
      "descripcion": "Qué está pasando concretamente, mencionando nombres o tickets específicos si aplica",
      "impacto": "Qué puede pasar si no se atiende (consecuencia concreta)",
      "recomendacion": "Acción específica y accionable para mitigarlo, con nombres si aplica",
      "urgencia": "Hoy | Esta semana | Este sprint | Próximo sprint"
    }
  ],
  "riesgosPorPersona": [
    {
      "nombre": "nombre del miembro",
      "nivelRiesgo": "Alto | Medio | Bajo | Sin riesgo",
      "motivo": "razón concreta: sobrecarga, tickets bloqueados, retrasados, baja precisión, etc."
    }
  ],
  "fortalezas": [
    "Aspecto positivo concreto del proyecto o equipo que reduce el riesgo general"
  ],
  "indicadorSemaforo": {
    "cronograma": "rojo | amarillo | verde",
    "equipo": "rojo | amarillo | verde",
    "calidad": "rojo | amarillo | verde",
    "capacidad": "rojo | amarillo | verde"
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
