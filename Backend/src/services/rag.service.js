const prisma = require("../config/prisma");
const { embedOne } = require("./embedding.service");

function ticketToText(ticket) {
  return [
    `Título: ${ticket.title}`,
    ticket.description ? `Descripción: ${ticket.description}` : null,
    `Estado: ${ticket.status}`,
    `Prioridad: ${ticket.priority}`,
    ticket.sprint?.name ? `Sprint: ${ticket.sprint.name}` : null,
    ticket.assignedTo?.fullName ? `Asignado a: ${ticket.assignedTo.fullName}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

// Store embedding for one ticket (fire-and-forget safe)
async function embedTicket(ticketId) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        sprint: { select: { name: true } },
        assignedTo: { select: { fullName: true } },
      },
    });
    if (!ticket) return;

    const embedding = await embedOne(ticketToText(ticket), "search_document");
    const vectorLiteral = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      UPDATE "Ticket"
      SET "embedding" = ${vectorLiteral}::vector
      WHERE "id" = ${ticketId}
    `;
  } catch (err) {
    // Non-blocking — ticket op succeeded even if embedding fails
    console.error("[RAG] embedTicket failed for", ticketId, err.message);
  }
}

// Find the K most semantically relevant tickets for a query
async function searchRelevantTickets(query, projectId, limit = 8) {
  try {
    const embedding = await embedOne(query, "search_query");
    const vectorLiteral = `[${embedding.join(",")}]`;

    const rows = await prisma.$queryRaw`
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t."storyPoints",
        s.name  AS "sprintName",
        u."fullName" AS "assigneeName",
        ROUND((1 - (t.embedding <=> ${vectorLiteral}::vector))::numeric, 3) AS similarity
      FROM "Ticket" t
      LEFT JOIN "Sprint" s ON s.id = t."sprintId"
      LEFT JOIN "User"   u ON u.id  = t."assignedToId"
      WHERE t."projectId" = ${projectId}
        AND t.embedding IS NOT NULL
      ORDER BY t.embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `;

    return rows;
  } catch (err) {
    console.error("[RAG] searchRelevantTickets failed:", err.message);
    return []; // graceful degradation
  }
}

// Format RAG results into a context string for the system prompt
function formatRagContext(tickets) {
  if (!tickets.length) return "";

  const lines = tickets.map(
    (t) =>
      `  - [${t.priority}] ${t.title} → ${t.status}` +
      (t.assigneeName ? ` (${t.assigneeName})` : "") +
      (t.sprintName ? ` | Sprint: ${t.sprintName}` : "") +
      (t.similarity != null ? ` | relevancia: ${t.similarity}` : "")
  );

  return `\n## Tickets más relevantes para esta consulta:\n${lines.join("\n")}`;
}

module.exports = { embedTicket, searchRelevantTickets, formatRagContext, ticketToText };
