const crypto = require("crypto");
const prisma = require("../config/prisma");
const { clearLeaderboardCache } = require("../services/gamification.service");
const { createNotification } = require("../services/notification.service");
const { getIO } = require("../config/socket");

function emitTicketUpdate(ticket) {
  try { getIO()?.to(`project:${ticket.projectId}`).emit("ticket:updated", { ticket }); } catch {}
}

// ── Verificación de firma ──────────────────────────────────────────────────
// GitHub envía el header X-Hub-Signature-256 calculado con HMAC-SHA256 sobre
// el body RAW. Si la firma no coincide se rechaza el request con 401.
// IMPORTANTE: este endpoint debe recibir el body como Buffer (express.raw),
// NO como JSON parseado, porque la firma se calcula sobre los bytes exactos.
function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(req.body); // req.body es Buffer gracias a express.raw()
  const expected = `sha256=${hmac.digest("hex")}`;

  console.log(`[GitHub Webhook] Firma recibida:  ${signature}`);
  console.log(`[GitHub Webhook] Firma esperada:  ${expected}`);

  // timingSafeEqual previene timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}

// ── Handler principal ──────────────────────────────────────────────────────
async function githubWebhookController(req, res) {
  // 1. Verificar firma antes de procesar cualquier cosa
  if (!verifySignature(req)) {
    console.warn("[GitHub Webhook] Firma inválida — request rechazado");
    return res.status(401).json({ message: "Firma de webhook inválida" });
  }

  const event = req.headers["x-github-event"];
  console.log(`[GitHub Webhook] Evento recibido: "${event}"`);

  // 2. Ignorar eventos que no sean pull_request
  if (event !== "pull_request") {
    console.log(`[GitHub Webhook] Ignorando evento "${event}"`);
    return res.status(200).json({ message: "Evento ignorado" });
  }

  let body;
  try {
    body = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({ message: "Body inválido" });
  }

  const { action, pull_request: pr } = body;

  try {
    // ── PR abierto o reabierto ─────────────────────────────────────────────
    console.log(`[GitHub Webhook] pull_request action: "${action}", head: "${pr.head.ref}", base: "${pr.base.ref}"`);

    if (action === "opened" || action === "reopened") {
      const headBranch = pr.head.ref;

      const ticket = await prisma.ticket.findFirst({
        where: { githubBranch: headBranch },
      });

      if (!ticket) {
        // Caso 3: branch creada manualmente en GitHub sin pasar por TaskHub
        console.warn(
          `[GitHub Webhook] Sin ticket para la rama: ${headBranch}. Ignorando.`
        );
        return res.status(200).json({ message: "OK" });
      }

      // Caso 5: el PR apunta a main en lugar de a la rama del sprint
      const baseBranch = pr.base.ref;
      if (baseBranch === "main") {
        console.warn(
          `[GitHub Webhook] PR #${pr.number} apunta a main en lugar de a la rama del sprint (ticket ${ticket.id})`
        );
      }

      const updatedReview = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: "IN_REVIEW",
          githubPrNumber: pr.number,
          githubPrUrl: pr.html_url,
          githubPrStatus: "open",
        },
      });
      emitTicketUpdate(updatedReview);

      console.log(
        `[GitHub Webhook] Ticket ${ticket.id} → IN_REVIEW (PR #${pr.number} abierto)`
      );
    }

    // ── PR cerrado ─────────────────────────────────────────────────────────
    else if (action === "closed") {
      const ticket = await prisma.ticket.findFirst({
        where: { githubPrNumber: pr.number },
        include: { project: { select: { name: true } } },
      });

      if (!ticket) {
        // Caso 3: PR no asociado a ningún ticket
        console.warn(
          `[GitHub Webhook] Sin ticket para el PR #${pr.number}. Ignorando.`
        );
        return res.status(200).json({ message: "OK" });
      }

      if (pr.merged) {
        // PR aprobado y mergeado → ticket Completado
        const updatedDone = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: "DONE",
            githubPrStatus: "merged",
            completedAt: new Date(),
          },
        });
        emitTicketUpdate(updatedDone);

        // Invalidar caché del leaderboard para que los puntos se recalculen
        clearLeaderboardCache();

        // Notificar al developer asignado para que actualice sus horas reales
        if (ticket.assignedToId) {
          createNotification({
            userId: ticket.assignedToId,
            type: "PR_MERGED",
            title: "PR aprobado y mergeado 🎉",
            description: `El PR #${pr.number} de "${ticket.title}" fue aprobado y mergeado. El ticket quedó como Done. ¡No olvides actualizar las horas reales en el ticket!`,
            projectName: ticket.project?.name ?? null,
          }).catch((err) =>
            console.error("[GitHub Webhook] Error al crear notificación:", err.message)
          );
        }

        console.log(
          `[GitHub Webhook] Ticket ${ticket.id} → DONE (PR #${pr.number} mergeado)`
        );
      } else {
        // PR cerrado sin merge → ticket vuelve a En Progreso
        const updatedProgress = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: "IN_PROGRESS",
            githubPrStatus: "closed",
          },
        });
        emitTicketUpdate(updatedProgress);

        console.log(
          `[GitHub Webhook] Ticket ${ticket.id} → IN_PROGRESS (PR #${pr.number} rechazado)`
        );
      }
    }
  } catch (error) {
    console.error("[GitHub Webhook] Error procesando evento:", error.message);
    return res.status(500).json({ message: "Error interno" });
  }

  return res.status(200).json({ message: "OK" });
}

module.exports = githubWebhookController;
