import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, AlertCircle, Target, Users, Clock, CheckCircle2, XCircle, FileText, Zap, Trophy, Award, Plus, X, ArrowRight, Activity, BarChart3, MessageSquare, Settings, ChevronDown, ChevronUp, GripVertical, Shield, ListTodo, Bell, Sparkles, PlayCircle, Edit3, Link2, Info, Table, LayoutGrid, UserPlus, Star, Rocket, Flame, Code, GitBranch, Percent, RefreshCw, Archive, Lock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Header } from '../components/Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
type Ticket = any;import { useAuth } from '../contexts/AuthContext';
import { TicketDetailModal } from '../components/TicketDetailModal';
import { authFetch } from '../../services/api';
import type { BackendProject } from '../../types/project';
import {
  mapBackendSprintToUi,
  mapBackendTicketToUi,
  formatBackendStatus,
  formatBackendRisk,
  formatDateLabel,
  formatMoneyLabel,
  safeText,
} from '../../utils/projectMappers';




export function ProjectDetail() {
const {
  id
} = useParams();
const navigate = useNavigate();
const {
  user,
  theme
} = useAuth();
const role = user?.role || 'DEVELOPER';

const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
const [isLoadingProject, setIsLoadingProject] = useState(true);
const [projectLoadError, setProjectLoadError] = useState('');
const [realSprints, setRealSprints] = useState<any[]>([]);
const [realTickets, setRealTickets] = useState<any[]>([]);
const [loadingAgile, setLoadingAgile] = useState(false);

const [availableDevelopers, setAvailableDevelopers] = useState<any[]>([]);
const [selectedDeveloperId, setSelectedDeveloperId] = useState("");
const [loadingDevelopers, setLoadingDevelopers] = useState(false);


const [dashboard, setDashboard] = useState<any>(null);

const mapDashboardRiskToUi = (risk?: string) => {
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

const loadDashboard = async () => {
  if (!id) return;

  try {
const data = await authFetch(`/analytics/project/${id}/dashboard`);
console.log("DASHBOARD DATA:", data);
setDashboard(data);
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  loadDashboard();
}, [id]);

useEffect(() => {
  if (!id) return;

  const loadAgile = async () => {
    try {
      setLoadingAgile(true);

      const sprintRes = await authFetch(`/sprints/project/${id}`);
      setRealSprints(sprintRes.sprints || []);

    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAgile(false);
    }
  };

  loadAgile();
}, [id]);

useEffect(() => {
  const loadProjects = async () => {
    try {
      setIsLoadingProject(true);
      setProjectLoadError('');

      const data = await authFetch<{ projects: BackendProject[] }>('/projects');
      setBackendProjects(data.projects || []);
    } catch (err: any) {
      setProjectLoadError(err.message || 'No se pudo cargar el detalle real del proyecto');
    } finally {
      setIsLoadingProject(false);
    }
  };

  loadProjects();
}, []);



const backendProject = backendProjects.find(p => p.id === id) || null;
const project = useMemo(() => {
  if (!backendProject) return null;

  const teamMetrics = dashboard?.teamMetrics || [];

  const team = (backendProject.members || []).map((member: any) => {
    const metric = teamMetrics.find((m: any) => m.id === member.id);

    return {
      id: member.id,
      name: member.fullName || 'N/A',
      role: member.role || 'N/A',
      email: member.email || 'N/A',
      avatar:
        member.fullName
          ?.split(' ')
          .filter(Boolean)
          .map((part: string) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'NA',
      tasksAssigned: metric?.tasksAssigned ?? 0,
      performance: metric?.performance ?? 0,
      estimatedHours: metric?.estimatedHours ?? null,
      actualHours: metric?.actualHours ?? null,
      status: 'Active',
    };
  });

  return {
    id: backendProject.id,
    name: safeText(backendProject.name),
    code: safeText(backendProject.code),
    description: safeText(backendProject.description),

    status: formatBackendStatus(backendProject.status),
    risk: dashboard?.kpis?.risk
      ? mapDashboardRiskToUi(dashboard.kpis.risk)
      : formatBackendRisk(backendProject.riskLevel),

    startDate: backendProject.startDate ?? null,
    targetEndDate: backendProject.targetEndDate ?? null,
    actualEndDate: backendProject.actualEndDate ?? null,

    startDateLabel: formatDateLabel(backendProject.startDate),
    targetEndDateLabel: formatDateLabel(backendProject.targetEndDate),
    actualEndDateLabel: formatDateLabel(backendProject.actualEndDate),

    budget: backendProject.budget ?? null,
    budgetLabel: formatMoneyLabel(backendProject.budget),

    pmName: backendProject.pm?.fullName || 'N/A',
    pmEmail: backendProject.pm?.email || 'N/A',
    createdByName: backendProject.createdBy?.fullName || 'N/A',
    createdByEmail: backendProject.createdBy?.email || 'N/A',

    members: backendProject.members || [],
    team,

    teamSize: backendProject.stats?.membersCount ?? team.length,
    sprintsCountLabel: backendProject.stats?.sprintsCount ?? realSprints.length,
    ticketsCountLabel: backendProject.stats?.ticketsCount ?? realTickets.length,

    sprints: realSprints.map(mapBackendSprintToUi),
    tickets: realTickets.map(mapBackendTicketToUi),

    progressHistory: dashboard?.progressHistory?.length
      ? dashboard.progressHistory
      : [],

    closedDate: backendProject.actualEndDate
      ? new Date(backendProject.actualEndDate).toISOString().split('T')[0]
      : 'N/A',
  };
}, [backendProject, realSprints, realTickets, dashboard]);
const projectSprints = project?.sprints || [];
const projectTickets = project?.tickets || [];
const projectTeam = project?.team || [];
const projectBlockers = (project as any)?.blockers || [];
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showScenarioPanel, setShowScenarioPanel] = useState(false);
  const [showRecoveryPanel, setShowRecoveryPanel] = useState(false);
  const [showAddDeveloperModal, setShowAddDeveloperModal] = useState(false);

  useEffect(() => {
  if (!showAddDeveloperModal) return;

  const loadDevelopers = async () => {
    try {
      setLoadingDevelopers(true);

      const data = await authFetch("/users/developers");

      const projectMemberIds = new Set(
        (project?.members || []).map((member: any) => member.id)
      );

      const filteredDevelopers = (data.developers || []).filter(
        (developer: any) =>
          developer.role === 'DEVELOPER' && !projectMemberIds.has(developer.id)
      );

      setAvailableDevelopers(filteredDevelopers);
    } catch (error: any) {
      alert(error.message || "No se pudieron cargar los developers");
    } finally {
      setLoadingDevelopers(false);
    }
  };

  loadDevelopers();
}, [showAddDeveloperModal, project?.members]);
  const [showCloseProjectModal, setShowCloseProjectModal] = useState(false);
  const [showCompleteSprintModal, setShowCompleteSprintModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [gamificationView, setGamificationView] = useState<'project' | 'all'>('project');
  const [progressData, setProgressData] = useState({
    percentage: '',
    note: '',
    blocker: ''
  });
  const [sprintData, setSprintData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    capacity: '',
    status: 'Upcoming' as 'Upcoming' | 'Active' | 'Completed'
  });
const [ticketData, setTicketData] = useState({
  title: '',
  estimation: '',
  assignee: '',
  priority: 'Medium',
  description: '',
  status: 'Backlog' as 'Backlog' | 'In Progress',
  sprintId: '',
  parentTicketId: '',
  startDate: '',
  dueDate: '',
  estimatedHours: '',
});
  const [developerData, setDeveloperData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [selectedSprint, setSelectedSprint] = useState<number | null>(1);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showDivideTicketModal, setShowDivideTicketModal] = useState(false);
  const [ticketToDivide, setTicketToDivide] = useState<Ticket | null>(null);
  const [subTicketsData, setSubTicketsData] = useState<Array<{
    title: string;
    estimation: string;
    assignee: string;
    priority: string;
    description: string;
  }>>([{
    title: '',
    estimation: '',
    assignee: '',
    priority: 'Medium',
    description: ''
  }, {
    title: '',
    estimation: '',
    assignee: '',
    priority: 'Medium',
    description: ''
  }]);
const activeSprint = projectSprints.find((s) => s.status === 'Active');
  const [sprintFilter, setSprintFilter] = useState<string>(activeSprint?.id || 'active');

  const generalSprintFilters = ['active', 'history', 'upcoming', 'all'];
const selectedSprintFromFilter = projectSprints.find((s) => s.id === sprintFilter);
  const canCreateTicketInCurrentFilter = !generalSprintFilters.includes(sprintFilter);

  const assignableDevelopers = (backendProject?.members || [])
    .filter((member: any) => member.role === 'DEVELOPER')
    .map((member: any) => ({
      id: member.id,
      name: member.fullName,
      role: member.role,
      email: member.email,
      avatar: member.avatarUrl,
      tasksAssigned:
        dashboard?.teamMetrics?.find((metric: any) => metric.id === member.id)?.tasksAssigned ?? 0,
    }));

  const selectedAssigneeName =
    assignableDevelopers.find((developer: any) => developer.id === ticketData.assignee)?.name || '';

useEffect(() => {
  if (!realSprints.length) {
    setRealTickets([]);
    return;
  }

  const loadTickets = async () => {
    try {
      const rawSprints =
        sprintFilter === 'active'
          ? realSprints.filter((sprint) => sprint.status === 'ACTIVE')
          : sprintFilter === 'history'
          ? realSprints.filter((sprint) => sprint.status === 'COMPLETED')
          : sprintFilter === 'upcoming'
          ? realSprints.filter((sprint) => sprint.status === 'PLANNING')
          : sprintFilter === 'all'
          ? realSprints
          : realSprints.filter((sprint) => sprint.id === sprintFilter);

      if (!rawSprints.length) {
        setRealTickets([]);
        return;
      }

      const responses = await Promise.all(
        rawSprints.map((sprint) => authFetch(`/tickets/sprint/${sprint.id}`))
      );

      const allTickets = responses.flatMap((res) => res.tickets || []);
      setRealTickets(allTickets);
    } catch (error) {
      console.error(error);
    }
  };

  loadTickets();
}, [sprintFilter, realSprints]);
  const [ticketsView, setTicketsView] = useState<'table' | 'kanban'>('table');
  const [showMyTicketsOnly, setShowMyTicketsOnly] = useState(false);
  const sprintsGantt = [{
    id: 1,
    name: 'Sprint 1 - Foundation',
    startWeek: 1,
    plannedDuration: 2,
    actualDuration: 2.5,
    progress: 100,
    status: 'completed',
    completedTickets: 12,
    totalTickets: 12,
    capacity: 40,
    used: 42,
    risk: 'Low',
    dependencies: [],
    isCriticalPath: true
  }, {
    id: 2,
    name: 'Sprint 2 - Core Features',
    startWeek: 3.5,
    plannedDuration: 2,
    actualDuration: 2,
    progress: 100,
    status: 'completed',
    completedTickets: 15,
    totalTickets: 15,
    capacity: 40,
    used: 38,
    risk: 'Low',
    dependencies: [1],
    isCriticalPath: true
  }, {
    id: 3,
    name: 'Sprint 3 - Integration',
    startWeek: 5.5,
    plannedDuration: 2,
    actualDuration: null,
    progress: 75,
    status: 'active',
    completedTickets: 9,
    totalTickets: 12,
    capacity: 40,
    used: 35,
    risk: 'Medium',
    dependencies: [2],
    isCriticalPath: true
  }, {
    id: 4,
    name: 'Sprint 4 - Polish & QA',
    startWeek: 7.5,
    plannedDuration: 2,
    actualDuration: null,
    progress: 0,
    status: 'pending',
    completedTickets: 0,
    totalTickets: 10,
    capacity: 40,
    used: 0,
    risk: 'Low',
    dependencies: [3],
    isCriticalPath: true
  }, {
    id: 5,
    name: 'Sprint 5 - Release Prep',
    startWeek: 9.5,
    plannedDuration: 1.5,
    actualDuration: null,
    progress: 0,
    status: 'pending',
    completedTickets: 0,
    totalTickets: 8,
    capacity: 30,
    used: 0,
    risk: 'Low',
    dependencies: [4],
    isCriticalPath: true
  }];
  const currentWeek = 6.5;
  const totalWeeks = 12;
  const handleRegisterProgress = () => {
    console.log('Progress registered:', progressData);
    setShowProgressModal(false);
    setProgressData({
      percentage: '',
      note: '',
      blocker: ''
    });
  };
const handleCreateSprint = async () => {
  try {
    await authFetch(`/sprints/project/${id}`, {
      method: "POST",
      body: JSON.stringify({
        name: sprintData.name,
        goal: sprintData.name,
        capacity: Number(sprintData.capacity),
        startDate: sprintData.startDate,
        endDate: sprintData.endDate
      })
    });

    const data = await authFetch(`/sprints/project/${id}`);
    setRealSprints(data.sprints);
    await loadDashboard();

    setShowSprintModal(false);
  } catch (error:any) {
    alert(error.message);
  }
};
const handleCreateTicket = async () => {
  try {
    if (ticketData.startDate && ticketData.dueDate && new Date(ticketData.dueDate) < new Date(ticketData.startDate)) {
      alert('La fecha límite no puede ser anterior a la fecha de inicio.');
      return;
    }

    const priorityMap: any = {
      Critical: "CRITICAL",
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
      Cancelled: "CANCELLED",
    };

    const response = await authFetch(`/tickets/sprint/${ticketData.sprintId}`, {
      method: "POST",
body: JSON.stringify({
  title: ticketData.title,
  description: ticketData.description,
  priority: priorityMap[ticketData.priority] || "MEDIUM",
  status: statusMap[ticketData.status] || "TODO",
  storyPoints: Number(ticketData.estimation),
  estimatedHours: Number(ticketData.estimatedHours),
  assignedToId: ticketData.assignee || null,
  startDate: ticketData.startDate || null,
  dueDate: ticketData.dueDate || null,
}),
    });

    setRealTickets((prev) => [response.ticket, ...prev]);

    await loadDashboard();

    setShowTicketModal(false);

setTicketData({
  title: "",
  estimation: "",
  assignee: "",
  priority: "Medium",
  description: "",
  status: "Backlog",
  sprintId: "",
  parentTicketId: "",
  startDate: "",
  dueDate: "",
  estimatedHours: "",
});
  } catch (error: any) {
    alert(error.message);
  }
};
  const handleDivideTicket = (ticket: Ticket) => {
    setTicketToDivide(ticket);
    setShowDivideTicketModal(true);
    setSelectedTicket(null);
    setSubTicketsData([{
      title: '',
      estimation: '',
      assignee: ticket.assignee,
      priority: ticket.priority,
      description: ''
    }]);
  };
  const addSubTicketField = () => {
    setSubTicketsData([...subTicketsData, {
      title: '',
      estimation: '',
      assignee: ticketToDivide?.assignee || '',
      priority: ticketToDivide?.priority || 'Medium',
      description: ''
    }]);
  };
  const removeSubTicketField = (index: number) => {
    if (subTicketsData.length > 1) {
      setSubTicketsData(subTicketsData.filter((_, i) => i !== index));
    }
  };
  const handleConfirmDivision = () => {
    if (!ticketToDivide) return;
    const validSubTickets = subTicketsData.filter(st => st.title && st.estimation);
    if (validSubTickets.length < 1) {
      alert('⚠️ Debes crear al menos 1 subticket con título y estimación.');
      return;
    }
    const totalPoints = validSubTickets.reduce((sum, st) => sum + (parseInt(st.estimation) || 0), 0);
    const newSubTickets = validSubTickets.map((st, index) => ({
      id: `${ticketToDivide.id}-sub${index + 1}`,
      title: st.title,
      description: st.description,
      status: 'Backlog' as const,
      priority: st.priority as 'Low' | 'Medium' | 'High',
      assignee: st.assignee,
      estimation: parseInt(st.estimation) || 0,
      sprintId: ticketToDivide.sprintId,
      startDate: ticketToDivide.startDate,
      endDate: ticketToDivide.endDate,
      parentTicketId: ticketToDivide.id
    }));
    console.log('Ticket dividido en subtickets:', {
      parentTicket: ticketToDivide,
      subTickets: newSubTickets,
      totalPoints: totalPoints
    });
    alert(`✅ Ticket dividido exitosamente!\n\n📋 Ticket padre: ${ticketToDivide.title}\n🔢 ${newSubTickets.length} subtickets creados\n⏱️ Total story points: ${totalPoints}h\n\nLos subtickets aparecerán en la tabla/kanban y Gantt anidados bajo el ticket padre.`);
    setShowDivideTicketModal(false);
    setTicketToDivide(null);
    setShowDivideTicketModal(false);
    setTicketToDivide(null);
    setSubTicketsData([{
      title: '',
      estimation: '',
      assignee: '',
      priority: 'Medium',
      description: ''
    }, {
      title: '',
      estimation: '',
      assignee: '',
      priority: 'Medium',
      description: ''
    }]);
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

    const data = await authFetch<{ projects: BackendProject[] }>("/projects");
    setBackendProjects(data.projects || []);
    await loadDashboard();

    setShowAddDeveloperModal(false);
    setSelectedDeveloperId("");
  } catch (error: any) {
    alert(error.message || "No se pudo agregar el developer");
  }
};
const handleStartSprint = async (sprintId: string) => {
  try {
    if (!sprintId || generalSprintFilters.includes(sprintId)) {
      alert('Selecciona un sprint específico para iniciarlo.');
      return;
    }

    await authFetch(`/sprints/${sprintId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'ACTIVE',
      }),
    });

    const data = await authFetch(`/sprints/project/${id}`);
    setRealSprints(data.sprints || []);

    await loadDashboard();
    setSprintFilter(sprintId);
  } catch (error: any) {
    alert(error.message || 'No se pudo iniciar el sprint');
  }
};

const handleCompleteSprint = async () => {
  try {
    if (generalSprintFilters.includes(sprintFilter)) {
      alert('Selecciona un sprint específico para concluirlo.');
      return;
    }

    await authFetch(`/sprints/${sprintFilter}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'COMPLETED',
      }),
    });

    const data = await authFetch(`/sprints/project/${id}`);
    setRealSprints(data.sprints || []);
    await loadDashboard();

    setShowCompleteSprintModal(false);

    const nextActiveSprint = (data.sprints || []).find(
      (sprint: any) => sprint.status === 'ACTIVE'
    );

    setSprintFilter(nextActiveSprint?.id || 'active');
  } catch (error: any) {
    alert(error.message || 'No se pudo concluir el sprint');
  }
};
  const userTickets = realTickets.map(mapBackendTicketToUi);
  const sprintFilteredTickets = userTickets;
  const finalFilteredTickets = role === 'DEVELOPER' && showMyTicketsOnly ? sprintFilteredTickets.filter(t => t.assignee === user.name || t.assignee.includes(user.name)) : sprintFilteredTickets;
  const backlogTickets = finalFilteredTickets;
  const sprintTickets = finalFilteredTickets;
  const getParentTickets = (tickets: Ticket[]) => {
    return tickets.filter(t => !t.parentTicketId);
  };
const getSubTickets = (parentTicketId: string) => {
  return projectTickets.filter(t => t.parentTicketId === parentTicketId);
};
  const getTicketProgress = (ticket: Ticket): number => {
    if (ticket.subTickets && ticket.subTickets.length > 0) {
      const subTickets = ticket.subTickets.map(id => project.tickets.find(t => t.id === id)).filter(Boolean) as Ticket[];
      const doneTickets = subTickets.filter(t => t.status === 'Done').length;
      return Math.round(doneTickets / subTickets.length * 100);
    }
    return ticket.status === 'Done' ? 100 : 0;
  };
  const parentTicketsOnly = getParentTickets(finalFilteredTickets);
  const metricTickets = finalFilteredTickets || [];

const totalStoryPoints = metricTickets.reduce(
  (sum, ticket) => sum + (Number(ticket.storyPoints ?? ticket.estimation) || 0),
  0
);

const doneStoryPoints = metricTickets
  .filter((ticket) => ticket.status === 'Done')
  .reduce(
    (sum, ticket) => sum + (Number(ticket.storyPoints ?? ticket.estimation) || 0),
    0
  );

const progressByFilter = totalStoryPoints
  ? Math.round((doneStoryPoints / totalStoryPoints) * 100)
  : 0;

const blockedByFilter = metricTickets.filter(
  (ticket) => ticket.status === 'Blocked'
).length;

const delayedByFilter = metricTickets.filter((ticket) => {
  if (!ticket.dueDate) return false;

  return (
    new Date(ticket.dueDate) < new Date() &&
    !['Done', 'Cancelled'].includes(ticket.status)
  );
}).length;

const estimatedHoursByFilter = metricTickets.reduce(
  (sum, ticket) => sum + (Number(ticket.estimatedHours) || 0),
  0
);

const actualHoursByFilter = metricTickets
  .filter((ticket) => ticket.status === 'Done')
  .reduce((sum, ticket) => sum + (Number(ticket.actualHours) || 0), 0);

const hoursVarianceByFilter = actualHoursByFilter - estimatedHoursByFilter;

const efficiencyByFilter =
  actualHoursByFilter > 0
    ? Number((estimatedHoursByFilter / actualHoursByFilter).toFixed(2))
    : null;

const filteredKpis = {
  progress: progressByFilter,
  progressLabel: `${progressByFilter}%`,
  blockedTickets: blockedByFilter,
  delayedMilestones: delayedByFilter,
  estimatedHours: estimatedHoursByFilter,
  actualHours: actualHoursByFilter,
  hoursVariance: hoursVarianceByFilter,
  efficiency: efficiencyByFilter,
  scheduleVariance: dashboard?.kpis?.scheduleVariance ?? 'N/A',
  spi: dashboard?.kpis?.spi ?? 'N/A',
  risk: dashboard?.kpis?.risk ? mapDashboardRiskToUi(dashboard.kpis.risk) : 'N/A',
};
  const canManageProject = user.role === 'PM' || user.role === 'ADMIN';
  const canEditTickets = true;
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
      Review: "IN_REVIEW",
      Done: "DONE",
      Blocked: "BLOCKED",
      Cancelled: "CANCELLED",
    };

    let updatedTicketResponse;

    if (user.role === "ADMIN" || user.role === "PM") {
      await authFetch(`/tickets/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          priority: priorityMap[updates.priority],
          storyPoints: updates.estimation,
          startDate: updates.startDate,
          dueDate: updates.dueDate,
          estimatedHours: updates.estimatedHours ?? updates.estimation,
          actualHours: updates.actualHours,
        }),
      });
    }

    updatedTicketResponse = await authFetch(`/tickets/${ticketId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: statusMap[updates.status],
        actualHours: updates.actualHours,
      }),
    });

    setRealTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? updatedTicketResponse.ticket : ticket
      )
    );

    await loadDashboard();

    setSelectedTicket(null);
  } catch (error: any) {
    alert(error.message || "No se pudo actualizar el ticket");
  }
};
  const priorityColors: any = {
    Critical: 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30]/30',
    High: 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Low: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  };
  if (isLoadingProject || !project) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <p className="text-[#8E8E93]">Cargando detalle del proyecto...</p>
    </div>
  );
}

if (projectLoadError && !backendProject) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-red-400 mb-3">{projectLoadError}</p>
        <p className="text-[#8E8E93] text-sm">
          No pude cargar el detalle real, así que no conviene mostrar datos inventados.
        </p>
      </div>
    </div>
  );
}
  const handleCloseProject = () => {
    console.log('Cerrando proyecto:', project.name);
    project.status = 'Archived';
    project.closedDate = new Date().toISOString().split('T')[0];
    project.closedBy = user.name;
    setShowCloseProjectModal(false);
    alert(`Proyecto "${project.name}" archivado exitosamente.`);
    navigate('/archived-projects');
  };
  const KpiTooltip = ({ text }: { text: string }) => (
  <span className="relative group inline-flex">
    <Info className="w-4 h-4 text-[#8E8E93] cursor-help" />

    <span className="absolute left-1/2 top-6 z-50 hidden w-72 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0F0F0F] p-3 text-xs text-white shadow-xl group-hover:block">
      {text}
    </span>
  </span>
);
  return <div className="min-h-screen bg-[#0F0F0F]">
      {}
      <div className="border-b border-white/10 bg-[#0F0F0F] sticky top-0 z-10">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{project.name}</h1>
                <Badge variant={project.status === 'Delayed' ? 'danger' : project.status === 'Archived' ? 'outline' : 'default'}>
                  {project.status}
                </Badge>
                <Badge className="text-right text-right m-[0px] text-[12px]" variant={project.risk === 'High' ? 'danger' : project.risk === 'Medium' ? 'warning' : 'default'}>
                  Riesgo: {project.risk}
                </Badge>
              </div>
              <p className="text-sm text-[#8E8E93]">Gestión completa del proyecto</p>
            </div>
            
            {}
            {role === 'ADMIN' && project.status !== 'Archived' && <div>
                <button onClick={() => setShowCloseProjectModal(true)} className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-medium transition-all flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  Cerrar Proyecto
                </button>
              </div>}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {}
        <div className="bg-gradient-to-r from-[#FF3B30]/10 to-[#FF3B30]/5 border border-[#FF3B30]/20 rounded-xl p-6 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FF3B30]/10 rounded-lg">
                <Calendar className="w-6 h-6 text-[#FF3B30]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Filtrar por Sprint</h3>
                <p className="text-sm text-[#8E8E93]">Todos los KPIs, métricas y diagramas se ajustarán al sprint seleccionado</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select value={sprintFilter} onChange={e => setSprintFilter(e.target.value)} className="bg-[#1C1C1E] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B30] min-w-[250px]">
                <option value="active">🏃 Sprints Activos</option>
                <option value="history">✅ Historial / Sprints Cerrados</option>
                <option value="upcoming">📅 Próximos Sprints</option>
                <option value="all">📊 Todos los Sprints</option>
{projectSprints.map(sprint => <option key={sprint.id} value={sprint.id}>
                      {sprint.status === 'Active' && '🏃 '}
                    {sprint.status === 'Completed' && '✅ '}
                    {sprint.status === 'Upcoming' && '📅 '}
                    {sprint.name}
                  </option>)}
              </select>
            </div>
          </div>
        </div>

        {}
<section>
  {role === 'DEVELOPER' ? (
    <>
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-[#FF3B30]" />
        Mis Métricas Personales
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          {
            value: metricTickets.filter(
              (t) => t.assignee === user.name || t.assignee?.includes(user.name)
            ).length,
            label: 'Mis Tickets',
            icon: Trophy,
            color: 'text-[#FF3B30]',
            bg: 'bg-[#FF3B30]/10',
          },
          {
            value: metricTickets.filter(
              (t) =>
                (t.assignee === user.name || t.assignee?.includes(user.name)) &&
                t.status === 'Done'
            ).length,
            label: 'Completados',
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
          },
          {
            value: metricTickets.filter(
              (t) =>
                (t.assignee === user.name || t.assignee?.includes(user.name)) &&
                t.status === 'In Progress'
            ).length,
            label: 'En Progreso',
            icon: Clock,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            value: `${metricTickets
              .filter((t) => t.assignee === user.name || t.assignee?.includes(user.name))
              .reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0)}h`,
            label: 'Horas Estimadas',
            icon: Clock,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
          },
          {
            value: `${metricTickets
              .filter(
                (t) =>
                  (t.assignee === user.name || t.assignee?.includes(user.name)) &&
                  t.status === 'Done'
              )
              .reduce((sum, t) => sum + (Number(t.actualHours) || 0), 0)}h`,
            label: 'Horas Usadas',
            icon: Activity,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
          },
          {
            value: 'N/A',
            label: 'Ranking',
            icon: Award,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 sm:p-5 min-h-[130px] flex items-center gap-4 hover:border-white/20 transition-all min-w-0"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-3xl sm:text-4xl font-bold text-white leading-none truncate">
                  {item.value}
                </p>
                <p className="text-sm text-[#8E8E93] mt-3 truncate">
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  ) : (
    <>
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-[#FF3B30]" />
        KPIs Estratégicos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          {
            value: filteredKpis.progressLabel,
            label: '% Avance',
            tooltip: '% Avance = story points completados / story points totales * 100. Solo cuentan tickets con status DONE.',
            icon: TrendingUp,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            trend:
              filteredKpis.progress > 60 ? (
                <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#FF3B30] shrink-0" />
              ),
          },
          {
            value: filteredKpis.scheduleVariance,
            label: 'Schedule Variance',
            tooltip: 'Schedule Variance = avance real - avance planeado según fechas del proyecto.',
            icon: Clock,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            trend:
              Number(filteredKpis.scheduleVariance) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#FF3B30] shrink-0" />
              ),
          },
          {
            value: filteredKpis.spi,
            label: 'SPI',
            tooltip: 'SPI = avance real / avance planeado. Si es menor a 1, el proyecto va atrasado.',
            icon: Activity,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
            trend:
              Number(filteredKpis.spi) >= 1 ? (
                <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#FF3B30] shrink-0" />
              ),
          },
          {
            value: filteredKpis.delayedMilestones,
            label: 'Hitos Retrasados',
            tooltip: 'Tickets retrasados = tickets cuya dueDate ya pasó y no están en DONE ni CANCELLED.',
            icon: AlertTriangle,
            color: 'text-[#FF3B30]',
            bg: 'bg-[#FF3B30]/10',
            trend: <AlertCircle className="w-4 h-4 text-[#FF3B30] shrink-0" />,
          },
          {
            value: filteredKpis.blockedTickets,
            label: 'Tickets Bloqueados',
            tooltip: 'Tickets bloqueados = tickets con status BLOCKED.',
            icon: XCircle,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            trend: <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />,
          },
          {
            value: filteredKpis.risk,
            label: 'Nivel de Riesgo',
            tooltip: 'Nivel de riesgo calculado con SPI, tickets bloqueados y tickets retrasados.',
            icon: Shield,
            color:
              filteredKpis.risk === 'High'
                ? 'text-[#FF3B30]'
                : filteredKpis.risk === 'Medium'
                ? 'text-yellow-500'
                : 'text-green-500',
            bg:
              filteredKpis.risk === 'High'
                ? 'bg-[#FF3B30]/10'
                : filteredKpis.risk === 'Medium'
                ? 'bg-yellow-500/10'
                : 'bg-green-500/10',
            trend: null,
          },
          {
            value: `${filteredKpis.estimatedHours}h`,
            label: 'Horas Estimadas',
            tooltip: 'Horas estimadas = suma de estimatedHours de los tickets visibles según el filtro actual.',
            icon: Clock,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            trend: null,
          },
          {
            value: `${filteredKpis.actualHours}h`,
            label: 'Horas Usadas',
            tooltip: 'Horas usadas = suma de actualHours solo en tickets DONE visibles según el filtro actual.',
            icon: Clock,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            trend: null,
          },
          {
            value: filteredKpis.efficiency ?? 'N/A',
            label: 'Eficiencia',
            tooltip: 'Eficiencia = horas estimadas / horas usadas. Solo aparece si hay actualHours registrados.',
            icon: Activity,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            trend: null,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 sm:p-5 min-h-[130px] flex items-center gap-4 hover:border-white/20 transition-all min-w-0"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                  <p className="text-sm text-[#8E8E93] flex items-center gap-1 min-w-0 truncate">
                    <span className="truncate">{item.label}</span>
                    <KpiTooltip text={item.tooltip} />
                  </p>

                  {item.trend}
                </div>

                <p className="text-3xl sm:text-4xl font-bold text-white leading-none truncate">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  )}
</section>
        {}
        {role !== 'DEVELOPER' && <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FF3B30]" />
                Equipo del Proyecto
              </h2>
              {canManageProject && null}
            </div>
            
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4" style={{
            width: 'max-content'
          }}>
                {}
                {canManageProject && projectTeam.length < 10 && <button onClick={() => setShowAddDeveloperModal(true)} className="bg-[#1C1C1E] border border-dashed border-white/20 rounded-xl p-5 backdrop-blur-xl hover:border-[#FF3B30] hover:bg-[#FF3B30]/5 transition-all group flex flex-col items-center justify-center w-[220px] h-[280px] flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-[#FF3B30]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF3B30]/20 transition-all">
                      <Plus className="w-8 h-8 text-[#FF3B30]" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">Agregar Developer</p>
                    <p className="text-xs text-[#8E8E93] text-center">Expandir el equipo</p>
                  </button>}

                {projectTeam.map(member => <div key={member.id} className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all group w-[220px] flex-shrink-0">
                    {}
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF3B30] to-[#FF6B30] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="text-xl font-bold text-white">{member.avatar}</span>
                      </div>
                      <p className="text-sm font-semibold text-white text-center">{member.name}</p>
                      <p className="text-xs text-[#8E8E93] text-center mt-1">{member.role}</p>
                    </div>

                    {}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      {}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8E8E93]">Tareas</span>
                        <span className="text-xs font-semibold text-white">{member.tasksAssigned}</span>
                      </div>

                      {}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#8E8E93]">Performance</span>
                          <span className="text-xs font-semibold text-white">{member.performance}%</span>
                        </div>
                        <div className="w-full bg-[#0F0F0F] rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${member.performance >= 85 ? 'bg-green-500' : member.performance >= 70 ? 'bg-yellow-500' : 'bg-[#FF3B30]'}`} style={{
                      width: `${member.performance}%`
                    }}></div>
                        </div>
                      </div>

                      {}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8E8E93]">Estado</span>
                        <Badge variant={member.status === 'Active' ? 'default' : 'danger'} className="text-xs">
                          {member.status}
                        </Badge>
                      </div>
                    </div>

                    {}
                    <div className="mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-[#8E8E93] truncate">{member.email}</p>
                    </div>
                  </div>)}
              </div>
            </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{projectTeam.length}</p>
                  <p className="text-xs text-[#8E8E93]">Miembros Totales</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {projectTeam.filter(m => m.status === 'Active').length}
                  </p>
                  <p className="text-xs text-[#8E8E93]">Activos</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <ListTodo className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {projectTeam.reduce((sum, m) => sum + m.tasksAssigned, 0)}
                  </p>
                  <p className="text-xs text-[#8E8E93]">Tareas Asignadas</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
{projectTeam.length > 0
  ? `${Math.round(projectTeam.reduce((sum, m) => sum + m.performance, 0) / projectTeam.length)}%`
  : 'N/A'}                  </p>
                  <p className="text-xs text-[#8E8E93]">Performance Prom.</p>
                </div>
              </div>
            </div>
          </div>
          </section>}

        {}
        <section>
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF3B30]" />
            {'Planned vs Actual'}
          </h2>
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
            <ResponsiveContainer width="100%" height={350}>
<LineChart data={project.progressHistory?.length ? project.progressHistory : []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#8E8E93" tick={{
                fill: '#8E8E93',
                fontSize: 12
              }} />
                <YAxis stroke="#8E8E93" tick={{
                fill: '#8E8E93',
                fontSize: 12
              }} label={{
                value:  'Progreso (%)',
                angle: -90,
                position: 'insideLeft',
                fill: '#8E8E93',
                fontSize: 12
              }} />
                <Tooltip contentStyle={{
                backgroundColor: '#0F0F0F',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#FFFFFF',
                padding: '12px'
              }} labelStyle={{
                color: '#8E8E93',
                marginBottom: '8px'
              }} />
                <Line type="monotone" dataKey="planned" stroke="#8E8E93" strokeWidth={3}name="Planificado"dot={{
                fill: '#8E8E93',
                r: 5
              }} activeDot={{
                r: 7
              }} />
                <Line type="monotone" dataKey="actual" stroke="#007AFF" strokeWidth={3} name='Real' dot={{
                fill: '#007AFF',
                r: 5
              }} activeDot={{
                r: 7
              }} />
                {}
                <Line type="monotone" dataKey={entry => entry.planned - entry.actual} stroke="#FF3B30" strokeWidth={2} strokeDasharray="5 5" name="Desviación" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8E8E93]"></div>
                <span className="text-xs text-[#8E8E93]">{role === 'DEVELOPER' ? 'Horas Planificadas' : 'Planificado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#007AFF]"></div>
                <span className="text-xs text-[#8E8E93]">{role === 'DEVELOPER' ? 'Mis Horas Reales' : 'Real'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#FF3B30]"></div>
                <span className="text-xs text-[#8E8E93]">Desviación</span>
              </div>
            </div>
          </div>
        </section>
        <section className="lg:col-span-2">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
      <ListTodo className="w-5 h-5 text-[#FF3B30]" />
      Gestión Ágil
    </h2>

    {canManageProject && (
      <button
        onClick={() => setShowSprintModal(true)}
        className="px-4 py-2 bg-[#FF3B30] hover:bg-[#FF3B30]/90 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Crear Sprint
      </button>
    )}
  </div>

  <div className="mb-6 bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-xl p-4">
    <div className="flex items-start gap-3">
      <Info className="w-5 h-5 text-[#007AFF] flex-shrink-0 mt-0.5" />

      <div className="flex-1">
        <p className="text-sm text-white font-medium mb-1">
          {sprintFilter === 'active'
            ? `🏃 Sprints activos: ${backlogTickets.length} tickets visibles`
            : sprintFilter === 'history'
            ? `✅ Historial: ${backlogTickets.length} tickets de sprints cerrados`
            : sprintFilter === 'upcoming'
            ? `📅 Próximos sprints: ${backlogTickets.length} tickets planeados`
            : sprintFilter === 'all'
            ? `📊 Todos los sprints: ${backlogTickets.length} tickets en total`
            : `${selectedSprintFromFilter?.status === 'Completed' ? '✅' : selectedSprintFromFilter?.status === 'Upcoming' ? '📅' : '🏃'} ${selectedSprintFromFilter?.name || 'Sprint'}: ${backlogTickets.length} tickets`}
        </p>

        <p className="text-xs text-[#8E8E93]">
          {sprintFilter === 'active'
            ? 'Mostrando tickets de sprints activos.'
            : sprintFilter === 'history'
            ? 'Mostrando tickets históricos de sprints cerrados.'
            : sprintFilter === 'upcoming'
            ? 'Mostrando tickets de sprints planeados.'
            : sprintFilter === 'all'
            ? 'Mostrando todos los tickets.'
            : `Tickets del sprint: ${selectedSprintFromFilter?.duration || 'Sin rango de fechas'}`}
        </p>
      </div>

      {canManageProject &&
        !generalSprintFilters.includes(sprintFilter) &&
        selectedSprintFromFilter?.status === 'Upcoming' && (
          <button
            onClick={() => handleStartSprint(sprintFilter)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0"
          >
            <PlayCircle className="w-4 h-4" />
            Iniciar Sprint
          </button>
        )}

      {canManageProject &&
        !generalSprintFilters.includes(sprintFilter) &&
        selectedSprintFromFilter?.status === 'Active' && (
          <button
            onClick={() => setShowCompleteSprintModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            Concluir Sprint
          </button>
        )}
    </div>
  </div>

  <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
    <div className="flex items-center justify-between p-6 border-b border-white/10">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-white">
          {sprintFilter === 'active'
            ? 'Tickets - Sprints Activos'
            : sprintFilter === 'history'
            ? 'Tickets - Historial'
            : sprintFilter === 'upcoming'
            ? 'Tickets - Próximos Sprints'
            : sprintFilter === 'all'
            ? 'Todos los Tickets'
            : `Tickets - ${selectedSprintFromFilter?.name || 'Sprint'}`}
        </h3>

        <Badge>{parentTicketsOnly.length} tickets</Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-[#0F0F0F] border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setTicketsView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              ticketsView === 'table'
                ? 'bg-[#FF3B30] text-white'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Tabla
          </button>

          <button
            onClick={() => setTicketsView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              ticketsView === 'kanban'
                ? 'bg-[#FF3B30] text-white'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Kanban
          </button>
        </div>

        {role === 'DEVELOPER' && (
          <button
            onClick={() => setShowMyTicketsOnly(!showMyTicketsOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showMyTicketsOnly
                ? 'bg-[#FF3B30] text-white border-[#FF3B30]'
                : 'bg-[#0F0F0F] text-[#8E8E93] border-white/10 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Solo mis tickets
          </button>
        )}

        {canManageProject && (
          <Button
            variant="outline"
            icon={Plus}
            onClick={() => {
              const sprintIdForNewTicket = canCreateTicketInCurrentFilter
                ? sprintFilter
                : activeSprint?.id || '';

              if (!sprintIdForNewTicket) {
                alert('Primero inicia o selecciona un sprint específico para crear tickets.');
                return;
              }

              setTicketData({
                ...ticketData,
                sprintId: sprintIdForNewTicket,
              });

              setShowTicketModal(true);
            }}
            className="text-xs py-1 px-3"
          >
            Crear Ticket
          </Button>
        )}
      </div>
    </div>

    {ticketsView === 'table' && (
      <div className="overflow-y-auto max-h-[600px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-white/10 bg-[#0F0F0F]/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase">Key</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase">Summary</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase">Assignee</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase">Horas Est.</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {parentTicketsOnly.length > 0 ? (
              parentTicketsOnly.map((ticket) => (
<tr
  key={ticket.id}
  onClick={() => setSelectedTicket(ticket)}
  className={`cursor-pointer transition-all ${
    ticket.status === 'Done'
      ? 'bg-green-500/5 opacity-75 hover:bg-green-500/10'
      : 'hover:bg-white/5'
  }`}
>
                  <td className="px-4 py-4 text-sm text-[#8E8E93]">{ticket.id?.slice(0, 8)}</td>
                  <td className="px-4 py-4">
<p
  className={`text-sm font-medium ${
    ticket.status === 'Done'
      ? 'text-green-400 line-through decoration-green-400/70'
      : 'text-white'
  }`}
>
  {ticket.title}
</p>                    <p className="text-xs text-[#8E8E93]">{ticket.description || 'Sin descripción'}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-white">{ticket.assignee || 'Sin asignar'}</td>
                  <td className="px-4 py-4">
                    <Badge className={priorityColors[ticket.priority] || priorityColors.Medium}>
                      {ticket.priority || 'Medium'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge>{ticket.status}</Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-white">
                    {ticket.estimatedHours ?? 'N/A'}h
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#8E8E93]">
                  No hay tickets para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )}

{ticketsView === 'kanban' && (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6">
    {['Backlog', 'In Progress', 'Review', 'Blocked', 'Done'].map((status) => {
      const statusTickets = parentTicketsOnly.filter(
        (ticket) => ticket.status === status
      );

      return (
        <div
          key={status}
          className="bg-[#0F0F0F] border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">{status}</h4>
            <Badge>{statusTickets.length}</Badge>
          </div>

          <div className="space-y-3">
            {statusTickets.length > 0 ? (
              statusTickets.map((ticket) => {
                const isMyTicket =
                  ticket.assignee === user.name ||
                  ticket.assignee?.includes(user.name);

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      ticket.status === 'Done'
                        ? 'bg-green-500/10 border-green-500/30 opacity-80 hover:border-green-400'
                        : isMyTicket
                        ? 'bg-[#FF3B30]/10 border-[#FF3B30]/40 hover:border-[#FF3B30]'
                        : 'bg-[#1C1C1E] border-white/10 hover:border-[#FF3B30]/50'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium mb-2 ${
                        ticket.status === 'Done'
                          ? 'text-green-400 line-through decoration-green-400/70'
                          : isMyTicket
                          ? 'text-[#FF6B60] underline decoration-[#FF3B30]/60 underline-offset-4'
                          : 'text-white'
                      }`}
                    >
                      {ticket.title}
                    </p>

                    <p className="text-xs text-[#8E8E93] mb-3">
                      {ticket.assignee || 'Sin asignar'}
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge className={priorityColors[ticket.priority] || priorityColors.Medium}>
                        {ticket.priority || 'Medium'}
                      </Badge>

                      <span className="text-xs text-[#8E8E93]">
                        {ticket.estimatedHours ?? 'N/A'}h
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#8E8E93] text-center py-4">
                Sin tickets
              </p>
            )}
          </div>
        </div>
      );
    })}
  </div>
)}
  </div>
</section>

        {}
        <section>
          
          
        </section>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {}
  <section>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Trophy className="w-5 h-5 text-[#FF3B30]" />
        Gamificación
      </h2>
    </div>

    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-center min-h-[260px]">
        <div className="text-center max-w-sm">
          <Trophy className="w-10 h-10 text-[#8E8E93] mx-auto mb-4" />

          <p className="text-white font-semibold text-lg mb-2">
            Módulo no disponible
          </p>

          <p className="text-sm text-[#8E8E93] leading-relaxed">
            La gamificación todavía no existe en el backend.
          </p>

          <p className="text-xs text-[#8E8E93] mt-3">
            Cuando se implemente, aquí aparecerán rankings,
            badges, score y puntos reales.
          </p>
        </div>
      </div>
    </div>
  </section>

  {}

</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
 <section>
  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
    <Bell className="w-5 h-5 text-[#FF3B30]" />
    Feed de Actividad
  </h2>

  <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
    <div className="flex items-center justify-center min-h-[260px]">
      <div className="text-center max-w-sm">
        <Bell className="w-10 h-10 text-[#8E8E93] mx-auto mb-4" />

        <p className="text-white font-semibold text-lg mb-2">
          Sin actividad registrada
        </p>

        <p className="text-sm text-[#8E8E93] leading-relaxed">
          El backend todavía no tiene historial de eventos, notificaciones o auditoría.
        </p>

        <p className="text-xs text-[#8E8E93] mt-3">
          Aquí aparecerán cambios de tickets, sprints y movimientos del equipo cuando exista ese módulo.
        </p>
      </div>
    </div>
  </div>
</section>
        </div>
      </div>

      {}
      {showProgressModal && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-6">Registrar Nuevo Avance</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Porcentaje de Avance
                </label>
                <input type="number" min="0" max="100" placeholder="Ej: 75" value={progressData.percentage} onChange={e => setProgressData({
              ...progressData,
              percentage: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nota (opcional)
                </label>
                <textarea rows={3} placeholder="Agrega un comentario sobre este avance..." value={progressData.note} onChange={e => setProgressData({
              ...progressData,
              note: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all resize-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Bloqueador (opcional)
                </label>
                <input type="text" placeholder="¿Hay algo bloqueando el progreso?" value={progressData.blocker} onChange={e => setProgressData({
              ...progressData,
              blocker: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowProgressModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleRegisterProgress} className="flex-1">
                Registrar
              </Button>
            </div>
          </div>
        </div>}

      {}
      {showSprintModal && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#FF3B30]/10 rounded-xl">
                <Calendar className="w-6 h-6 text-[#FF3B30]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Crear Nuevo Sprint</h3>
                <p className="text-xs text-[#8E8E93]">Define la duración y capacidad del sprint</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {}
              {(() => {
            const hasActiveSprint = project.sprints.some(s => s.status === 'Active');
            const activeSprintName = project.sprints.find(s => s.status === 'Active')?.name;
            if (hasActiveSprint) {
              return <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-400 mb-1">
                            Sprint Activo en Curso
                          </p>
                          <p className="text-xs text-orange-300/80">
                            El sprint "{activeSprintName}" está actualmente activo. Si creas un nuevo sprint como "Activo", 
                            se bloqueará la creación. Primero completa el sprint actual o crea el nuevo como "Próximo".
                          </p>
                        </div>
                      </div>
                    </div>;
            }
            return null;
          })()}

              {}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nombre del Sprint *
                </label>
                <input type="text" placeholder="Ej: Sprint 13 - Feature Development" value={sprintData.name} onChange={e => setSprintData({
              ...sprintData,
              name: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>

              {}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Fecha de Inicio *
                  </label>
                  <input type="date" value={sprintData.startDate} onChange={e => setSprintData({
                ...sprintData,
                startDate: e.target.value
              })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Fecha de Fin *
                  </label>
                  <input type="date" value={sprintData.endDate} onChange={e => setSprintData({
                ...sprintData,
                endDate: e.target.value
              })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
                </div>
              </div>

              {}
              {sprintData.startDate && sprintData.endDate && <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400">
                    <strong>Duración:</strong> {Math.ceil((new Date(sprintData.endDate).getTime() - new Date(sprintData.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                  </p>
                </div>}
              
              {}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Capacidad (horas) *
                  </label>
                  <input type="number" placeholder="Ej: 80" value={sprintData.capacity} onChange={e => setSprintData({
                ...sprintData,
                capacity: e.target.value
              })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Estado Inicial
                  </label>
                  <select value={sprintData.status} onChange={e => setSprintData({
                ...sprintData,
                status: e.target.value as 'Upcoming' | 'Active' | 'Completed'
              })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all">
                    <option value="Upcoming">📅 Próximo</option>
                    <option value="Active">🏃 Activo</option>
                    <option value="Completed">✅ Completado</option>
                  </select>
                </div>
              </div>

              {}
              <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                <p className="text-xs text-[#8E8E93] leading-relaxed">
                  <strong className="text-white">💡 Recomendación:</strong> Los sprints típicamente duran 2 semanas (10 días hábiles) con una capacidad de 40-80 horas por desarrollador.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSprintModal(false)} className="flex-1 px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/5 transition-all">
                Cancelar
              </button>
              <button onClick={handleCreateSprint} disabled={!sprintData.name || !sprintData.startDate || !sprintData.endDate || !sprintData.capacity} className="flex-1 px-4 py-3 bg-[#FF3B30] rounded-lg text-white text-sm font-medium hover:bg-[#FF3B30]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Crear Sprint
              </button>
            </div>
          </div>
        </div>}

      {}
      {showTicketModal && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6">Crear Nuevo Ticket</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Título <span className="text-[#FF3B30]">*</span>
                </label>
                <input type="text" placeholder="Ej: Implementar autenticación con JWT" value={ticketData.title} onChange={e => setTicketData({
              ...ticketData,
              title: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>

              {}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Descripción
                </label>
                <textarea rows={3} placeholder="Describe el ticket en detalle..." value={ticketData.description} onChange={e => setTicketData({
              ...ticketData,
              description: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all resize-none" />
              </div>
              
              {}
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-2">
                  Asignado a <span className="text-[#FF3B30]">*</span>
                </label>
                <div className="relative">
                  <button type="button" onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-left text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all flex items-center justify-between">
                    <span className={ticketData.assignee ? 'text-white' : 'text-[#8E8E93]'}>
                      {selectedAssigneeName || 'Seleccionar desarrollador'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
                  </button>
                  
                  {showAssigneeDropdown && <div className="absolute z-10 w-full mt-2 bg-[#0F0F0F] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {assignableDevelopers.map((member: any) => <button key={member.id} type="button" onClick={() => {
setTicketData({
  ...ticketData,
  assignee: member.id
});
 setShowAssigneeDropdown(false);
}} className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0">
                          <div className="w-8 h-8 rounded-full bg-[#FF3B30]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-[#FF3B30] font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{member.name}</p>
                            <p className="text-xs text-[#8E8E93] truncate">{member.role}</p>
                          </div>
                          <div className="text-xs text-[#8E8E93]">
                            {member.tasksAssigned} tareas
                          </div>
                        </button>)}
                      {assignableDevelopers.length === 0 && (
                        <div className="px-4 py-3 text-sm text-[#8E8E93]">
                          No hay developers disponibles en este proyecto.
                        </div>
                      )}
                    </div>}
                </div>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Story Points <span className="text-[#FF3B30]">*</span>
                </label>
                <input type="number" placeholder="Ej: 5" min="1" max="13" value={ticketData.estimation} onChange={e => setTicketData({
              ...ticketData,
              estimation: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>
              
              {}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Horas estimadas
                </label>
                <input type="number" placeholder="Ej: 8" min="0" step="0.5" value={ticketData.estimatedHours} onChange={e => setTicketData({
              ...ticketData,
              estimatedHours: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Fecha de inicio
                </label>
                <input type="date" value={ticketData.startDate} onChange={e => setTicketData({
              ...ticketData,
              startDate: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Fecha límite
                </label>
                <input type="date" value={ticketData.dueDate} min={ticketData.startDate || undefined} onChange={e => setTicketData({
              ...ticketData,
              dueDate: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Prioridad
                </label>
                <select value={ticketData.priority} onChange={e => setTicketData({
              ...ticketData,
              priority: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all">
                  <option value="High">🔴 Alta</option>
                  <option value="Medium">🟡 Media</option>
                  <option value="Low">🟢 Baja</option>
                </select>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Estado Inicial
                </label>
                <select value={ticketData.status} onChange={e => setTicketData({
              ...ticketData,
              status: e.target.value as any
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all">
                  <option value="Backlog">📋 Backlog</option>
                  <option value="In Progress">⚡ In Progress</option>
                  <option value="Review">🔎 Review</option>
                  <option value="Blocked">🚫 Bloqueado</option>
                  <option value="Done">✅ Done</option>
                </select>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Sprint <span className="text-[#FF3B30]">*</span>
                </label>
                <select value={ticketData.sprintId} onChange={e => setTicketData({
              ...ticketData,
              sprintId: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all">
                  <option value="">Seleccionar sprint</option>
                  {project.sprints.filter(sprint => sprint.status !== 'Completed').map(sprint => <option key={sprint.id} value={sprint.id}>
                      {sprint.status === 'Active' && '🏃 '}
                      {sprint.status === 'Completed' && '✅ '}
                      {sprint.status === 'Upcoming' && '📅 '}
                      {sprint.name}
                    </option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => {
            setShowTicketModal(false);
            setShowAssigneeDropdown(false);
          }} className="flex-1">
                Cancelar
              </Button>
              
              <Button variant="primary" onClick={handleCreateTicket} className="flex-1 !bg-[#E31837] hover:!bg-[#C41430] disabled:!bg-[#E31837]/40 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100" disabled={
  !ticketData.title.trim() ||
  !ticketData.assignee ||
  !ticketData.estimation ||
  !ticketData.estimatedHours ||
  !ticketData.startDate ||
  !ticketData.dueDate ||
  !ticketData.sprintId
}>
                Crear Ticket
              </Button>
            </div>
          </div>
        </div>}

      {}
      {showDivideTicketModal && ticketToDivide && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Dividir Ticket en Subtickets</h3>
                <p className="text-sm text-[#8E8E93]">
                  Ticket padre: <span className="text-white font-medium">{ticketToDivide.title}</span>
                </p>
              </div>
              <button onClick={() => {
            setShowDivideTicketModal(false);
            setTicketToDivide(null);
          }} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {}
            <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4 mb-6">
              <p className="text-xs text-[#8E8E93] mb-3">Información del ticket original:</p>
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-[#8E8E93]">Story Points:</p>
                  <p className="text-white font-semibold">{ticketToDivide.estimation}h</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Asignado a:</p>
                  <p className="text-white font-semibold">{ticketToDivide.assignee}</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Prioridad:</p>
                  <Badge variant={ticketToDivide.priority === 'High' ? 'danger' : ticketToDivide.priority === 'Medium' ? 'warning' : 'default'}>
                    {ticketToDivide.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Estado:</p>
                  <p className="text-white font-semibold">{ticketToDivide.status}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-yellow-400">
                  ⚠️ Al dividir: Los story points se redistribuyen a los subtickets. El ticket padre se convierte en contenedor.
                </p>
              </div>
            </div>

            {}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Subtickets ({subTicketsData.length})</p>
                <Button variant="secondary" icon={Plus} onClick={addSubTicketField} className="text-xs">
                  Agregar Subticket
                </Button>
              </div>

              {subTicketsData.map((subTicket, index) => <div key={index} className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white">Subticket #{index + 1}</p>
                    {subTicketsData.length > 1 && <button onClick={() => removeSubTicketField(index)} className="p-1 hover:bg-white/10 rounded transition-colors" title="Eliminar subticket">
                        <X className="w-4 h-4 text-[#FF3B30]" />
                      </button>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white mb-1">
                        Título <span className="text-[#FF3B30]">*</span>
                      </label>
                      <input type="text" placeholder="Ej: Configurar Stripe API" value={subTicket.title} onChange={e => {
                  const updated = [...subTicketsData];
                  updated[index].title = e.target.value;
                  setSubTicketsData(updated);
                }} className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-lg text-white text-sm placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
                    </div>

                    {}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white mb-1">
                        Descripción
                      </label>
                      <textarea rows={2} placeholder="Describe este subticket..." value={subTicket.description} onChange={e => {
                  const updated = [...subTicketsData];
                  updated[index].description = e.target.value;
                  setSubTicketsData(updated);
                }} className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-lg text-white text-sm placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all resize-none" />
                    </div>

                    {}
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Asignado a <span className="text-[#FF3B30]">*</span>
                      </label>
         <select
  value={subTicket.assignee}
  onChange={(e) => {
    const updated = [...subTicketsData];
    updated[index].assignee = e.target.value;
    setSubTicketsData(updated);
  }}
  className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-lg text-white text-sm focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all"
>
  <option value="">Sin asignar</option>

  {project.members?.map((member) => (
    <option key={member.id} value={member.id}>
      {member.fullName}
    </option>
  ))}
</select>
                    </div>

                    {}
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Story Points <span className="text-[#FF3B30]">*</span>
                      </label>
                      <input type="number" placeholder="Ej: 3" min="1" max="13" value={subTicket.estimation} onChange={e => {
                  const updated = [...subTicketsData];
                  updated[index].estimation = e.target.value;
                  setSubTicketsData(updated);
                }} className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-lg text-white text-sm placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
                    </div>

                    {}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white mb-1">
                        Prioridad
                      </label>
                      <select value={subTicket.priority} onChange={e => {
                  const updated = [...subTicketsData];
                  updated[index].priority = e.target.value;
                  setSubTicketsData(updated);
                }} className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-lg text-white text-sm focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all">
                        <option value="High">🔴 Alta</option>
                        <option value="Medium">🟡 Media</option>
                        <option value="Low">🟢 Baja</option>
                      </select>
                    </div>
                  </div>
                </div>)}
            </div>

            {}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-400 mb-1">Total Story Points</p>
                  <p className="text-2xl font-bold text-white">
                    {subTicketsData.reduce((sum, st) => sum + (parseInt(st.estimation) || 0), 0)}h
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8E8E93]">Original: {ticketToDivide.estimation}h</p>
                  {subTicketsData.reduce((sum, st) => sum + (parseInt(st.estimation) || 0), 0) !== ticketToDivide.estimation && <p className="text-xs text-yellow-400 mt-1">
                      ⚠️ Total diferente al original
                    </p>}
                </div>
              </div>
            </div>

            {}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
            setShowDivideTicketModal(false);
            setTicketToDivide(null);
          }} className="flex-1">
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleConfirmDivision} className="flex-1 !bg-[#E31837] hover:!bg-[#C41430] transform hover:scale-[1.02]">
                <GitBranch className="w-4 h-4 mr-2" />
                Dividir Ticket
              </Button>
            </div>
          </div>
        </div>}

      {}
      {showScenarioPanel && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-xl bg-[#1C1C1E] border-l border-white/10 h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Simulación de Escenarios</h3>
                <button onClick={() => setShowScenarioPanel(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-6">
                {}
                <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#FF3B30]" />
                    Ajustar Variables
                  </p>
                  
                  <div className="space-y-5">
                    {}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#8E8E93]">Developers Asignados</span>
                        <span className="text-sm font-medium text-white">{projectTeam.length}</span>
                      </div>
                      <input type="range" min="3" max="15" defaultValue={projectTeam.length} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF3B30]" />
                      <div className="flex justify-between text-[10px] text-[#8E8E93] mt-1">
                        <span>3</span>
                        <span>15</span>
                      </div>
                    </div>

                    {}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#8E8E93]">Horas/día por Developer</span>
                        <span className="text-sm font-medium text-white">6h</span>
                      </div>
                      <input type="range" min="4" max="10" defaultValue="6" className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF3B30]" />
                      <div className="flex justify-between text-[10px] text-[#8E8E93] mt-1">
                        <span>4h</span>
                        <span>10h</span>
                      </div>
                    </div>

                    {}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#8E8E93]">Nivel de Priorización</span>
                        <span className="text-sm font-medium text-white">Alto</span>
                      </div>
                      <input type="range" min="1" max="3" defaultValue="3" className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF3B30]" />
                      <div className="flex justify-between text-[10px] text-[#8E8E93] mt-1">
                        <span>Bajo</span>
                        <span>Medio</span>
                        <span>Alto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-white">📊 Escenario Base (Actual)</p>
                    <Badge variant="default">Actual</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#1C1C1E] rounded-lg p-3">
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">Duración</p>
                      <p className="text-lg font-semibold text-white">45 días</p>
                    </div>
                    <div className="bg-[#1C1C1E] rounded-lg p-3">
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">Costo</p>
                      <p className="text-lg font-semibold text-white">$125K</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8E93]">Story Points Restantes</span>
                      <span className="text-white font-medium">87 pts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8E93]">Velocidad Promedio</span>
                      <span className="text-white font-medium">12 pts/sprint</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8E93]">Riesgo</span>
<Badge
  className={`text-xs border ${
    !project.risk
      ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      : project.risk === 'HIGH' || project.risk === 'CRITICAL'
      ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20'
      : project.risk === 'MEDIUM'
      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      : 'bg-green-500/10 text-green-500 border-green-500/20'
  }`}
>
  {project.risk || 'N/A'}
</Badge>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-[#0F0F0F] border border-green-500/30 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <p className="text-sm font-semibold text-white">🚀 Escenario Optimista</p>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30">+20% recursos</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                    <div className="bg-[#1C1C1E] rounded-lg p-3">
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">Duración</p>
                      <p className="text-lg font-semibold text-green-400">32 días</p>
                      <p className="text-[10px] text-green-400 mt-1">↓ 13 días</p>
                    </div>
                    <div className="bg-[#1C1C1E] rounded-lg p-3">
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">Costo</p>
                      <p className="text-lg font-semibold text-yellow-400">$145K</p>
                      <p className="text-[10px] text-yellow-400 mt-1">↑ $20K</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs relative z-10 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8E93]">Velocidad Proyectada</span>
                      <span className="text-green-400 font-medium">18 pts/sprint</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8E93]">Riesgo Proyectado</span>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Low</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8E93]">ROI Estimado</span>
                      <span className="text-green-400 font-medium">+15%</span>
                    </div>
                  </div>

                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 relative z-10">
                    <p className="text-xs text-green-400">
                      ✓ Mayor velocidad de entrega
                      <br />✓ Reducción significativa de tiempo
                      <br />✓ Menor riesgo de bloqueadores
                    </p>
                  </div>
                </div>

                {}
                <div className="bg-[#0F0F0F] border border-[#FF3B30]/30 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B30]/5 rounded-full blur-3xl"></div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <p className="text-sm font-semibold text-white">⚠️ Escenario Pesimista</p>
                    <Badge variant="danger">Sin cambios</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                    <div className="bg-[#1C1C1E] rounded-lg p-3">
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">Duración</p>
                      <p className="text-lg font-semibold text-[#FF3B30]">60 días</p>
                      <p className="text-[10px] text-[#FF3B30] mt-1">↑ 15 días</p>
                    </div>
                    <div className="bg-[#1C1C1E] rounded-lg p-3">
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">Costo</p>
                      <p className="text-lg font-semibold text-[#FF3B30]">$175K</p>
                      <p className="text-[10px] text-[#FF3B30] mt-1">↑ $50K</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs relative z-10 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8E93]">Velocidad Proyectada</span>
                      <span className="text-[#FF3B30] font-medium">8 pts/sprint</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8E93]">Riesgo Proyectado</span>
                      <Badge variant="danger">High</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8E93]">Probabilidad Retraso</span>
                      <span className="text-[#FF3B30] font-medium">75%</span>
                    </div>
                  </div>

                  <div className="bg-[#FF3B30]/5 border border-[#FF3B30]/20 rounded-lg p-3 relative z-10">
                    <p className="text-xs text-[#FF3B30]">
                      × Aumento de bloqueadores
                      <br />× Sobrecarga del equipo
                      <br />× Posibles retrasos en entrega
                    </p>
                  </div>
                </div>

                {}
                <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#FF3B30]" />
                    Comparación de Escenarios
                  </p>
                  
                  <div className="space-y-4">
                    {}
                    <div>
                      <p className="text-xs text-[#8E8E93] mb-2">Duración (días)</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white">Base</span>
                            <span className="text-xs text-white">45</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{
                          width: '75%'
                        }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white">Optimista</span>
                            <span className="text-xs text-green-400">32</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{
                          width: '53%'
                        }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white">Pesimista</span>
                            <span className="text-xs text-[#FF3B30]">60</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-[#FF3B30] h-2 rounded-full" style={{
                          width: '100%'
                        }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {}
                    <div>
                      <p className="text-xs text-[#8E8E93] mb-2">Costo Proyectado ($K)</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white">Base</span>
                            <span className="text-xs text-white">$125K</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{
                          width: '71%'
                        }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white">Optimista</span>
                            <span className="text-xs text-yellow-400">$145K</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{
                          width: '83%'
                        }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white">Pesimista</span>
                            <span className="text-xs text-[#FF3B30]">$175K</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-[#FF3B30] h-2 rounded-full" style={{
                          width: '100%'
                        }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-gradient-to-br from-[#FF3B30]/10 to-transparent border border-[#FF3B30]/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FF3B30]/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-[#FF3B30]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-2">Recomendación IA</p>
                      <p className="text-xs text-[#8E8E93] leading-relaxed mb-3">
                        Basado en el análisis de métricas, se recomienda el <span className="text-green-400 font-medium">escenario optimista</span>. 
                        Aumentar el equipo en 2-3 developers puede reducir la duración en 29% con un incremento de costo de solo 16%, 
                        mejorando significativamente el ROI del proyecto.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Confianza: 87%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" icon={RefreshCw} className="w-full col-span-2">
                    Recalcular
                  </Button>
                  
                </div>

                {}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] text-[#8E8E93] text-center">
                    Las simulaciones se basan en datos históricos y algoritmos de ML.
                    <br />
                    Última actualización: Hace 2 minutos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>}

      {}
      {showRecoveryPanel && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-[#1C1C1E] border-l border-white/10 h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-[#FF3B30]" />
                    Plan de Recuperación del Proyecto
                  </h3>
                  <p className="text-xs text-[#8E8E93] mt-1">Generado automáticamente por IA • Hace 3 minutos</p>
                </div>
                <button onClick={() => setShowRecoveryPanel(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-6">
                {}
                <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FF3B30]/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-[#FF3B30]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-2">Problema Detectado</p>
                      <p className="text-xs text-[#8E8E93] leading-relaxed">
                        El proyecto presenta un <span className="text-[#FF3B30] font-medium">retraso del 18%</span> respecto al timeline original. 
                        La velocidad actual del equipo es de <span className="text-[#FF3B30] font-medium">8 pts/sprint</span>, inferior a la velocidad 
                        necesaria de <span className="text-white font-medium">12 pts/sprint</span> para cumplir el deadline.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0F0F0F]/50 rounded-lg p-3 border border-[#FF3B30]/20">
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">Retraso</p>
                      <p className="text-lg font-semibold text-[#FF3B30]">8 días</p>
                    </div>
                    <div className="bg-[#0F0F0F]/50 rounded-lg p-3 border border-[#FF3B30]/20">
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">Story Points</p>
                      <p className="text-lg font-semibold text-[#FF3B30]">87 pts</p>
                    </div>
                    <div className="bg-[#0F0F0F]/50 rounded-lg p-3 border border-[#FF3B30]/20">
                      <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">Sprints Rest.</p>
                      <p className="text-lg font-semibold text-[#FF3B30]">11</p>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#FF3B30]" />
                    Factores de Riesgo Identificados
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-[#1C1C1E] rounded-lg border border-[#FF3B30]/20">
                      <div className="w-2 h-2 rounded-full bg-[#FF3B30] mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium mb-1">Baja velocidad del equipo</p>
                        <p className="text-xs text-[#8E8E93]">33% por debajo del promedio histórico del proyecto</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="danger" className="text-[10px]">Alto Impacto</Badge>
                          <span className="text-[10px] text-[#8E8E93]">Afecta: Timeline, Entregables</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[#1C1C1E] rounded-lg border border-yellow-500/20">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium mb-1">Sobrecarga del líder técnico</p>
                        <p className="text-xs text-[#8E8E93]">Sarah Chen tiene 15 tickets asignados (promedio equipo: 6 tickets)</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px]">Medio Impacto</Badge>
                          <span className="text-[10px] text-[#8E8E93]">Afecta: Code Review, Bloqueadores</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[#1C1C1E] rounded-lg border border-yellow-500/20">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium mb-1">Tickets de alta prioridad bloqueados</p>
                        <p className="text-xs text-[#8E8E93]">3 tickets críticos esperando por dependencias externas</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px]">Medio Impacto</Badge>
                          <span className="text-[10px] text-[#8E8E93]">Afecta: Camino crítico</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-[#0F0F0F] border border-green-500/30 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    Acciones Recomendadas (Priorizadas)
                  </p>
                  
                  <div className="space-y-3">
                    {}
                    <div className="bg-[#1C1C1E] border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-green-400">1</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Incorporar 2 developers adicionales</p>
                            <p className="text-xs text-green-400 mt-0.5">Acción Crítica • Implementación inmediata</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">+45% velocidad</Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs text-[#8E8E93] mb-3">
                        <p>• Aumenta velocidad estimada a 14 pts/sprint</p>
                        <p>• Reduce el retraso proyectado de 8 a 3 días</p>
                        <p>• Costo adicional: $18K (dentro del buffer del 15%)</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#0F0F0F] rounded-lg p-2 border border-white/5">
                          <p className="text-[10px] text-[#8E8E93]">Impacto Timeline</p>
                          <p className="text-sm font-medium text-green-400">-5 días</p>
                        </div>
                        <div className="bg-[#0F0F0F] rounded-lg p-2 border border-white/5">
                          <p className="text-[10px] text-[#8E8E93]">ROI</p>
                          <p className="text-sm font-medium text-green-400">+28%</p>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-green-400">2</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Redistribuir carga de Sarah Chen</p>
                            <p className="text-xs text-green-400 mt-0.5">Alta Prioridad • Esta semana</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">+20% velocidad</Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs text-[#8E8E93] mb-3">
                        <p>• Reasignar 7 tickets de baja prioridad a Mike Johnson y Alex Wong</p>
                        <p>• Libera tiempo para code reviews y mentoría</p>
                        <p>• Reduce bloqueadores del equipo en ~40%</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#0F0F0F] rounded-lg p-2 border border-white/5">
                          <p className="text-[10px] text-[#8E8E93]">Tickets Reasignados</p>
                          <p className="text-sm font-medium text-white">7</p>
                        </div>
                        <div className="bg-[#0F0F0F] rounded-lg p-2 border border-white/5">
                          <p className="text-[10px] text-[#8E8E93]">Tiempo Liberado</p>
                          <p className="text-sm font-medium text-white">15h/sem</p>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-400">3</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Escalar dependencias bloqueadas</p>
                            <p className="text-xs text-blue-400 mt-0.5">Media Prioridad • Próximos 3 días</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">+10% velocidad</Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs text-[#8E8E93] mb-3">
                        <p>• Coordinar con equipos de Infrastructure y DevOps</p>
                        <p>• Desbloquear tickets: TSK-234, TSK-267, TSK-289</p>
                        <p>• Definir workarounds temporales si es necesario</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#0F0F0F] rounded-lg p-2 border border-white/5">
                          <p className="text-[10px] text-[#8E8E93]">Tickets Desbloqueados</p>
                          <p className="text-sm font-medium text-white">3</p>
                        </div>
                        <div className="bg-[#0F0F0F] rounded-lg p-2 border border-white/5">
                          <p className="text-[10px] text-[#8E8E93]">Story Points</p>
                          <p className="text-sm font-medium text-white">21 pts</p>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-400">4</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Optimizar duración de sprints</p>
                            <p className="text-xs text-blue-400 mt-0.5">Media Prioridad • Próximo sprint</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">+8% eficiencia</Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs text-[#8E8E93] mb-3">
                        <p>• Reducir sprints de 14 a 10 días (iteraciones más ágiles)</p>
                        <p>• Mantener ceremonias más cortas y enfocadas</p>
                        <p>• Mejorar feedback loop y detección temprana de problemas</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#0F0F0F] rounded-lg p-2 border border-white/5">
                          <p className="text-[10px] text-[#8E8E93]">Duración Sprint</p>
                          <p className="text-sm font-medium text-white">10 días</p>
                        </div>
                        <div className="bg-[#0F0F0F] rounded-lg p-2 border border-white/5">
                          <p className="text-[10px] text-[#8E8E93]">Feedback Loop</p>
                          <p className="text-sm font-medium text-white">-30%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF3B30]" />
                    Timeline de Implementación
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 border-4 border-green-500/20"></div>
                        <div className="w-0.5 h-full bg-green-500/20 mt-1"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-white">Semana 1 (Inmediato)</p>
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px]">En curso</Badge>
                        </div>
                        <p className="text-xs text-[#8E8E93] mb-2">• Contratar 2 developers adicionales</p>
                        <p className="text-xs text-[#8E8E93]">• Redistribuir carga de trabajo de Sarah</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 border-4 border-blue-500/20"></div>
                        <div className="w-0.5 h-full bg-blue-500/20 mt-1"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-white">Semana 2-3</p>
                          <Badge variant="default" className="text-[10px]">Planificado</Badge>
                        </div>
                        <p className="text-xs text-[#8E8E93] mb-2">• Escalar y resolver dependencias bloqueadas</p>
                        <p className="text-xs text-[#8E8E93]">• Onboarding de nuevos developers</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 border-4 border-purple-500/20"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-white">Semana 4+</p>
                          <Badge variant="default" className="text-[10px]">Futuro</Badge>
                        </div>
                        <p className="text-xs text-[#8E8E93] mb-2">• Implementar sprints optimizados de 10 días</p>
                        <p className="text-xs text-[#8E8E93]">• Monitorear métricas y ajustar plan</p>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Impacto Esperado del Plan
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#0F0F0F]/50 rounded-lg p-4 border border-green-500/20">
                      <p className="text-xs text-[#8E8E93] mb-2">Velocidad Nueva</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-green-400">16</p>
                        <p className="text-sm text-[#8E8E93]">pts/sprint</p>
                      </div>
                      <p className="text-[10px] text-green-400 mt-1">↑ 100% vs actual</p>
                    </div>
                    
                    <div className="bg-[#0F0F0F]/50 rounded-lg p-4 border border-green-500/20">
                      <p className="text-xs text-[#8E8E93] mb-2">Reducción Retraso</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-green-400">5</p>
                        <p className="text-sm text-[#8E8E93]">días</p>
                      </div>
                      <p className="text-[10px] text-green-400 mt-1">De 8 a 3 días</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#0F0F0F]/50 rounded-lg">
                      <span className="text-xs text-[#8E8E93]">Probabilidad de cumplir deadline</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{
                        width: '85%'
                      }}></div>
                        </div>
                        <span className="text-sm font-medium text-green-400">85%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0F0F0F]/50 rounded-lg">
                      <span className="text-xs text-[#8E8E93]">Nivel de riesgo proyectado</span>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Low</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0F0F0F]/50 rounded-lg">
                      <span className="text-xs text-[#8E8E93]">Inversión adicional requerida</span>
                      <span className="text-sm font-medium text-yellow-400">$18,000</span>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#FF3B30]" />
                    Análisis de Costo vs Beneficio
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#8E8E93]">Costo de no actuar (penalización por retraso)</span>
                        <span className="text-sm font-medium text-[#FF3B30]">$45,000</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div className="bg-[#FF3B30] h-2 rounded-full" style={{
                      width: '100%'
                    }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#8E8E93]">Costo del plan de recuperación</span>
                        <span className="text-sm font-medium text-yellow-400">$18,000</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{
                      width: '40%'
                    }}></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">Ahorro neto proyectado</span>
                        <span className="text-lg font-bold text-green-400">$27,000</span>
                      </div>
                      <p className="text-[10px] text-[#8E8E93] mt-1">ROI del plan: 150% • Recuperación en 2 sprints</p>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-gradient-to-br from-[#FF3B30]/10 to-transparent border border-[#FF3B30]/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FF3B30]/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-[#FF3B30]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-2">Recomendación Final de la IA</p>
                      <p className="text-xs text-[#8E8E93] leading-relaxed mb-4">
                        Se recomienda <span className="text-green-400 font-medium">implementar el plan completo de recuperación</span>. 
                        El análisis de 127 proyectos similares muestra que esta combinación de acciones tiene una tasa de éxito del 89% 
                        en recuperar proyectos con retrasos del 15-20%. La ventana óptima de implementación es en las próximas 48 horas 
                        para maximizar el impacto.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 font-medium">Confianza: 91%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                          <Clock className="w-3 h-3" />
                          <span>Basado en 127 proyectos similares</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="grid grid-cols-2 gap-3">
                  
                  
                </div>

                {}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-center gap-2 text-[10px] text-[#8E8E93]">
                    <Shield className="w-3 h-3" />
                    <span>Plan generado con IA • Actualización continua cada 24h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>}

      {}
{showAddDeveloperModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
    <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Agregar Developer</h3>
        <button
          onClick={() => {
            setShowAddDeveloperModal(false);
            setSelectedDeveloperId("");
          }}
          className="text-[#8E8E93] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Developer
          </label>

          <select
            value={selectedDeveloperId}
            onChange={(e) => setSelectedDeveloperId(e.target.value)}
            className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-xl text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all"
          >
            <option value="">
              {loadingDevelopers ? "Cargando developers..." : "Seleccionar developer"}
            </option>

            {availableDevelopers.map((developer) => (
              <option key={developer.id} value={developer.id}>
                {developer.fullName} — {developer.email}
              </option>
            ))}
          </select>

          {!loadingDevelopers && availableDevelopers.length === 0 && (
            <p className="text-sm text-[#8E8E93] mt-2">
              No hay developers disponibles para agregar.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={() => {
            setShowAddDeveloperModal(false);
            setSelectedDeveloperId("");
          }}
          className="flex-1 px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-xl text-white hover:bg-white/5 transition-all"
        >
          Cancelar
        </button>

        <button
          onClick={handleAddDeveloper}
          disabled={!selectedDeveloperId}
          className="flex-1 px-4 py-3 bg-[#FF3B30] hover:bg-[#FF3B30]/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all"
        >
          Agregar
        </button>
      </div>
    </div>
  </div>
)}

      {}
      {selectedTicket &&<TicketDetailModal
  ticket={selectedTicket}
  projectName={project.name}
  onClose={() => setSelectedTicket(null)}
  onUpdate={(updates) =>
    handleTicketUpdate(selectedTicket.id, updates)
  }
  canEdit={canEditTickets}
  userRole={role}
  onDivideTicket={handleDivideTicket}
/>}

      {}
      {showCompleteSprintModal && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">Concluir Sprint</h3>
                <p className="text-sm text-[#8E8E93]">
                  ¿Estás seguro que deseas concluir el sprint{' '}
                  <span className="text-white font-medium">
                    "{selectedSprintFromFilter?.name || 'Sprint seleccionado'}"
                  </span>?
                </p>
              </div>
            </div>
            
            {}
            <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">Resumen del Sprint</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {backlogTickets.filter(t => t.status === 'Done').length}/{backlogTickets.length}
                  </p>
                  <p className="text-xs text-[#8E8E93]">Tickets Completados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {backlogTickets.filter(t => t.status === 'Done').reduce((sum, t) => sum + t.estimation, 0)}/{backlogTickets.reduce((sum, t) => sum + t.estimation, 0)}
                  </p>
                  <p className="text-xs text-[#8E8E93]">Story Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    {backlogTickets.length > 0 ? Math.round(backlogTickets.filter(t => t.status === 'Done').length / backlogTickets.length * 100) : 0}%
                  </p>
                  <p className="text-xs text-[#8E8E93]">Tasa de Completitud</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FF3B30]">
                    {backlogTickets.filter(t => t.status !== 'Done').length}
                  </p>
                  <p className="text-xs text-[#8E8E93]">Tickets Pendientes</p>
                </div>
              </div>
            </div>

            {backlogTickets.filter(t => t.status !== 'Done').length > 0 && <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-400">
                    <strong>Atención:</strong> Hay {backlogTickets.filter(t => t.status !== 'Done').length} ticket(s) sin completar. 
                    Estos quedarán registrados en el análisis retrospectivo del sprint.
                  </p>
                </div>
              </div>}

            <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-[#8E8E93]">El sprint se marcará como <span className="text-green-500 font-medium">Completado</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart className="w-4 h-4 text-[#8E8E93]" />
                <span className="text-[#8E8E93]">Las métricas se guardarán para análisis histórico</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-[#8E8E93]" />
                <span className="text-[#8E8E93]">La velocidad del equipo se actualizará automáticamente</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCompleteSprintModal(false)} className="flex-1 px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/5 transition-all">
                Cancelar
              </button>
              <button onClick={handleCompleteSprint} className="flex-1 px-4 py-3 bg-green-500 rounded-lg text-white text-sm font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Concluir Sprint
              </button>
            </div>
          </div>
        </div>}

      {}
      {showCloseProjectModal && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-[#FF3B30]/10 rounded-xl">
                <Archive className="w-6 h-6 text-[#FF3B30]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">Cerrar y Archivar Proyecto</h3>
                <p className="text-sm text-[#8E8E93]">
                  ¿Estás seguro que deseas cerrar el proyecto <span className="text-white font-medium">"{project.name}"</span>?
                </p>
              </div>
            </div>
            
            <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-[#8E8E93]" />
                <span className="text-[#8E8E93]">El proyecto se moverá al <span className="text-white font-medium">Archivo</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-[#8E8E93]">Se mantendrá acceso completo a todos los datos históricos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-[#8E8E93]" />
                <span className="text-[#8E8E93]">Todos los miembros del equipo serán notificados</span>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <p className="text-xs text-yellow-400">
                <strong>Nota:</strong> Esta acción es permanente. El proyecto solo puede ser accedido desde el Archivo de Proyectos.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCloseProjectModal(false)} className="flex-1 px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/5 transition-all">
                Cancelar
              </button>
              <button onClick={handleCloseProject} className="flex-1 px-4 py-3 bg-[#FF3B30] rounded-lg text-white text-sm font-medium hover:bg-[#FF3B30]/90 transition-all flex items-center justify-center gap-2">
                <Archive className="w-4 h-4" />
                Archivar Proyecto
              </button>
            </div>
          </div>
        </div>}
    </div>;
}