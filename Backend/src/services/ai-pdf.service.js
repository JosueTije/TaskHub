const PDFDocument = require("pdfkit");

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#0F0F0F",
  surface: "#1C1C1E",
  accent: "#FF3B30",
  green: "#34C759",
  yellow: "#FF9F0A",
  blue: "#007AFF",
  textPrimary: "#FFFFFF",
  textMuted: "#8E8E93",
  border: "#2C2C2E",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function createPdfBuffer(buildFn) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      autoFirstPage: false,
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    buildFn(doc);
    doc.end();
  });
}

function fillRect(doc, x, y, w, h, color, opacity = 1) {
  doc.save();
  if (opacity < 1) doc.fillOpacity(opacity);
  doc.rect(x, y, w, h).fill(color);
  doc.restore();
}

function strokeRect(doc, x, y, w, h, color, lineWidth = 1) {
  doc.save().rect(x, y, w, h).strokeColor(color).lineWidth(lineWidth).stroke().restore();
}

function addFooter(doc, dateStr, pageNum) {
  const pw = doc.page.width;
  // Stay inside the content area (above bottom margin) to prevent PDFKit auto-pagination
  const py = doc.page.height - doc.page.margins.bottom - 10;
  doc.save();
  doc.fontSize(7).fillColor(C.textMuted);
  doc.text(`Generado por TaskHub AI — ${dateStr}`, 50, py, {
    lineBreak: false,
  });
  const pageLabel = `Página ${pageNum}`;
  const labelW = doc.widthOfString(pageLabel);
  doc.text(pageLabel, pw - 50 - labelW, py, { lineBreak: false });
  doc.restore();
}

function semaphoreColor(level) {
  const l = (level || "").toLowerCase();
  if (["verde", "low"].includes(l)) return C.green;
  if (["amarillo", "medium"].includes(l)) return C.yellow;
  if (["rojo", "high", "critical", "alto"].includes(l)) return C.accent;
  return C.textMuted;
}

function riskLevelColor(level) {
  const l = (level || "").toLowerCase();
  if (["alto", "high", "critical"].includes(l)) return C.accent;
  if (["medio", "medium"].includes(l)) return C.yellow;
  if (["bajo", "low"].includes(l)) return C.green;
  return C.textMuted;
}

function drawCover(doc, projectName, subtitle, badgeText, badgeColor, dateStr) {
  const pw = doc.page.width;
  const ph = doc.page.height;

  fillRect(doc, 0, 0, pw, ph, C.bg);
  fillRect(doc, 0, 0, pw, 4, C.accent);

  doc.fontSize(38).fillColor(C.accent).text("TaskHub", 0, 110, { align: "center" });
  doc.fontSize(11).fillColor(C.textMuted).text("Project Intelligence Platform", 0, 158, { align: "center" });

  fillRect(doc, pw / 2 - 50, 186, 100, 1.5, C.border);

  doc.fontSize(24).fillColor(C.textPrimary).text(projectName, 60, 208, { align: "center", width: pw - 120 });
  doc.fontSize(14).fillColor(C.textMuted).text(subtitle, 0, 252, { align: "center" });

  // Badge
  const badgeW = 100;
  const badgeX = pw / 2 - badgeW / 2;
  fillRect(doc, badgeX, 292, badgeW, 24, badgeColor, 0.18);
  strokeRect(doc, badgeX, 292, badgeW, 24, badgeColor);
  doc.fontSize(10).fillColor(badgeColor).text(badgeText, badgeX, 299, { width: badgeW, align: "center" });

  doc.fontSize(9).fillColor(C.textMuted).text(`Generado el ${dateStr}`, 0, ph - 90, { align: "center" });
  doc.fontSize(8).fillColor(C.border).text("Powered by Groq · llama-3.1-8b-instant", 0, ph - 72, { align: "center" });
}

// ── Executive Summary helpers (one function per page) ────────────────────────

function confidenceColor(nivel) {
  if (nivel === "Alto")  return C.green;
  if (nivel === "Medio") return C.yellow;
  return C.accent;
}

function kpiColor(value, thresholdHigh, thresholdMid, nullColor) {
  if (value === null || value === undefined) return nullColor ?? C.textMuted;
  if (value >= thresholdHigh) return C.green;
  if (value >= thresholdMid)  return C.yellow;
  return C.accent;
}

function drawKpiBox(doc, x, y, value, label, color, size) {
  const { w, h } = size;
  fillRect(doc, x, y, w, h, color, 0.12);
  strokeRect(doc, x, y, w, h, color, 0.8);
  doc.fontSize(22).fillColor(color).text(String(value), x, y + 12, { width: w, align: "center" });
  doc.fontSize(8.5).fillColor(C.textMuted).text(label, x, y + 46, { width: w, align: "center" });
}

function drawExecCover(doc, pname, aiAnalysis, dateStr, _M) {
  doc.addPage();
  const statusColor = doc._context?.project?.status === "ACTIVE" ? C.green : C.textMuted;
  const statusLabel  = doc._context?.project?.status === "ACTIVE" ? "Activo" : (doc._context?.project?.status ?? "");
  drawCover(doc, pname, "Resumen Ejecutivo", statusLabel, statusColor, dateStr);

  const confColor = confidenceColor(aiAnalysis.nivelConfianza);
  doc.fontSize(10).fillColor(C.textMuted).text("Nivel de confianza del análisis: ", 0, 345, { align: "center", continued: true });
  doc.fillColor(confColor).text(aiAnalysis.nivelConfianza, { align: "center" });
  addFooter(doc, dateStr, 1);
}

function drawExecStatusPage(doc, kpis, sprints, aiAnalysis, dateStr, M) {
  doc.addPage();
  const pw = doc.page.width;
  const ph = doc.page.height;
  fillRect(doc, 0, 0, pw, ph, C.bg);
  fillRect(doc, 0, 0, pw, 4, C.accent);
  doc.fontSize(18).fillColor(C.textPrimary).text("Estado actual del proyecto", M, 32);
  fillRect(doc, M, 57, 55, 2.5, C.accent);

  const kpiW = (pw - M * 2 - 12) / 2;
  const kpiH = 72;
  const kpiY = 72;
  const spiDisplay = kpis.spi === null ? "N/A" : String(kpis.spi);
  const effDisplay  = kpis.efficiency === null ? "N/A" : String(kpis.efficiency);
  const progressColor = kpiColor(kpis.progressPercent, 70, 40);
  const spiColor      = kpiColor(kpis.spi, 1, 0.8);
  const effColor      = kpiColor(kpis.efficiency, 1, 0.8);

  const kpiSize = { w: kpiW, h: kpiH };
  drawKpiBox(doc, M,             kpiY,             `${kpis.progressPercent}%`, "Avance del proyecto",        progressColor, kpiSize);
  drawKpiBox(doc, M + kpiW + 12, kpiY,             spiDisplay,                "SPI (Schedule Performance)", spiColor,      kpiSize);
  drawKpiBox(doc, M,             kpiY + kpiH + 10, `${kpis.estimatedHours}h`, "Horas estimadas (DONE)",     C.blue,        kpiSize);
  drawKpiBox(doc, M + kpiW + 12, kpiY + kpiH + 10, effDisplay,               "Eficiencia de horas",        effColor,      kpiSize);

  let cursorY = kpiY + kpiH * 2 + 30;
  if (sprints.active) {
    const sp = sprints.active;
    const spPct = sp.totalTickets > 0 ? Math.round((sp.completedTickets / sp.totalTickets) * 100) : 0;
    doc.fontSize(10).fillColor(C.textMuted).text(`Sprint activo: ${sp.name}`, M, cursorY);
    cursorY += 18;
    const barW = pw - M * 2 - 40;
    fillRect(doc, M, cursorY, barW, 10, C.border);
    const filled = Math.round((spPct / 100) * barW);
    if (filled > 0) fillRect(doc, M, cursorY, filled, 10, C.accent);
    doc.fontSize(8).fillColor(C.textPrimary).text(`${spPct}%`, M + barW + 6, cursorY);
    cursorY += 22;
    doc.fontSize(8.5).fillColor(C.textMuted).text(
      `${sp.completedTickets}/${sp.totalTickets} tickets · ${sp.blockedTickets} bloqueados · ${sp.inProgressTickets} en progreso`,
      M, cursorY
    );
    cursorY += 22;
  }

  cursorY += 8;
  doc.fontSize(11).fillColor(C.textPrimary).text("Análisis general", M, cursorY);
  fillRect(doc, M, cursorY + 16, pw - M * 2, 1, C.border);
  doc.fontSize(9.5).fillColor(C.textMuted).text(aiAnalysis.resumenGeneral, M, cursorY + 22, { width: pw - M * 2, lineGap: 2 });
  cursorY = doc.y + 14;

  if (cursorY < ph - 100) {
    doc.fontSize(11).fillColor(C.textPrimary).text("Estado del sprint", M, cursorY);
    fillRect(doc, M, cursorY + 16, pw - M * 2, 1, C.border);
    doc.fontSize(9.5).fillColor(C.textMuted).text(aiAnalysis.estadoSprint, M, cursorY + 22, { width: pw - M * 2, lineGap: 2 });
  }
  addFooter(doc, dateStr, 2);
}

function drawExecTeamPage(doc, context, aiAnalysis, dateStr, M) {
  doc.addPage();
  const pw = doc.page.width;
  const ph = doc.page.height;
  fillRect(doc, 0, 0, pw, ph, C.bg);
  fillRect(doc, 0, 0, pw, 4, C.accent);
  doc.fontSize(18).fillColor(C.textPrimary).text("Rendimiento del equipo", M, 32);
  fillRect(doc, M, 57, 55, 2.5, C.accent);

  const team = [...context.team].sort((a, b) => b.rendimiento - a.rendimiento);
  const cols = { name: M, spAct: M + 155, spSP: M + 238, over: M + 300, rend: M + 348, eff: M + 400, pts: M + 452 };
  const colW = { name: 148, spAct: 76, spSP: 55, over: 42, rend: 46, eff: 46, pts: 42 };
  const rowH = 26;
  const tY = 72;

  fillRect(doc, M, tY, pw - M * 2, rowH, C.surface);
  doc.fontSize(7.5).fillColor(C.textMuted);
  doc.text("Developer",     cols.name,  tY + 8, { width: colW.name });
  doc.text("Sprint activo", cols.spAct, tY + 4, { width: colW.spAct, align: "center" });
  doc.text("SP pend.",      cols.spSP,  tY + 4, { width: colW.spSP,  align: "center" });
  doc.text("Retr.",         cols.over,  tY + 4, { width: colW.over,  align: "center" });
  doc.text("Rend.",         cols.rend,  tY + 8, { width: colW.rend,  align: "center" });
  doc.text("Efic.",         cols.eff,   tY + 8, { width: colW.eff,   align: "center" });
  doc.text("Pts",           cols.pts,   tY + 8, { width: colW.pts,   align: "center" });

  team.forEach((m, i) => {
    const rY = tY + rowH + i * rowH;
    if (i === 0) fillRect(doc, M, rY, pw - M * 2, rowH, C.green, 0.07);
    else if (i % 2 === 0) fillRect(doc, M, rY, pw - M * 2, rowH, C.surface, 0.5);

    const rColor   = kpiColor(m.rendimiento, 80, 50);
    const overColor = m.overdueTickets > 0 ? C.accent : C.textMuted;
    const spActStr  = context.sprints.active
      ? `${m.activeSprintInProgress}ip/${m.activeSprintBlocked}bl/${m.activeSprintDone}ok`
      : "—";

    doc.fontSize(9).fillColor(C.textPrimary).text(m.name, cols.name, rY + 8, { width: colW.name });
    doc.fontSize(8).fillColor(C.textMuted).text(spActStr, cols.spAct, rY + 8, { width: colW.spAct, align: "center" });
    doc.fillColor(C.blue).text(context.sprints.active ? String(m.activeSprintSP) : "—", cols.spSP, rY + 8, { width: colW.spSP, align: "center" });
    doc.fillColor(overColor).text(String(m.overdueTickets), cols.over, rY + 8, { width: colW.over, align: "center" });
    doc.fillColor(rColor).text(`${m.rendimiento}%`, cols.rend, rY + 8, { width: colW.rend, align: "center" });
    const effStr = m.efficiency === null ? "—" : String(m.efficiency);
    doc.fillColor(C.textPrimary).text(effStr, cols.eff, rY + 8, { width: colW.eff, align: "center" });
    doc.text(String(m.gamificationPoints), cols.pts, rY + 8, { width: colW.pts, align: "center" });
  });

  let narrativeY = tY + rowH + team.length * rowH + 18;
  const cargaList = Array.isArray(aiAnalysis.cargaEquipo) ? aiAnalysis.cargaEquipo : [];

  if (cargaList.length > 0 && narrativeY < ph - 180) {
    doc.fontSize(11).fillColor(C.textPrimary).text("Carga de trabajo por miembro", M, narrativeY);
    fillRect(doc, M, narrativeY + 16, pw - M * 2, 1, C.border);
    narrativeY += 22;
    cargaList.forEach((c) => {
      if (narrativeY > ph - 90) return;
      let estadoColor = C.blue;
      if (c.estado === "Sobrecargado") estadoColor = C.accent;
      else if (c.estado === "Balanceado") estadoColor = C.green;
      fillRect(doc, M, narrativeY, pw - M * 2, 34, C.surface);
      strokeRect(doc, M, narrativeY, pw - M * 2, 34, C.border, 0.4);
      fillRect(doc, M, narrativeY, 3, 34, estadoColor);
      doc.fontSize(9).fillColor(C.textPrimary).text(c.nombre,     M + 10,  narrativeY + 4,  { width: 130 });
      doc.fontSize(7.5).fillColor(estadoColor).text(c.estado,     M + 10,  narrativeY + 18, { width: 130 });
      doc.fontSize(8).fillColor(C.textMuted).text(c.cargaActual,  M + 150, narrativeY + 5,  { width: pw - M * 2 - 162 });
      if (c.alertas) {
        doc.fontSize(7.5).fillColor(C.yellow).text(c.alertas, M + 150, narrativeY + 19, { width: pw - M * 2 - 162, ellipsis: true, height: 10 });
      }
      narrativeY += 42;
    });
  }

  if (narrativeY < ph - 100) {
    narrativeY += 6;
    doc.fontSize(11).fillColor(C.textPrimary).text("Análisis del equipo", M, narrativeY);
    fillRect(doc, M, narrativeY + 16, pw - M * 2, 1, C.border);
    doc.fontSize(9.5).fillColor(C.textMuted).text(aiAnalysis.rendimientoEquipo, M, narrativeY + 22, { width: pw - M * 2, lineGap: 2 });
  }
  addFooter(doc, dateStr, 3);
}

function drawExecRecommendationsPage(doc, aiAnalysis, dateStr, M) {
  doc.addPage();
  const pw = doc.page.width;
  const ph = doc.page.height;
  fillRect(doc, 0, 0, pw, ph, C.bg);
  fillRect(doc, 0, 0, pw, 4, C.accent);
  doc.fontSize(18).fillColor(C.textPrimary).text("Proyección y recomendaciones", M, 32);
  fillRect(doc, M, 57, 55, 2.5, C.accent);

  fillRect(doc, M, 72, pw - M * 2, 68, C.surface);
  strokeRect(doc, M, 72, pw - M * 2, 68, C.blue, 0.8);
  doc.fontSize(11).fillColor(C.blue).text("Proyección de cierre", M + 14, 84);
  doc.fontSize(9.5).fillColor(C.textMuted).text(aiAnalysis.proyeccionCierre, M + 14, 100, { width: pw - M * 2 - 28, lineGap: 2 });

  doc.fontSize(14).fillColor(C.textPrimary).text("Recomendaciones", M, 158);
  fillRect(doc, M, 177, pw - M * 2, 1, C.border);

  const sorted = [...aiAnalysis.recomendaciones].sort((a, b) => {
    const order = { Alta: 0, Media: 1, Baja: 2 };
    return (order[a.prioridad] ?? 3) - (order[b.prioridad] ?? 3);
  });

  let recY = 185;
  sorted.forEach((rec) => {
    if (recY > ph - 100) return;
    let dotColor = C.green;
    if (rec.prioridad === "Alta")  dotColor = C.accent;
    else if (rec.prioridad === "Media") dotColor = C.yellow;
    doc.save().circle(M + 6, recY + 6, 4).fill(dotColor).restore();
    const badgeW = 36;
    fillRect(doc, M + 18, recY, badgeW, 13, dotColor, 0.2);
    doc.fontSize(7).fillColor(dotColor).text(rec.prioridad, M + 18, recY + 3, { width: badgeW, align: "center" });
    doc.fontSize(9.5).fillColor(C.textPrimary).text(rec.accion, M + 62, recY, { width: pw - M - 62 - M, lineGap: 1 });
    recY = doc.y + 10;
  });

  const confY = recY + 12;
  if (confY < ph - 80) {
    fillRect(doc, M, confY, pw - M * 2, 44, C.surface);
    const confColor = confidenceColor(aiAnalysis.nivelConfianza);
    doc.fontSize(8.5).fillColor(confColor).text(`Confianza: ${aiAnalysis.nivelConfianza}`, M + 12, confY + 10);
    doc.fontSize(8.5).fillColor(C.textMuted).text(aiAnalysis.razonConfianza, M + 12, confY + 24, { width: pw - M * 2 - 24 });
  }
  addFooter(doc, dateStr, 4);
}

// ── Executive Summary PDF ─────────────────────────────────────────────────────

async function generateExecutiveSummaryPdf({ context, aiAnalysis }) {
  const pname = context.project.name;
  const dateStr = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const M = 50;

  return createPdfBuffer((doc) => {
    // Attach context so drawExecCover can read project status
    doc._context = context;
    drawExecCover(doc, pname, aiAnalysis, dateStr, M);
    drawExecStatusPage(doc, context.kpis, context.sprints, aiAnalysis, dateStr, M);
    drawExecTeamPage(doc, context, aiAnalysis, dateStr, M);
    drawExecRecommendationsPage(doc, aiAnalysis, dateStr, M);
  });
}

// ── Risk Analysis PDF ─────────────────────────────────────────────────────────

async function generateRiskAnalysisPdf({ context, riskData }) {
  const pname = context.project.name;
  const dateStr = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return createPdfBuffer((doc) => {
    const M = 50;

    // ── PAGE 1: COVER ─────────────────────────────────────────────────────
    doc.addPage();
    const pw = doc.page.width;
    const ph = doc.page.height;
    const globalColor = riskLevelColor(riskData.nivelRiesgoGlobal);
    drawCover(doc, pname, "Análisis de Riesgo", `Riesgo ${riskData.nivelRiesgoGlobal}`, globalColor, dateStr);

    doc.fontSize(10).fillColor(C.textMuted).text(riskData.justificacionGlobal, 60, 344, {
      width: pw - 120,
      align: "center",
    });
    addFooter(doc, dateStr, 1);

    // ── PAGE 2: SEMÁFORO ──────────────────────────────────────────────────
    doc.addPage();
    fillRect(doc, 0, 0, pw, ph, C.bg);
    fillRect(doc, 0, 0, pw, 4, C.accent);

    doc.fontSize(18).fillColor(C.textPrimary).text("Semáforo de dimensiones", M, 32);
    fillRect(doc, M, 57, 55, 2.5, C.accent);

    const sem = riskData.indicadorSemaforo || {};
    const dims = [
      { key: "cronograma", label: "Cronograma" },
      { key: "equipo", label: "Equipo" },
      { key: "calidad", label: "Calidad" },
      { key: "capacidad", label: "Capacidad" },
    ];

    const boxW = (pw - M * 2 - 14) / 2;
    const boxH = 110;
    const positions = [
      { x: M, y: 72 },
      { x: M + boxW + 14, y: 72 },
      { x: M, y: 72 + boxH + 14 },
      { x: M + boxW + 14, y: 72 + boxH + 14 },
    ];

    dims.forEach((dim, i) => {
      const color = semaphoreColor(sem[dim.key]);
      const { x, y } = positions[i];
      fillRect(doc, x, y, boxW, boxH, C.surface);
      strokeRect(doc, x, y, boxW, boxH, color, 1.5);
      // Traffic light circle
      const cx = x + boxW / 2;
      const cy = y + 38;
      doc.save().fillOpacity(0.3).circle(cx, cy, 22).fill(color).restore();
      doc.save().circle(cx, cy, 22).stroke(color).lineWidth(1.5).stroke().restore();
      doc.save().fillColor(color).circle(cx, cy, 14).fill().restore();

      doc.fontSize(12).fillColor(C.textPrimary).text(dim.label, x, y + 72, { width: boxW, align: "center" });
      doc.fontSize(9).fillColor(color).text((sem[dim.key] || "—").charAt(0).toUpperCase() + (sem[dim.key] || "").slice(1), x, y + 88, { width: boxW, align: "center" });
    });

    // Global risk box
    const globalY = 72 + boxH * 2 + 30;
    fillRect(doc, M, globalY, pw - M * 2, 58, C.surface);
    strokeRect(doc, M, globalY, pw - M * 2, 58, globalColor, 1.5);
    doc.fontSize(13).fillColor(C.textPrimary).text("Nivel de riesgo global: ", M + 14, globalY + 14, { continued: true });
    doc.fillColor(globalColor).text(riskData.nivelRiesgoGlobal);
    doc.fontSize(9.5).fillColor(C.textMuted).text(riskData.justificacionGlobal, M + 14, globalY + 34, {
      width: pw - M * 2 - 28,
    });

    addFooter(doc, dateStr, 2);

    // ── PAGE 3: RIESGOS ───────────────────────────────────────────────────
    doc.addPage();
    fillRect(doc, 0, 0, pw, ph, C.bg);
    fillRect(doc, 0, 0, pw, 4, C.accent);

    doc.fontSize(18).fillColor(C.textPrimary).text("Riesgos identificados", M, 32);
    fillRect(doc, M, 57, 55, 2.5, C.accent);

    const sorted = [...(riskData.riesgos || [])].sort((a, b) => {
      const order = { Alto: 0, Medio: 1, Bajo: 2 };
      return (order[a.nivel] ?? 3) - (order[b.nivel] ?? 3);
    });

    let rY = 72;
    sorted.forEach((risk) => {
      const rColor = riskLevelColor(risk.nivel);
      const cardH = 92;
      if (rY + cardH > ph - 60) return;

      fillRect(doc, M, rY, pw - M * 2, cardH, C.surface);
      fillRect(doc, M, rY, 4, cardH, rColor); // left accent
      strokeRect(doc, M, rY, pw - M * 2, cardH, C.border, 0.4);

      // Row 1: level + category + urgency
      let urgColor = C.green;
      if (risk.urgencia === "Inmediata")    urgColor = C.accent;
      else if (risk.urgencia === "Esta semana") urgColor = C.yellow;
      doc.fontSize(8).fillColor(rColor).text(risk.nivel, M + 14, rY + 9);
      doc.fillColor(C.textMuted).text(` · ${risk.categoria}`, M + 14 + 30, rY + 9);
      doc.fillColor(urgColor).text(risk.urgencia, pw - M - 120, rY + 9, { width: 100, align: "right" });

      // Description
      doc.fontSize(9.5).fillColor(C.textPrimary).text(risk.descripcion, M + 14, rY + 24, {
        width: pw - M * 2 - 28,
        lineGap: 1,
        ellipsis: true,
        height: 22,
      });

      // Recommendation box
      fillRect(doc, M + 14, rY + 58, pw - M * 2 - 28, 22, C.blue, 0.12);
      doc.fontSize(8.5).fillColor(C.blue).text(`Recomendacion: ${risk.recomendacion}`, M + 20, rY + 63, {
        width: pw - M * 2 - 40,
        ellipsis: true,
        height: 12,
      });

      rY += cardH + 10;
    });

    addFooter(doc, dateStr, 3);

    // ── PAGE 4: FORTALEZAS + DISCLAIMER ──────────────────────────────────
    doc.addPage();
    fillRect(doc, 0, 0, pw, ph, C.bg);
    fillRect(doc, 0, 0, pw, 4, C.accent);

    doc.fontSize(18).fillColor(C.textPrimary).text("Lo que está funcionando bien", M, 32);
    fillRect(doc, M, 57, 55, 2.5, C.green);

    let strY = 72;
    (riskData.fortalezas || []).forEach((f) => {
      if (strY > ph - 180) return;
      doc.save().fillColor(C.green).circle(M + 6, strY + 6, 4).fill().restore();
      doc.fontSize(10).fillColor(C.textPrimary).text(f, M + 20, strY, {
        width: pw - M * 2 - 20,
        lineGap: 1,
      });
      strY = doc.y + 10;
    });

    // Disclaimer
    const disclaimerY = Math.max(strY + 30, ph - 155);
    fillRect(doc, M, disclaimerY, pw - M * 2, 88, C.surface);
    strokeRect(doc, M, disclaimerY, pw - M * 2, 88, C.yellow, 0.8);
    doc.fontSize(9).fillColor(C.yellow).text("Aviso importante", M + 14, disclaimerY + 12);
    doc.fontSize(8.5).fillColor(C.textMuted).text(
      "Este análisis fue generado automáticamente por Groq (llama-3.1-8b-instant). Las evaluaciones son estimaciones basadas en los datos disponibles y deben ser revisadas por el equipo antes de tomar decisiones. No reemplaza el juicio profesional del PM ni del equipo de desarrollo.",
      M + 14,
      disclaimerY + 28,
      { width: pw - M * 2 - 28, lineGap: 3 }
    );

    addFooter(doc, dateStr, 4);
  });
}

module.exports = { generateExecutiveSummaryPdf, generateRiskAnalysisPdf };
