// src/hooks/useProjectDetail.ts

import { useEffect, useMemo, useState } from "react";
import { authFetch } from "../services/api";
import { projects } from "../app/data/mockData";

import type {
  BackendProject,
  BackendSprint,
  BackendTicket,
} from "../types/project";

import {
  mapBackendSprintToUi,
  mapBackendTicketToUi,
  formatBackendStatus,
  formatDateLabel,
  formatMoneyLabel,
  safeText,
} from "../utils/projectMappers";

const mapRiskToUi = (risk?: string) => {
  switch (risk) {
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    default:
      return "Low";
  }
};



export function useProjectDetail(id?: string) {
  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectLoadError, setProjectLoadError] = useState("");

  const [realSprints, setRealSprints] = useState<BackendSprint[]>([]);
  const [realTickets, setRealTickets] = useState<BackendTicket[]>([]);
  const [loadingAgile, setLoadingAgile] = useState(false);

  const [dashboard, setDashboard] = useState<any>(null);

  const [availableDevelopers, setAvailableDevelopers] = useState<any[]>([]);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState("");
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);

  const mockProject = projects.find((p) => p.id === id) || projects[0];
  const backendProject = backendProjects.find((p) => p.id === id) || null;
useEffect(() => {
  if (!id) return;
  loadDashboard();
}, [id, realTickets]);
  const loadProjects = async () => {
    try {
      setIsLoadingProject(true);
      setProjectLoadError("");

      const data = await authFetch<{ projects: BackendProject[] }>("/projects");
      setBackendProjects(data.projects || []);
    } catch (err: any) {
      setProjectLoadError(
        err.message || "No se pudo cargar el detalle real del proyecto"
      );
    } finally {
      setIsLoadingProject(false);
    }
  };

  const loadSprints = async () => {
    if (!id) return;

    try {
      setLoadingAgile(true);

      const sprintRes = await authFetch<{ sprints: BackendSprint[] }>(
        `/sprints/project/${id}`
      );

      setRealSprints(sprintRes.sprints || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAgile(false);
    }
  };

  const loadDashboard = async () => {
    if (!id) return;

    try {
      const data = await authFetch(`/analytics/project/${id}/dashboard`);
      setDashboard(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTickets = async (sprintFilter: string | "all") => {
    if (!realSprints.length) return;

    try {
      if (sprintFilter === "all") {
        const responses = await Promise.all(
          realSprints.map((sprint) =>
            authFetch<{ tickets: BackendTicket[] }>(
              `/tickets/sprint/${sprint.id}`
            )
          )
        );

        const allTickets = responses.flatMap((res) => res.tickets || []);
        setRealTickets(allTickets);
      } else {
        const data = await authFetch<{ tickets: BackendTicket[] }>(
          `/tickets/sprint/${sprintFilter}`
        );

        setRealTickets(data.tickets || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadDevelopers = async (projectMembers: any[] = []) => {
    try {
      setLoadingDevelopers(true);

      const data = await authFetch<{ developers: any[] }>("/users/developers");

      const projectMemberIds = new Set(
        projectMembers.map((member: any) => member.id)
      );

      const filteredDevelopers = (data.developers || []).filter(
        (developer: any) => !projectMemberIds.has(developer.id)
      );

      setAvailableDevelopers(filteredDevelopers);
    } catch (error: any) {
      alert(error.message || "No se pudieron cargar los developers");
    } finally {
      setLoadingDevelopers(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadSprints();
    loadDashboard();
  }, [id]);

  const mapTeamFromMembers = (members?: BackendProject["members"]) => {
    if (dashboard?.teamMetrics) {
      return dashboard.teamMetrics.map((member: any) => ({
        id: member.id,
        name: member.name || "N/A",
        role: "Developer",
        email: member.email || "N/A",
        avatar:
          member.name
            ?.split(" ")
            .filter(Boolean)
            .map((part: string) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "NA",
        tasksAssigned: member.tasksAssigned ?? 0,
        performance: member.performance ?? 0,
        status: member.status || "Active",
      }));
    }

    if (!members || members.length === 0) return [];

    return members.map((m) => ({
      id: m.id,
      name: m.fullName || "N/A",
      role: m.role || "N/A",
      email: m.email || "N/A",
      avatar:
        m.fullName
          ?.split(" ")
          .filter(Boolean)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "NA",
      tasksAssigned: 0,
      performance: 0,
      status: "N/A",
    }));
  };

  const project = useMemo(() => {
    if (!mockProject && !backendProject) return null;

    const kpis = dashboard?.kpis;

    const analyticsValues = {
      progress: kpis?.progress ?? 0,
      progressLabel:
        kpis?.progress !== undefined && kpis?.progress !== null
          ? `${kpis.progress}%`
          : "0%",
      scheduleVariance: kpis?.scheduleVariance ?? 0,
      spi: kpis?.spi ?? 1,
      delayedMilestones: kpis?.delayedMilestones ?? 0,
      blockedTickets: kpis?.blockedTickets ?? 0,
      teamVelocity: "N/A",
      openRisks: "N/A",
      risk: mapRiskToUi(kpis?.risk),
      progressHistory: dashboard?.progressHistory?.length
        ? dashboard.progressHistory
        : [{ date: "Real", planned: 0, actual: 0 }],
    };

    if (!mockProject && backendProject) {
      return {
        id: backendProject.id,
        name: safeText(backendProject.name),
        code: safeText(backendProject.code),
        description: safeText(backendProject.description),

        status: formatBackendStatus(backendProject.status),
        risk: analyticsValues.risk,

        startDate: backendProject.startDate ?? null,
        targetEndDate: backendProject.targetEndDate ?? null,
        actualEndDate: backendProject.actualEndDate ?? null,

        startDateLabel: formatDateLabel(backendProject.startDate),
        targetEndDateLabel: formatDateLabel(backendProject.targetEndDate),
        actualEndDateLabel: formatDateLabel(backendProject.actualEndDate),

        budget: backendProject.budget ?? null,
        budgetLabel: formatMoneyLabel(backendProject.budget),

        pm: backendProject.pm
          ? {
              name: backendProject.pm.fullName,
              email: backendProject.pm.email,
              role: backendProject.pm.role,
            }
          : {
              name: "N/A",
              email: "N/A",
              role: "N/A",
            },

        createdBy: backendProject.createdBy
          ? {
              name: backendProject.createdBy.fullName,
              email: backendProject.createdBy.email,
              role: backendProject.createdBy.role,
            }
          : {
              name: "N/A",
              email: "N/A",
              role: "N/A",
            },

        pmName: backendProject.pm?.fullName || "N/A",
        pmEmail: backendProject.pm?.email || "N/A",
        createdByName: backendProject.createdBy?.fullName || "N/A",
        createdByEmail: backendProject.createdBy?.email || "N/A",

        members: backendProject.members ?? [],

        developers: (backendProject.members ?? []).map((m) => ({
          name: m.fullName,
          role: m.role,
          email: m.email,
          avatar: m.avatarUrl,
          completedTickets: "N/A",
          velocity: "N/A",
          workload: "N/A",
        })),

        team: mapTeamFromMembers(backendProject.members),

        teamMembersLabel: backendProject.members.length
          ? backendProject.members.map((m) => m.fullName).join(", ")
          : "N/A",

        teamSize: backendProject.stats?.membersCount ?? 0,

        stats: backendProject.stats ?? {
          membersCount: 0,
          sprintsCount: 0,
          ticketsCount: 0,
        },

        sprintsCountLabel: backendProject.stats?.sprintsCount ?? "N/A",
        ticketsCountLabel: backendProject.stats?.ticketsCount ?? "N/A",

        ...analyticsValues,

        sprints: realSprints.map(mapBackendSprintToUi),
        tickets: realTickets.map(mapBackendTicketToUi),

        notifications: [],

        closedDate: backendProject.actualEndDate
          ? new Date(backendProject.actualEndDate).toISOString().split("T")[0]
          : "N/A",

        closedBy: "N/A",
      };
    }

    return {
      ...mockProject,

      id: backendProject?.id ?? mockProject.id,
      name: backendProject?.name ?? mockProject.name,
      code: safeText(backendProject?.code),
      description: safeText(backendProject?.description),

      status: formatBackendStatus(backendProject?.status),
      risk: analyticsValues.risk,

      startDate: backendProject?.startDate ?? null,
      targetEndDate: backendProject?.targetEndDate ?? null,
      actualEndDate: backendProject?.actualEndDate ?? null,

      startDateLabel: formatDateLabel(backendProject?.startDate),
      targetEndDateLabel: formatDateLabel(backendProject?.targetEndDate),
      actualEndDateLabel: formatDateLabel(backendProject?.actualEndDate),

      budget: backendProject?.budget ?? null,
      budgetLabel: formatMoneyLabel(backendProject?.budget),

      pm: backendProject?.pm
        ? {
            name: backendProject.pm.fullName,
            email: backendProject.pm.email,
            role: backendProject.pm.role,
          }
        : {
            name: "N/A",
            email: "N/A",
            role: "N/A",
          },

      createdBy: backendProject?.createdBy
        ? {
            name: backendProject.createdBy.fullName,
            email: backendProject.createdBy.email,
            role: backendProject.createdBy.role,
          }
        : {
            name: "N/A",
            email: "N/A",
            role: "N/A",
          },

      pmName: backendProject?.pm?.fullName || "N/A",
      pmEmail: backendProject?.pm?.email || "N/A",
      createdByName: backendProject?.createdBy?.fullName || "N/A",
      createdByEmail: backendProject?.createdBy?.email || "N/A",

      members: backendProject?.members ?? [],

      developers: backendProject?.members?.length
        ? backendProject.members.map((m) => ({
            name: m.fullName,
            role: m.role,
            email: m.email,
            avatar: m.avatarUrl,
            completedTickets: "N/A",
            velocity: "N/A",
            workload: "N/A",
          }))
        : [],

      team: backendProject?.members?.length
        ? mapTeamFromMembers(backendProject.members)
        : Array.isArray(mockProject.team)
        ? mockProject.team
        : [],

      teamMembersLabel: backendProject?.members?.length
        ? backendProject.members.map((m) => m.fullName).join(", ")
        : "N/A",

      teamSize:
        backendProject?.stats?.membersCount ?? mockProject.team?.length ?? 0,

      stats: backendProject?.stats ?? {
        membersCount: mockProject.team?.length ?? 0,
        sprintsCount: 0,
        ticketsCount: 0,
      },

      sprintsCountLabel: backendProject?.stats?.sprintsCount ?? "N/A",
      ticketsCountLabel: backendProject?.stats?.ticketsCount ?? "N/A",

      ...analyticsValues,

      sprints: realSprints.map(mapBackendSprintToUi),
      tickets: realTickets.map(mapBackendTicketToUi),

      notifications: [],

      closedDate: backendProject?.actualEndDate
        ? new Date(backendProject.actualEndDate).toISOString().split("T")[0]
        : "N/A",

      closedBy: "N/A",
    };
  }, [mockProject, backendProject, realSprints, realTickets, dashboard]);

  const handleCreateSprint = async (sprintData: {
    name: string;
    startDate: string;
    endDate: string;
    capacity: string;
  }) => {
    try {
      await authFetch(`/sprints/project/${id}`, {
        method: "POST",
        body: JSON.stringify({
          name: sprintData.name,
          goal: sprintData.name,
          capacity: Number(sprintData.capacity),
          startDate: sprintData.startDate,
          endDate: sprintData.endDate,
        }),
      });

      await loadSprints();
      await loadDashboard();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCreateTicket = async (ticketData: {
    title: string;
    estimation: string;
    assignee: string;
    priority: string;
    description: string;
    status: string;
    sprintId: string;
  }) => {
    try {
      const priorityMap: any = {
        High: "HIGH",
        Medium: "MEDIUM",
        Low: "LOW",
      };

      const statusMap: any = {
        Backlog: "TODO",
        "In Progress": "IN_PROGRESS",
        Review: "IN_REVIEW",
        Blocked: "BLOCKED",
        Done: "DONE",
      };

      const response = await authFetch<{ ticket: BackendTicket }>(
        `/tickets/sprint/${ticketData.sprintId}`,
        {
          method: "POST",
          body: JSON.stringify({
            title: ticketData.title,
            description: ticketData.description,
            priority: priorityMap[ticketData.priority] || "MEDIUM",
            status: statusMap[ticketData.status] || "TODO",
            storyPoints: Number(ticketData.estimation),
            estimatedHours: Number(ticketData.estimation),
            assignedToId: ticketData.assignee || null,
          }),
        }
      );

      setRealTickets((prev) => [response.ticket, ...prev]);
      await loadDashboard();

      return response.ticket;
    } catch (error: any) {
      alert(error.message);
      return null;
    }
  };

  const handleAddDeveloper = async () => {
    try {
      if (!selectedDeveloperId) {
        alert("Selecciona un developer");
        return;
      }

      await authFetch(`/projects/${id}/members`, {
        method: "POST",
        body: JSON.stringify({
          userId: selectedDeveloperId,
        }),
      });

      await loadProjects();
      await loadDashboard();

      setSelectedDeveloperId("");
    } catch (error: any) {
      alert(error.message || "No se pudo agregar el developer");
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    try {
      await authFetch(`/sprints/${sprintId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });

      await loadSprints();
      await loadDashboard();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleTicketUpdate = async (ticketId: string, updates: any) => {
    try {
      const priorityMap: any = {
        High: "HIGH",
        Medium: "MEDIUM",
        Low: "LOW",
      };

      const statusMap: any = {
        Backlog: "TODO",
        "In Progress": "IN_PROGRESS",
        Done: "DONE",
        Blocked: "BLOCKED",
      };

      await authFetch(`/tickets/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          priority: priorityMap[updates.priority],
          storyPoints: updates.estimation,
          estimatedHours: updates.estimation,
        }),
      });

      const statusResponse = await authFetch<{ ticket: BackendTicket }>(
        `/tickets/${ticketId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: statusMap[updates.status],
          }),
        }
      );

      setRealTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? statusResponse.ticket : ticket
        )
      );

      await loadDashboard();

      return statusResponse.ticket;
    } catch (error: any) {
      alert(error.message || "No se pudo actualizar el ticket");
      return null;
    }
  };

  return {
    project,
    mockProject,
    backendProject,
    dashboard,
    loadDashboard,

    backendProjects,
    setBackendProjects,

    isLoadingProject,
    projectLoadError,

    realSprints,
    setRealSprints,

    realTickets,
    setRealTickets,

    loadingAgile,

    availableDevelopers,
    selectedDeveloperId,
    setSelectedDeveloperId,
    loadingDevelopers,

    loadProjects,
    loadSprints,
    loadTickets,
    loadDevelopers,

    handleCreateSprint,
    handleCreateTicket,
    handleAddDeveloper,
    handleCompleteSprint,
    handleTicketUpdate,
  };
}