// src/types/project.ts

export type ProjectStatus =
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED";

export type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type SprintStatus =
  | "PLANNING"
  | "ACTIVE"
  | "COMPLETED";

export type TicketStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "BLOCKED";

export type TicketPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export interface ProjectUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface ProjectMember extends ProjectUser {
  avatarUrl: string | null;
}

export interface ProjectStats {
  membersCount: number;
  sprintsCount: number;
  ticketsCount: number;
}

export interface BackendProject {
  id: string;
  name: string;
  code: string;
  description: string | null;

  status: ProjectStatus;
  riskLevel: RiskLevel;

  startDate: string;
  targetEndDate: string;
  actualEndDate: string | null;

  budget: number | null;

  createdAt: string;
  updatedAt: string;

  pm: ProjectUser | null;

  createdBy: ProjectUser;

  members: ProjectMember[];

  stats: ProjectStats;
}

export interface BackendSprint {
  id: string;
  name: string;
  goal?: string;
  status: SprintStatus;

  startDate: string;
  endDate: string;

  capacity: number;

  projectId?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface BackendTicket {
  id: string;
  title: string;
  description: string | null;

  status: TicketStatus;
  priority: TicketPriority;

  storyPoints: number;
  estimatedHours?: number;

  sprintId: string;

  assignedToId?: string | null;

  assignedTo?: {
    id: string;
    fullName: string;
    email?: string;
  } | null;

  parentTicketId?: string | null;

  createdAt: string;
  completedAt?: string | null;

  createdById?: string;
  updatedAt?: string;
}

export interface UiSprint {
  id: string;
  name: string;

  status: "Upcoming" | "Active" | "Completed";

  duration: string;

  startDate: string;
  endDate: string;

  capacity: number;
}

export interface UiTicket {
  id: string;
  title: string;
  description: string;

  status:
    | "Backlog"
    | "In Progress"
    | "Done"
    | "Blocked";

  priority:
    | "Low"
    | "Medium"
    | "High";

  assignee: string;

  estimation: number;

  sprintId: string;

  parentTicketId: string | null;

  startDate: string;
  endDate: string | null;
}