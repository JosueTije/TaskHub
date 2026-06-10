/**
 * One-time script: generate embeddings for all tickets that don't have one yet.
 * Run: node scripts/backfill-embeddings.js
 */
require("dotenv").config();

const prisma = require("../src/config/prisma");
const { embedOne } = require("../src/services/embedding.service");

const BATCH = 20; // Nomic free tier: 1000 req/day, so go easy

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

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const total = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count FROM "Ticket" WHERE embedding IS NULL
  `;
  const pending = Number(total[0].count);
  console.log(`Tickets sin embedding: ${pending}`);

  let processed = 0;
  let skip = 0;

  while (true) {
    // Unsupported type can't be filtered via Prisma ORM — use raw SQL
    const rows = await prisma.$queryRaw`
      SELECT id FROM "Ticket" WHERE embedding IS NULL LIMIT ${BATCH}
    `;

    if (!rows.length) break;

    const tickets = await prisma.ticket.findMany({
      where: { id: { in: rows.map((r) => r.id) } },
      include: {
        sprint: { select: { name: true } },
        assignedTo: { select: { fullName: true } },
      },
    });

    for (const ticket of tickets) {
      try {
        const embedding = await embedOne(ticketToText(ticket), "search_document");
        const vectorLiteral = `[${embedding.join(",")}]`;
        await prisma.$executeRaw`
          UPDATE "Ticket" SET "embedding" = ${vectorLiteral}::vector WHERE "id" = ${ticket.id}
        `;
        processed++;
        process.stdout.write(`\r${processed}/${pending} procesados`);
      } catch (err) {
        console.error(`\nError en ticket ${ticket.id}:`, err.message);
        skip++;
      }
      await sleep(50);
    }
  }

  console.log(`\nListo. ${processed} embeddings generados.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
