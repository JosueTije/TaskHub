const PRIORITY_POINTS = { CRITICAL: 50, HIGH: 30, MEDIUM: 20, LOW: 10 };

function ticketScore(ticket) {
  let score = PRIORITY_POINTS[ticket.priority] ?? 10;
  if (ticket.storyPoints) score += ticket.storyPoints * 5;
  if (
    ticket.estimatedHours != null &&
    ticket.actualHours != null &&
    ticket.actualHours <= ticket.estimatedHours * 1.15
  ) {
    score += 5;
  }
  return score;
}

module.exports = { PRIORITY_POINTS, ticketScore };
