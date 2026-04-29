// src/utils/projectMappers.ts

export const mapBackendSprintToUi = (sprint: any) => ({
  id: sprint.id,
  name: sprint.name,

  status:
    sprint.status === "PLANNING"
      ? "Upcoming"
      : sprint.status === "ACTIVE"
      ? "Active"
      : "Completed",

  duration: `${new Date(sprint.startDate).toLocaleDateString()} - ${new Date(
    sprint.endDate
  ).toLocaleDateString()}`,

  startDate: sprint.startDate,
  endDate: sprint.endDate,
  capacity: sprint.capacity,
});

export const mapBackendTicketToUi = (ticket: any) => ({
  id: ticket.id,
  title: ticket.title,
  description: ticket.description || "",

  status:
    ticket.status === "TODO"
      ? "Backlog"
      : ticket.status === "IN_PROGRESS"
      ? "In Progress"
      : ticket.status === "DONE"
      ? "Done"
      : ticket.status === "BLOCKED"
      ? "Blocked"
      : "Backlog",

  priority:
    ticket.priority === "LOW"
      ? "Low"
      : ticket.priority === "HIGH"
      ? "High"
      : "Medium",

  assignee: ticket.assignedTo?.fullName || "Sin asignar",

  estimation: ticket.storyPoints || 0,

  sprintId: ticket.sprintId,
  parentTicketId: ticket.parentTicketId || null,

  startDate: ticket.createdAt,
  endDate: ticket.completedAt || null,
});

export const formatBackendStatus = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "ON_HOLD":
      return "On Hold";

    case "COMPLETED":
      return "Completed";

    case "ARCHIVED":
      return "Archived";

    default:
      return "N/A";
  }
};

export const formatBackendRisk = (risk?: string) => {
  switch (risk) {
    case "LOW":
      return "Low";

    case "MEDIUM":
      return "Medium";

    case "HIGH":
      return "High";

    case "CRITICAL":
      return "High";

    default:
      return "N/A";
  }
};

export const formatDateLabel = (value?: string | null) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatMoneyLabel = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
};

export const safeText = (value?: string | null) => {
  if (!value || !String(value).trim()) {
    return "N/A";
  }

  return value;
};