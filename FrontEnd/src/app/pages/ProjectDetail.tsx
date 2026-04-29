import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, AlertCircle, Target, Users, Clock, CheckCircle2, XCircle, FileText, Zap, Trophy, Award, Plus, X, ArrowRight, Activity, BarChart3, MessageSquare, Settings, ChevronDown, ChevronUp, GripVertical, Shield, ListTodo, Bell, Sparkles, PlayCircle, Edit3, Link2, Info, Table, LayoutGrid, UserPlus, Star, Rocket, Flame, Code, GitBranch, Percent, RefreshCw, Archive, Lock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Header } from '../components/Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { projects, globalGamification, globalNotifications, type GlobalNotification, developerMetrics } from '../data/mockData';
import type { Ticket } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { TicketDetailModal } from '../components/TicketDetailModal';
import { authFetch } from '../../services/api';

const mapBackendSprintToUi = (sprint: any) => ({
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
  capacity: sprint.capacity
});

const mapBackendTicketToUi = (ticket: any) => ({
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
  endDate: ticket.completedAt || null
});

interface BackendProject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  targetEndDate: string;
  actualEndDate: string | null;
  budget: number | null;
  createdAt: string;
  updatedAt: string;
  pm: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
  createdBy: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  members: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  }>;
  stats: {
    membersCount: number;
    sprintsCount: number;
    ticketsCount: number;
  };
}

const formatBackendStatus = (status?: BackendProject['status']) => {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'ON_HOLD':
      return 'On Hold';
    case 'COMPLETED':
      return 'Completed';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return 'N/A';
  }
};

const formatBackendRisk = (risk?: BackendProject['riskLevel']) => {
  switch (risk) {
    case 'LOW':
      return 'Low';
    case 'MEDIUM':
      return 'Medium';
    case 'HIGH':
      return 'High';
    case 'CRITICAL':
      return 'High';
    default:
      return 'N/A';
  }
};

const formatDateLabel = (value?: string | null) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatMoneyLabel = (value?: number | null) => {
  if (value === null || value === undefined) return 'N/A';

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(value);
};

const safeText = (value?: string | null) => {
  if (!value || !String(value).trim()) return 'N/A';
  return value;
};
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



const mockProject = projects.find(p => p.id === id) || projects[0];
const backendProject = backendProjects.find(p => p.id === id) || null;

const project = useMemo(() => {
  const mapTeamFromMembers = (members?: BackendProject['members']) => {
    if (!members || members.length === 0) return [];

    return members.map((m) => ({
      id: m.id,
      name: m.fullName || 'N/A',
      role: m.role || 'N/A',
      email: m.email || 'N/A',
      avatar:
        m.fullName
          ?.split(' ')
          .filter(Boolean)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'NA',
      tasksAssigned: 0,
      performance: 0,
      status: 'N/A',
    }));
  };

  if (!mockProject && !backendProject) return null;

  if (!mockProject && backendProject) {
    return {
      id: backendProject.id,
      name: safeText(backendProject.name),
      code: safeText(backendProject.code),
      description: safeText(backendProject.description),

      status: formatBackendStatus(backendProject.status),
      risk: formatBackendRisk(backendProject.riskLevel),

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
            name: 'N/A',
            email: 'N/A',
            role: 'N/A',
          },

      createdBy: backendProject.createdBy
        ? {
            name: backendProject.createdBy.fullName,
            email: backendProject.createdBy.email,
            role: backendProject.createdBy.role,
          }
        : {
            name: 'N/A',
            email: 'N/A',
            role: 'N/A',
          },

      pmName: backendProject.pm?.fullName || 'N/A',
      pmEmail: backendProject.pm?.email || 'N/A',
      createdByName: backendProject.createdBy?.fullName || 'N/A',
      createdByEmail: backendProject.createdBy?.email || 'N/A',

      members: backendProject.members ?? [],
      developers: (backendProject.members ?? []).map((m) => ({
        name: m.fullName,
        role: m.role,
        email: m.email,
        avatar: m.avatarUrl,
        completedTickets: 'N/A',
        velocity: 'N/A',
        workload: 'N/A',
      })),

      team: mapTeamFromMembers(backendProject.members),
      teamMembersLabel: backendProject.members.length
        ? backendProject.members.map((m) => m.fullName).join(', ')
        : 'N/A',
      teamSize: backendProject.stats?.membersCount ?? 0,

      stats: backendProject.stats ?? {
        membersCount: 0,
        sprintsCount: 0,
        ticketsCount: 0,
      },

      sprintsCountLabel: backendProject.stats?.sprintsCount ?? 'N/A',
      ticketsCountLabel: backendProject.stats?.ticketsCount ?? 'N/A',

      progress: 0,
      progressLabel: 'N/A',
      scheduleVariance: 0,
      spi: 0,
      delayedMilestones: 'N/A',
      blockedTickets: 'N/A',
      teamVelocity: 'N/A',
      openRisks: 'N/A',

sprints: realSprints.map(mapBackendSprintToUi),
tickets: realTickets.map(mapBackendTicketToUi),
      notifications: [],
      progressHistory: [{ date: 'Real', planned: 0, actual: 0 }],

      closedDate: backendProject.actualEndDate
        ? new Date(backendProject.actualEndDate).toISOString().split('T')[0]
        : 'N/A',
      closedBy: 'N/A',
    };
  }

  return {
    ...mockProject,

    id: backendProject?.id ?? mockProject.id,
    name: backendProject?.name ?? mockProject.name,
    code: safeText(backendProject?.code),
    description: safeText(backendProject?.description),

    status: formatBackendStatus(backendProject?.status),
    risk: formatBackendRisk(backendProject?.riskLevel),

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
          name: 'N/A',
          email: 'N/A',
          role: 'N/A',
        },

    createdBy: backendProject?.createdBy
      ? {
          name: backendProject.createdBy.fullName,
          email: backendProject.createdBy.email,
          role: backendProject.createdBy.role,
        }
      : {
          name: 'N/A',
          email: 'N/A',
          role: 'N/A',
        },

    pmName: backendProject?.pm?.fullName || 'N/A',
    pmEmail: backendProject?.pm?.email || 'N/A',
    createdByName: backendProject?.createdBy?.fullName || 'N/A',
    createdByEmail: backendProject?.createdBy?.email || 'N/A',

    members: backendProject?.members ?? [],
    developers: backendProject?.members?.length
      ? backendProject.members.map((m) => ({
          name: m.fullName,
          role: m.role,
          email: m.email,
          avatar: m.avatarUrl,
          completedTickets: 'N/A',
          velocity: 'N/A',
          workload: 'N/A',
        }))
      : [],

    team: backendProject?.members?.length
      ? mapTeamFromMembers(backendProject.members)
      : Array.isArray(mockProject.team)
      ? mockProject.team
      : [],

    teamMembersLabel: backendProject?.members?.length
      ? backendProject.members.map((m) => m.fullName).join(', ')
      : 'N/A',

    teamSize: backendProject?.stats?.membersCount ?? mockProject.team?.length ?? 0,

    stats: backendProject?.stats ?? {
      membersCount: mockProject.team?.length ?? 0,
      sprintsCount: 0,
      ticketsCount: 0,
    },

    sprintsCountLabel: backendProject?.stats?.sprintsCount ?? 'N/A',
    ticketsCountLabel: backendProject?.stats?.ticketsCount ?? 'N/A',

    progress: 0,
    progressLabel: 'N/A',
    scheduleVariance: 0,
    spi: 0,
    delayedMilestones: 'N/A',
    blockedTickets: 'N/A',
    teamVelocity: 'N/A',
    openRisks: 'N/A',

sprints: realSprints.map(mapBackendSprintToUi),
tickets: realTickets.map(mapBackendTicketToUi),
    notifications: [],
    progressHistory: [{ date: 'Real', planned: 0, actual: 0 }],

    closedDate: backendProject?.actualEndDate
      ? new Date(backendProject.actualEndDate).toISOString().split('T')[0]
      : 'N/A',
    closedBy: 'N/A',
  };
}, [mockProject, backendProject, realSprints, realTickets]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showScenarioPanel, setShowScenarioPanel] = useState(false);
  const [showRecoveryPanel, setShowRecoveryPanel] = useState(false);
  const [showAddDeveloperModal, setShowAddDeveloperModal] = useState(false);
  const [showCloseProjectModal, setShowCloseProjectModal] = useState(false);
  const [showCompleteSprintModal, setShowCompleteSprintModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
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
    parentTicketId: ''
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
  const activeSprint = project.sprints.find(s => s.status === 'Active');
  const [sprintFilter, setSprintFilter] = useState<string | 'all'>(activeSprint?.id || 'all');

  useEffect(() => {
  if (sprintFilter === "all") return;
  if (!sprintFilter) return;

  const loadTickets = async () => {
    try {
      const data = await authFetch(`/tickets/sprint/${sprintFilter}`);
      setRealTickets(data.tickets || []);
    } catch (error) {
      console.error(error);
    }
  };

  loadTickets();
}, [sprintFilter]);
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

    setShowSprintModal(false);
  } catch (error:any) {
    alert(error.message);
  }
};
const handleCreateTicket = async () => {
  try {
    await authFetch(`/tickets/sprint/${ticketData.sprintId}`, {
      method: "POST",
      body: JSON.stringify({
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        estimatedHours: Number(ticketData.estimation),
        assignedToId: ticketData.assignee || null
      })
    });

    const data = await authFetch(`/tickets/sprint/${ticketData.sprintId}`);
    setRealTickets(data.tickets);

    setShowTicketModal(false);

  } catch (error:any) {
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
  const handleAddDeveloper = () => {
    console.log('Developer added:', developerData);
    setShowAddDeveloperModal(false);
    setDeveloperData({
      name: '',
      email: '',
      role: ''
    });
  };
const handleCompleteSprint = async () => {
  try {
    await authFetch(`/sprints/${sprintFilter}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "COMPLETED"
      })
    });

    const data = await authFetch(`/sprints/project/${id}`);
    setRealSprints(data.sprints);

    setShowCompleteSprintModal(false);

  } catch (error:any) {
    alert(error.message);
  }
};
  const userTickets = realTickets;
  const sprintFilteredTickets = sprintFilter === 'all' ? userTickets : userTickets.filter(t => t.sprintId === sprintFilter);
  const finalFilteredTickets = role === 'DEVELOPER' && showMyTicketsOnly ? sprintFilteredTickets.filter(t => t.assignee === user.name || t.assignee.includes(user.name)) : sprintFilteredTickets;
  const backlogTickets = finalFilteredTickets;
  const sprintTickets = finalFilteredTickets;
  const getParentTickets = (tickets: Ticket[]) => {
    return tickets.filter(t => !t.parentTicketId);
  };
  const getSubTickets = (parentTicketId: string) => {
    return project.tickets.filter(t => t.parentTicketId === parentTicketId);
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
  const canManageProject = user.role === 'PM' || user.role === 'ADMIN';
  const canEditTickets = true;
  const handleTicketUpdate = (ticketId: string, updates: Partial<Ticket>) => {
    console.log('Updating ticket:', ticketId, updates);
    setSelectedTicket(null);
  };
  const priorityColors = {
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
                <option value="all">📊 Todos los Sprints (Vista Histórica)</option>
                {realSprints.map(sprint => <option key={sprint.id} value={sprint.id}>
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
          {role === 'DEVELOPER' ? <>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FF3B30]" />
                Mis Métricas Personales
              </h2>
              {(() => {
            const devMetrics = developerMetrics[user.name];
            if (!devMetrics) {
              return <p className="text-[#8E8E93]">No hay métricas disponibles</p>;
            }
            return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{devMetrics.completedTickets}</p>
                      <p className="text-sm text-[#8E8E93]">Tickets Completados</p>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Activity className="w-5 h-5 text-blue-500" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{devMetrics.inProgressTickets}</p>
                      <p className="text-sm text-[#8E8E93]">En Progreso</p>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Zap className="w-5 h-5 text-purple-500" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{devMetrics.personalVelocity}</p>
                      <p className="text-sm text-[#8E8E93]">Velocity (pts/sprint)</p>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <Percent className="w-5 h-5 text-cyan-500" />
                        </div>
                        {devMetrics.completionRate >= 85 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-[#FF3B30]" />}
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{devMetrics.completionRate.toFixed(1)}%</p>
                      <p className="text-sm text-[#8E8E93]">Tasa Completado</p>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Flame className="w-5 h-5 text-orange-500" />
                        </div>
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{devMetrics.currentStreak}</p>
                      <p className="text-sm text-[#8E8E93]">Días Consecutivos 🔥</p>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                          <Award className="w-5 h-5 text-yellow-500" />
                        </div>
                        {devMetrics.rankInTeam === 1 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">#{devMetrics.rankInTeam}</p>
                      <p className="text-sm text-[#8E8E93]">Top {devMetrics.percentile}% del equipo</p>
                    </div>
                  </div>;
          })()}

              {}
              {(() => {
            const devMetrics = developerMetrics[user.name];
            if (!devMetrics) return null;
            return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                          <Clock className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{devMetrics.avgResolutionTime}</p>
                          <p className="text-xs text-[#8E8E93]">Días promedio/ticket</p>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{devMetrics.bugRate}%</p>
                          <p className="text-xs text-[#8E8E93]">Tasa de bugs</p>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                          <Code className="w-4 h-4 text-pink-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{devMetrics.codeReviews}</p>
                          <p className="text-xs text-[#8E8E93]">Code Reviews</p>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <Trophy className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{devMetrics.bestStreak}</p>
                          <p className="text-xs text-[#8E8E93]">Mejor streak récord</p>
                        </div>
                      </div>
                    </div>
                  </div>;
          })()}
            </> : <>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FF3B30]" />
                KPIs Estratégicos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {}
                <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    {project.progress > 60 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-[#FF3B30]" />}
                  </div>
<p className="text-3xl font-bold text-white mb-1">{project.progressLabel}</p>
                  <p className="text-sm text-[#8E8E93]">% Avance</p>
                </div>

                {}
                <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    {project.scheduleVariance >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-[#FF3B30]" />}
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">N/A</p>
                  <p className="text-sm text-[#8E8E93]">Schedule Variance</p>
                </div>

                {}
                <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Activity className="w-5 h-5 text-cyan-500" />
                    </div>
                    {project.spi >= 1 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-[#FF3B30]" />}
                  </div>
                <p className="text-3xl font-bold text-white mb-1">N/A</p>
                  <p className="text-sm text-[#8E8E93]">SPI</p>
                </div>

                {}
                <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-[#FF3B30]/10 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
                    </div>
                    <AlertCircle className="w-4 h-4 text-[#FF3B30]" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{project.delayedMilestones}</p>
                  <p className="text-sm text-[#8E8E93]">Hitos Retrasados</p>
                </div>

                {}
                <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <XCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{project.blockedTickets}</p>
                  <p className="text-sm text-[#8E8E93]">Tickets Bloqueados</p>
                </div>

                {}
                <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${project.risk === 'High' ? 'bg-[#FF3B30]/10' : project.risk === 'Medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                      <Shield className={`w-5 h-5 ${project.risk === 'High' ? 'text-[#FF3B30]' : project.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{project.risk}</p>
                  <p className="text-sm text-[#8E8E93]">Nivel de Riesgo</p>
                </div>
              </div>
            </>}
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
                {canManageProject && project.team.length < 10 && <button onClick={() => setShowAddDeveloperModal(true)} className="bg-[#1C1C1E] border border-dashed border-white/20 rounded-xl p-5 backdrop-blur-xl hover:border-[#FF3B30] hover:bg-[#FF3B30]/5 transition-all group flex flex-col items-center justify-center w-[220px] h-[280px] flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-[#FF3B30]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF3B30]/20 transition-all">
                      <Plus className="w-8 h-8 text-[#FF3B30]" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">Agregar Developer</p>
                    <p className="text-xs text-[#8E8E93] text-center">Expandir el equipo</p>
                  </button>}

                {project.team.map(member => <div key={member.id} className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all group w-[220px] flex-shrink-0">
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
                  <p className="text-2xl font-bold text-white">{project.team.length}</p>
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
                    {project.team.filter(m => m.status === 'Active').length}
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
                    {project.team.reduce((sum, m) => sum + m.tasksAssigned, 0)}
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
{project.team.length > 0
  ? `${Math.round(project.team.reduce((sum, m) => sum + m.performance, 0) / project.team.length)}%`
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
            {role === 'DEVELOPER' ? 'Mi Progreso vs Plan Personal' : 'Planned vs Actual'}
          </h2>
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={role === 'DEVELOPER' ? [{
              date: 'Sem 1',
              planned: 8,
              actual: 8
            }, {
              date: 'Sem 2',
              planned: 16,
              actual: 15
            }, {
              date: 'Sem 3',
              planned: 24,
              actual: 22
            }, {
              date: 'Sem 4',
              planned: 32,
              actual: 28
            }, {
              date: 'Sem 5',
              planned: 40,
              actual: 32
            }, {
              date: 'Sem 6',
              planned: 48,
              actual: 40
            }] : project.progressHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#8E8E93" tick={{
                fill: '#8E8E93',
                fontSize: 12
              }} />
                <YAxis stroke="#8E8E93" tick={{
                fill: '#8E8E93',
                fontSize: 12
              }} label={{
                value: role === 'DEVELOPER' ? 'Horas' : 'Progreso (%)',
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
                <Line type="monotone" dataKey="planned" stroke="#8E8E93" strokeWidth={3} name={role === 'DEVELOPER' ? 'Horas Planificadas' : 'Planificado'} dot={{
                fill: '#8E8E93',
                r: 5
              }} activeDot={{
                r: 7
              }} />
                <Line type="monotone" dataKey="actual" stroke="#007AFF" strokeWidth={3} name={role === 'DEVELOPER' ? 'Mis Horas Reales' : 'Real'} dot={{
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

        {}
        <section>
          
          
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-[#FF3B30]" />
                Gestión Ágil
              </h2>
              
              {}
              {canManageProject && <button onClick={() => setShowSprintModal(true)} className="px-4 py-2 bg-[#FF3B30] hover:bg-[#FF3B30]/90 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Crear Sprint
                </button>}
            </div>
            
            {}
            <div className="mb-6 bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#007AFF] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">
                    {sprintFilter === 'all' ? `📊 Vista Histórica: ${backlogTickets.length} tickets en total` : `🏃 ${project.sprints.find(s => s.id === sprintFilter)?.name || 'Sprint'}: ${backlogTickets.length} tickets`}
                  </p>
                  <p className="text-xs text-[#8E8E93]">
                    {sprintFilter === 'all' ? 'Mostrando todos los tickets del proyecto' : `Tickets del sprint: ${project.sprints.find(s => s.id === sprintFilter)?.duration || ''}`}
                  </p>
                </div>
                
                {}
                {canManageProject && sprintFilter !== 'all' && project.sprints.find(s => s.id === sprintFilter)?.status === 'Active' && <button onClick={() => setShowCompleteSprintModal(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    Concluir Sprint
                  </button>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {}
              <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl lg:col-span-2">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {sprintFilter === 'all' ? 'Todos los Tickets' : `Tickets - ${project.sprints.find(s => s.id === sprintFilter)?.name || 'Sprint'}`}
                    </h3>
                    <Badge>{parentTicketsOnly.length} tickets</Badge>
                    {backlogTickets.length !== parentTicketsOnly.length && <span className="text-xs text-[#8E8E93]">({backlogTickets.length} total con subtickets)</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    {}
                    <div className="flex items-center gap-1 bg-[#0F0F0F] border border-white/10 rounded-lg p-1">
                      <button onClick={() => setTicketsView('table')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${ticketsView === 'table' ? 'bg-[#FF3B30] text-white' : 'text-[#8E8E93] hover:text-white'}`}>
                        <Table className="w-3.5 h-3.5" />
                        Tabla
                      </button>
                      <button onClick={() => setTicketsView('kanban')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${ticketsView === 'kanban' ? 'bg-[#FF3B30] text-white' : 'text-[#8E8E93] hover:text-white'}`}>
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Kanban
                      </button>
                    </div>
                    
                    {}
                    {role === 'DEVELOPER' && <button onClick={() => setShowMyTicketsOnly(!showMyTicketsOnly)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${showMyTicketsOnly ? 'bg-[#FF3B30] text-white border-[#FF3B30]' : 'bg-[#0F0F0F] text-[#8E8E93] border-white/10 hover:text-white hover:border-[#FF3B30]/50'}`}>
                        <Users className="w-3.5 h-3.5" />
                        Solo mis tickets
                      </button>}
                    
                    {canManageProject && <Button variant="outline" icon={Plus} onClick={() => {
                    setTicketData({
                      ...ticketData,
                      sprintId: sprintFilter !== 'all' ? sprintFilter : activeSprint?.id || ''
                    });
                    setShowTicketModal(true);
                  }} className="text-xs py-1 px-3">
                        Crear Ticket
                      </Button>}
                  </div>
                </div>

                {}
                {ticketsView === 'table' && <div className="overflow-y-auto max-h-[600px]">
                    <table className="w-full">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-white/10 bg-[#0F0F0F]/50">
                          <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">Key</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">Summary</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">Assignee</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">Priority</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">Estimation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {parentTicketsOnly.map(ticket => {
                      const isMyTicket = ticket.assignee === user.name || ticket.assignee.includes(user.name);
                      const subTickets = getSubTickets(ticket.id);
                      const hasSubTickets = subTickets.length > 0;
                      return <>
                              {}
                              <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} className={`hover:bg-white/5 transition-colors cursor-pointer ${ticket.status === 'Done' ? 'bg-green-500/5 border-l-4 border-l-green-500' : isMyTicket ? 'bg-[#FF3B30]/5 border-l-2 border-l-[#FF3B30]' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {hasSubTickets && <GitBranch className="w-3.5 h-3.5 text-purple-400" />}
                                    <span className="text-xs font-mono text-[#FF3B30] font-medium">{ticket.id}</span>
                                    {isMyTicket && <span className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full"></span>}
                                    {ticket.status === 'Done' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm ${ticket.status === 'Done' ? 'text-green-400 line-through decoration-green-500 decoration-2' : isMyTicket ? 'text-white font-medium' : 'text-white'}`}>
                                      {ticket.title}
                                    </span>
                                    {hasSubTickets && <span className="text-xs text-purple-400">({subTickets.length} subtasks)</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isMyTicket ? 'bg-[#FF3B30] ring-2 ring-[#FF3B30]/30' : 'bg-[#FF3B30]/10'}`}>
                                      <span className={`text-xs font-medium ${isMyTicket ? 'text-white' : 'text-[#FF3B30]'}`}>
                                        {ticket.assignee.split(' ').map(n => n[0]).join('')}
                                      </span>
                                    </div>
                                    <span className={`text-sm ${isMyTicket ? 'text-white font-medium' : 'text-[#8E8E93]'}`}>
                                      {ticket.assignee}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>
                                    {ticket.priority}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {hasSubTickets ? <div className="flex items-center gap-2">
                                      <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all" style={{
                                  width: `${getTicketProgress(ticket)}%`
                                }} />
                                      </div>
                                      <span className="text-xs text-[#8E8E93]">{getTicketProgress(ticket)}%</span>
                                    </div> : <Badge variant={ticket.status === 'Blocked' ? 'danger' : 'default'}>
                                      {ticket.status}
                                    </Badge>}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-white">{ticket.estimation} pts</span>
                                </td>
                              </tr>

                              {}
                              {subTickets.map(subTicket => {
                          const isMySubTicket = subTicket.assignee === user.name || subTicket.assignee.includes(user.name);
                          return <tr key={subTicket.id} onClick={() => setSelectedTicket(subTicket)} className={`hover:bg-white/5 transition-colors cursor-pointer bg-purple-500/5 ${subTicket.status === 'Done' ? 'opacity-60' : ''}`}>
                                    <td className="px-4 py-2 pl-12">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-purple-400 font-medium">{subTicket.id}</span>
                                        {subTicket.status === 'Done' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2">
                                      <span className={`text-xs ${subTicket.status === 'Done' ? 'text-green-400 line-through' : 'text-[#8E8E93]'}`}>
                                        └─ {subTicket.title}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">
                                      <span className="text-xs text-[#8E8E93]">{subTicket.assignee}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityColors[subTicket.priority]}`}>
                                        {subTicket.priority}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">
                                      <Badge variant={subTicket.status === 'Blocked' ? 'danger' : 'default'} className="text-[10px] px-1.5 py-0.5">
                                        {subTicket.status}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-2">
                                      <span className="text-xs text-[#8E8E93]">{subTicket.estimation} pts</span>
                                    </td>
                                  </tr>;
                        })}
                            </>;
                    })}
                      </tbody>
                    </table>
                    {backlogTickets.length === 0 && <div className="py-12 px-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF3B30]/10 mb-4">
                          <ListTodo className="w-8 h-8 text-[#FF3B30]" />
                        </div>
                        <h4 className="text-base font-semibold text-white mb-2">
                          {sprintFilter === 'all' ? 'No hay tickets en el proyecto' : 'Sprint vacío'}
                        </h4>
                        <p className="text-sm text-[#8E8E93] mb-4">
                          {sprintFilter === 'all' ? 'Comienza creando el primer ticket para este proyecto' : 'Este sprint no tiene tickets asignados aún. Crea tickets para comenzar a llenar el backlog y el Gantt.'}
                        </p>
                        {canManageProject && <button onClick={() => setShowTicketModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF3B30] hover:bg-[#FF3B30]/90 rounded-lg text-white text-sm font-medium transition-all">
                            <Plus className="w-4 h-4" />
                            Crear Primer Ticket
                          </button>}
                      </div>}
                  </div>}

                {}
                {ticketsView === 'kanban' && <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {['Backlog', 'In Progress', 'Done', 'Blocked'].map(status => {
                    const statusTickets = backlogTickets.filter(t => t.status === status);
                    const totalPoints = statusTickets.reduce((sum, t) => sum + t.estimation, 0);
                    return <div key={status} className="bg-[#0F0F0F] border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-white/10">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-semibold text-white">{status}</h4>
                                <Badge>{statusTickets.length}</Badge>
                              </div>
                              <p className="text-xs text-[#8E8E93]">{totalPoints} pts</p>
                            </div>
                            <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                              {statusTickets.map(ticket => {
                          const isMyTicket = ticket.assignee === user.name || ticket.assignee.includes(user.name);
                          return <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className={`bg-[#1C1C1E] border rounded-lg p-3 cursor-pointer hover:border-[#FF3B30]/50 transition-all group ${ticket.status === 'Done' ? 'border-green-500 ring-2 ring-green-500/20 bg-green-500/5' : isMyTicket ? 'border-[#FF3B30] ring-2 ring-[#FF3B30]/20' : 'border-white/10'}`}>
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-[#FF3B30] font-medium">{ticket.id}</span>
                                        {ticket.status === 'Done' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                      </div>
                                      {isMyTicket && !ticket.status.includes('Done') && <span className="text-[10px] bg-[#FF3B30] text-white px-1.5 py-0.5 rounded font-medium">
                                          TU
                                        </span>}
                                      {ticket.status === 'Done' && <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-medium">
                                          ✓
                                        </span>}
                                    </div>
                                    <p className={`text-sm mb-3 line-clamp-2 ${ticket.status === 'Done' ? 'text-green-400 line-through decoration-green-500 decoration-2' : isMyTicket ? 'text-white font-medium' : 'text-white'}`}>
                                      {ticket.title}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isMyTicket ? 'bg-[#FF3B30] ring-2 ring-[#FF3B30]/30' : 'bg-[#FF3B30]/10'}`}>
                                          <span className={`text-xs font-medium ${isMyTicket ? 'text-white' : 'text-[#FF3B30]'}`}>
                                            {ticket.assignee.split(' ').map(n => n[0]).join('')}
                                          </span>
                                        </div>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityColors[ticket.priority]}`}>
                                          {ticket.priority}
                                        </span>
                                      </div>
                                      <span className="text-xs text-[#8E8E93] font-medium">{ticket.estimation} pts</span>
                                    </div>
                                  </div>;
                        })}
                              {statusTickets.length === 0 && <p className="text-xs text-[#8E8E93] text-center py-8">
                                  Sin tickets
                                </p>}
                            </div>
                          </div>;
                  })}
                    </div>
                  </div>}
              </div>

              {}
              {sprintFilter !== 'all' && (() => {
              const selectedSprint = project.sprints.find(s => s.id === sprintFilter);
              if (!selectedSprint) return null;
              return <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-semibold text-white text-lg">
                          {role === 'DEVELOPER' ? 'Mi Progreso Personal' : selectedSprint.name}
                        </h3>
                        <p className="text-sm text-[#8E8E93] mt-1">
                          {role === 'DEVELOPER' ? 'Métricas de mi trabajo en este sprint' : selectedSprint.duration}
                        </p>
                      </div>
                      <Badge variant={selectedSprint.status === 'Active' ? 'warning' : selectedSprint.status === 'Completed' ? 'default' : 'default'}>
                        {selectedSprint.status}
                      </Badge>
                    </div>

                    {role === 'DEVELOPER' ? <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {}
                          <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-[#8E8E93]">Mi Progreso</span>
                              <span className="text-lg font-bold text-white">75%</span>
                            </div>
                            <div className="w-full bg-[#1C1C1E] rounded-full h-2">
                              <div className="bg-[#007AFF] h-2 rounded-full transition-all" style={{
                          width: '75%'
                        }}></div>
                            </div>
                            <p className="text-xs text-[#8E8E93] mt-2">6/8 tickets completados</p>
                          </div>

                          {}
                          <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-[#8E8E93]">Mis Horas</span>
                              <span className="text-lg font-bold text-white">32h / 40h</span>
                            </div>
                            <div className="w-full bg-[#1C1C1E] rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full transition-all" style={{
                          width: '80%'
                        }}></div>
                            </div>
                            <p className="text-xs text-[#8E8E93] mt-2">8h restantes</p>
                          </div>

                          {}
                          <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-[#8E8E93]">Mis Tickets</span>
                              <span className="text-lg font-bold text-white">8</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                              <span>✅ 6</span>
                              <span>🏃 2</span>
                              <span>📋 0</span>
                              <span>🚫 0</span>
                            </div>
                          </div>
                        </div>

                        {}
                        <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-white mb-4">Mi Burndown Personal</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={[{
                        day: 'D1',
                        ideal: 40,
                        remaining: 40
                      }, {
                        day: 'D2',
                        ideal: 36,
                        remaining: 38
                      }, {
                        day: 'D3',
                        ideal: 32,
                        remaining: 34
                      }, {
                        day: 'D4',
                        ideal: 28,
                        remaining: 28
                      }, {
                        day: 'D5',
                        ideal: 24,
                        remaining: 24
                      }, {
                        day: 'D6',
                        ideal: 20,
                        remaining: 18
                      }, {
                        day: 'D7',
                        ideal: 16,
                        remaining: 14
                      }, {
                        day: 'D8',
                        ideal: 12,
                        remaining: 10
                      }, {
                        day: 'D9',
                        ideal: 8,
                        remaining: 8
                      }, {
                        day: 'D10',
                        ideal: 4,
                        remaining: 8
                      }]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="day" stroke="#8E8E93" tick={{
                          fill: '#8E8E93',
                          fontSize: 10
                        }} label={{
                          value: 'Día',
                          position: 'insideBottom',
                          offset: -5,
                          fill: '#8E8E93',
                          fontSize: 10
                        }} />
                              <YAxis stroke="#8E8E93" tick={{
                          fill: '#8E8E93',
                          fontSize: 10
                        }} label={{
                          value: 'Horas',
                          angle: -90,
                          position: 'insideLeft',
                          fill: '#8E8E93',
                          fontSize: 10
                        }} />
                              <Tooltip contentStyle={{
                          backgroundColor: '#0F0F0F',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }} />
                              <Line name="Ideal" type="monotone" dataKey="ideal" stroke="#8E8E93" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                              <Line name="Mis Horas Restantes" type="monotone" dataKey="remaining" stroke="#007AFF" strokeWidth={3} dot={{
                          fill: '#007AFF',
                          r: 4
                        }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </> : <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {}
                          <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-[#8E8E93]">Progreso</span>
                              <span className="text-lg font-bold text-white">{selectedSprint.progress}%</span>
                            </div>
                            <div className="w-full bg-[#1C1C1E] rounded-full h-2">
                              <div className="bg-[#007AFF] h-2 rounded-full transition-all" style={{
                          width: `${selectedSprint.progress}%`
                        }}></div>
                            </div>
                          </div>

                          {}
                          <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-[#8E8E93]">Capacidad</span>
                              <span className="text-lg font-bold text-white">{selectedSprint.used}h / {selectedSprint.capacity}h</span>
                            </div>
                            <div className="w-full bg-[#1C1C1E] rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${selectedSprint.used > selectedSprint.capacity ? 'bg-[#FF3B30]' : 'bg-green-500'}`} style={{
                          width: `${Math.min(selectedSprint.used / selectedSprint.capacity * 100, 100)}%`
                        }}></div>
                            </div>
                          </div>

                          {}
                          <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-[#8E8E93]">Tickets</span>
                              <span className="text-lg font-bold text-white">{backlogTickets.length}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                              <span>✅ {backlogTickets.filter(t => t.status === 'Done').length}</span>
                              <span>🏃 {backlogTickets.filter(t => t.status === 'In Progress').length}</span>
                              <span>📋 {backlogTickets.filter(t => t.status === 'Backlog').length}</span>
                              <span>🚫 {backlogTickets.filter(t => t.status === 'Blocked').length}</span>
                            </div>
                          </div>
                        </div>

                        {}
                        <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-white mb-4">Burndown Chart</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={selectedSprint.burndownData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="day" stroke="#8E8E93" tick={{
                          fill: '#8E8E93',
                          fontSize: 10
                        }} label={{
                          value: 'Día',
                          position: 'insideBottom',
                          offset: -5,
                          fill: '#8E8E93',
                          fontSize: 10
                        }} />
                              <YAxis stroke="#8E8E93" tick={{
                          fill: '#8E8E93',
                          fontSize: 10
                        }} label={{
                          value: 'Story Points',
                          angle: -90,
                          position: 'insideLeft',
                          fill: '#8E8E93',
                          fontSize: 10
                        }} />
                              <Tooltip contentStyle={{
                          backgroundColor: '#0F0F0F',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }} />
                              <Line name="Ideal" type="monotone" dataKey="ideal" stroke="#8E8E93" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                              <Line name="Real" type="monotone" dataKey="remaining" stroke="#007AFF" strokeWidth={3} dot={{
                          fill: '#007AFF',
                          r: 4
                        }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </>}

                    {}
                    
                  </div>;
            })()}
            </div>
          </section>

          {}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#FF3B30]" />
                Diagrama de Gantt
                {sprintFilter !== 'all' && <Badge className="ml-2">{project.sprints.find(s => s.id === sprintFilter)?.name}</Badge>}
              </h2>
              
              {}
              {role === 'DEVELOPER' && <button onClick={() => setShowMyTicketsOnly(!showMyTicketsOnly)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${showMyTicketsOnly ? 'bg-[#FF3B30] text-white border-[#FF3B30]' : 'bg-[#0F0F0F] text-[#8E8E93] border-white/10 hover:text-white hover:border-[#FF3B30]/50'}`}>
                  <Users className="w-3.5 h-3.5" />
                  Solo mis tickets
                </button>}
            </div>
            
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
              {backlogTickets.length > 0 ? (() => {
              const allDates = backlogTickets.flatMap(t => [new Date(t.startDate), new Date(t.endDate)]);
              const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
              const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
              const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              const sortedTickets = [...backlogTickets].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
              return <div className="overflow-x-auto -mx-6 px-6">
                      <div className="space-y-3 overflow-y-auto max-h-[500px] min-w-[900px]">
                        {sortedTickets.map(ticket => {
                    const startDate = new Date(ticket.startDate);
                    const endDate = new Date(ticket.endDate);
                    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    const daysFromStart = Math.ceil((startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
                    const leftPercent = daysFromStart / totalDays * 100;
                    const widthPercent = duration / totalDays * 100;
                    const isMyTicket = role === 'DEVELOPER' && (ticket.assignee === user.name || ticket.assignee.includes(user.name));
                    return <div key={ticket.id} className={`relative rounded-lg transition-all ${isMyTicket ? 'bg-gradient-to-r from-[#FF3B30]/20 via-[#FF3B30]/10 to-transparent border-2 border-[#FF3B30]/40 p-2 shadow-lg shadow-[#FF3B30]/20' : 'p-1'}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-40 flex-shrink-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium truncate ${isMyTicket ? 'text-white font-bold' : 'text-white'}`}>
                                  {ticket.title}
                                </p>
                                {isMyTicket && <span className="text-[10px] bg-[#FF3B30] text-white px-2 py-1 rounded-md font-bold flex-shrink-0 shadow-md shadow-[#FF3B30]/50 animate-pulse">
                                    TÚ
                                  </span>}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-medium ${isMyTicket ? 'text-[#FF3B30]' : 'text-[#8E8E93]'}`}>
                                  {ticket.assignee}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${priorityColors[ticket.priority]}`}>
                                  {ticket.priority}
                                </span>
                              </div>
                            </div>
                            
                            <div className={`flex-1 relative h-12 rounded-lg ${isMyTicket ? 'bg-[#0F0F0F] ring-2 ring-[#FF3B30]/30' : 'bg-[#0F0F0F]'}`}>
                              <div className={`absolute rounded transition-all ${isMyTicket && ticket.status === 'Done' ? 'h-full bg-gradient-to-r from-green-500/60 to-green-400/60 border-[3px] border-green-400 shadow-lg shadow-green-500/40' : isMyTicket && ticket.status === 'In Progress' ? 'h-full bg-gradient-to-r from-blue-500/60 to-blue-400/60 border-[3px] border-blue-400 shadow-lg shadow-blue-500/40' : isMyTicket && ticket.status === 'Blocked' ? 'h-full bg-gradient-to-r from-[#FF3B30]/60 to-orange-500/60 border-[3px] border-[#FF3B30] shadow-lg shadow-[#FF3B30]/40' : isMyTicket ? 'h-full bg-gradient-to-r from-[#8E8E93]/60 to-[#6E6E73]/60 border-[3px] border-[#8E8E93] shadow-lg shadow-[#8E8E93]/40' : ticket.status === 'Done' ? 'h-full bg-green-500/20 border border-green-500/50' : ticket.status === 'In Progress' ? 'h-full bg-blue-500/20 border border-blue-500/50' : ticket.status === 'Blocked' ? 'h-full bg-[#FF3B30]/20 border border-[#FF3B30]/50' : 'h-full bg-[#8E8E93]/20 border border-[#8E8E93]/50'} flex items-center justify-center`} style={{
                            left: `${Math.max(0, Math.min(leftPercent, 95))}%`,
                            width: `${Math.max(5, Math.min(widthPercent, 100 - leftPercent))}%`
                          }}>
                                <span className={`text-[10px] font-medium px-2 truncate ${isMyTicket ? 'text-white font-bold' : 'text-white'}`}>
                                  {duration}d • {ticket.estimation}pts
                                </span>
                              </div>
                            </div>
                            
                            <div className="w-24 flex-shrink-0 text-right">
                              <p className={`text-xs ${isMyTicket ? 'text-white font-semibold' : 'text-white'}`}>
                                {ticket.startDate}
                              </p>
                              <p className={`text-xs ${isMyTicket ? 'text-[#FF3B30]' : 'text-[#8E8E93]'}`}>
                                {ticket.endDate}
                              </p>
                            </div>
                          </div>
                        </div>;
                  })}
                  </div>
                  
                  {}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-[#8E8E93]">
                      <span>{minDate.toLocaleDateString()}</span>
                      <span>Línea de tiempo ({totalDays} días)</span>
                      <span>{maxDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>;
            })() : <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-[#8E8E93] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[#8E8E93]">No hay tickets para mostrar en el Gantt</p>
                </div>}
            </div>
          </section>

          {}
          {role !== 'DEVELOPER' && <section>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
                Bloqueadores
              </h2>
              <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                {project.blockers.length > 0 ? <div className="space-y-3">
                    {project.blockers.map(blocker => <div key={blocker.id} className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className={`w-4 h-4 ${blocker.severity === 'High' ? 'text-[#FF3B30]' : blocker.severity === 'Medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
                            <p className="text-sm font-medium text-white">{blocker.title}</p>
                          </div>
                          <Badge variant={blocker.status === 'Open' ? 'danger' : blocker.status === 'In Progress' ? 'warning' : 'default'}>
                            {blocker.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#8E8E93] mb-2">{blocker.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#8E8E93]">Asignado a: {blocker.assignee}</span>
                          <Badge variant={blocker.severity === 'High' ? 'danger' : blocker.severity === 'Medium' ? 'warning' : 'default'}>
                            {blocker.severity}
                          </Badge>
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-[#8E8E93]">No hay bloqueadores activos</p>
                  </div>}
              </div>
            </section>}

          {}
          {role !== 'DEVELOPER' && <section>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF3B30]" />
              IA & Riesgo
            </h2>
            <div className="bg-gradient-to-br from-[#FF3B30]/10 to-[#1C1C1E] border border-[#FF3B30]/20 rounded-xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#FF3B30]/10 rounded-xl">
                    <Shield className="w-6 h-6 text-[#FF3B30]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Clasificación Automática con IA</h3>
                    <Badge variant="danger" className="mt-1">Riesgo {project.risk}</Badge>
                  </div>
                </div>
                
                <div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white/90 leading-relaxed">
                      <span className="font-semibold text-white">Análisis Predictivo:</span> El proyecto presenta <span className="text-[#FF3B30] font-semibold">{project.delayedMilestones} hitos retrasados</span> y un 
                      SPI de <span className="text-[#FF3B30] font-semibold">{project.spi}</span>. 
                      La desviación del cronograma es de <span className="text-[#FF3B30] font-semibold">{project.scheduleVariance}%</span>.
                      {project.blockedTickets > 0 && <> Además, hay <span className="text-[#FF3B30] font-semibold">{project.blockedTickets} tickets bloqueados</span> que requieren atención inmediata.</>}
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-[#FF3B30]/5 border border-[#FF3B30]/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#FF3B30] mb-1">Recomendaciones IA</p>
                      <ul className="text-xs text-white/80 space-y-1">
                        <li>• Priorizar resolución de bloqueadores críticos</li>
                        <li>• Reasignar recursos al camino crítico</li>
                        <li>• Considerar extensión de {Math.abs(project.scheduleVariance)} días</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" icon={Zap} onClick={() => setShowScenarioPanel(true)} className="w-full hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30] transition-all duration-300">
                    Simular Escenario
                  </Button>
                  <Button variant="outline" icon={PlayCircle} onClick={() => setShowRecoveryPanel(true)} className="w-full hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30] transition-all duration-300">
                    Plan Recuperación
                  </Button>
                </div>
              </div>
            </section>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FF3B30]" />
                Gamificación
              </h2>
              
              {}
              <div className="flex items-center gap-2 bg-[#1C1C1E] border border-white/10 rounded-lg p-1">
                <button onClick={() => setGamificationView('project')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${gamificationView === 'project' ? 'bg-[#FF3B30] text-white' : 'text-[#8E8E93] hover:text-white'}`}>
                  Este Proyecto
                </button>
                <button onClick={() => setGamificationView('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${gamificationView === 'all' ? 'bg-[#FF3B30] text-white' : 'text-[#8E8E93] hover:text-white'}`}>
                  Todos los Proyectos
                </button>
              </div>
            </div>
            
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
              {}
              <div className="text-center mb-6 pb-6 border-b border-white/10">
                <p className="text-sm text-[#8E8E93] mb-2">
                  {gamificationView === 'project' ? 'Score del Proyecto' : 'Score Total de Todos los Proyectos'}
                </p>
                <p className="text-4xl font-bold text-white">
                  {gamificationView === 'project' ? project.gamification.projectScore.toLocaleString() : globalGamification.totalScore.toLocaleString()}
                </p>
                <p className="text-xs text-[#8E8E93] mt-1">puntos totales</p>
              </div>

              {}
              <div className="mb-6">
                <p className="text-sm font-semibold text-white mb-3">Top Developers</p>
                <div className="space-y-3">
                  {(gamificationView === 'project' ? project.gamification.topDevelopers : globalGamification.topDevelopers).map((dev, index) => <div key={index} className="flex items-center gap-3 bg-[#0F0F0F] border border-white/10 rounded-lg p-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : index === 1 ? 'bg-gray-400/20 text-gray-400' : 'bg-orange-500/20 text-orange-500'}`}>
                        {dev.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{dev.name}</p>
                        <p className="text-xs text-[#8E8E93]">{dev.points.toLocaleString()} puntos</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {index === 0 && <Award className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Award className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Award className="w-5 h-5 text-orange-500" />}
                      </div>
                    </div>)}
                </div>
              </div>

              {}
              <div>
                <p className="text-sm font-semibold text-white mb-3">Badges Obtenidos</p>
                <div className="flex flex-wrap gap-2">
                  {(gamificationView === 'project' ? project.gamification.badges : globalGamification.badges).map((badge, index) => <div key={index} className="px-3 py-1.5 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-lg">
                      <span className="text-xs text-[#FF3B30] font-medium">{badge}</span>
                    </div>)}
                </div>
              </div>
            </div>
          </section>

          {}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#FF3B30]" />
              {role === 'DEVELOPER' ? 'Mis Notificaciones' : 'Feed de Actividad'}
            </h2>
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
              <div className="space-y-4">
                {(role === 'DEVELOPER' ? globalNotifications.filter(notification => notification.isPersonal && notification.assignedTo === user.name) : globalNotifications.filter(n => n.projectName === project.name || !n.isPersonal)).map(notification => {
                const icons: Record<GlobalNotification['type'], any> = {
                  ticket_completed: CheckCircle2,
                  blocker_added: AlertTriangle,
                  achievement: Star,
                  ai_alert: Sparkles,
                  deadline: Clock,
                  ticket_assigned: ListTodo,
                  weekly_performance: BarChart3,
                  project_assigned: UserPlus,
                  sprint_started: Rocket
                };
                const Icon = icons[notification.type];
                const colors: Record<GlobalNotification['type'], string> = {
                  ticket_completed: 'text-green-500 bg-green-500/10',
                  blocker_added: 'text-[#FF3B30] bg-[#FF3B30]/10',
                  achievement: 'text-yellow-400 bg-yellow-400/10',
                  ai_alert: 'text-purple-500 bg-purple-500/10',
                  deadline: 'text-orange-400 bg-orange-400/10',
                  ticket_assigned: 'text-blue-400 bg-blue-400/10',
                  weekly_performance: 'text-green-400 bg-green-400/10',
                  project_assigned: 'text-purple-400 bg-purple-400/10',
                  sprint_started: 'text-orange-400 bg-orange-400/10'
                };
                return <div key={notification.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[notification.type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <p className="text-xs text-[#8E8E93] mt-0.5">{notification.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#8E8E93]">{notification.user}</span>
                          <span className="text-xs text-[#8E8E93]">•</span>
                          <span className="text-xs text-[#8E8E93]">{notification.timestamp}</span>
                          {notification.projectName && notification.projectName !== 'Global' && <>
                              <span className="text-xs text-[#8E8E93]">•</span>
                              <span className="text-xs text-[#FF3B30]">{notification.projectName}</span>
                            </>}
                        </div>
                      </div>
                    </div>;
              })}
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
                      {ticketData.assignee || 'Seleccionar desarrollador'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
                  </button>
                  
                  {showAssigneeDropdown && <div className="absolute z-10 w-full mt-2 bg-[#0F0F0F] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {project.team.map(member => <button key={member.id} type="button" onClick={() => {
                  setTicketData({
                    ...ticketData,
                    assignee: member.name
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
                  {project.sprints.map(sprint => <option key={sprint.id} value={sprint.id}>
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
              <Button variant="primary" onClick={handleCreateTicket} className="flex-1 !bg-[#E31837] hover:!bg-[#C41430] disabled:!bg-[#E31837]/40 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100" disabled={!ticketData.title || !ticketData.assignee || !ticketData.estimation}>
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
                      <select value={subTicket.assignee} onChange={e => {
                  const updated = [...subTicketsData];
                  updated[index].assignee = e.target.value;
                  setSubTicketsData(updated);
                }} className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-lg text-white text-sm focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all">
                        <option value="">Seleccionar</option>
                        {project.team.map(member => <option key={member.id} value={member.name}>
                            {member.name}
                          </option>)}
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
                        <span className="text-sm font-medium text-white">{project.team.length}</span>
                      </div>
                      <input type="range" min="3" max="15" defaultValue={project.team.length} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF3B30]" />
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
      {showAddDeveloperModal && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-6">Agregar Desarrollador</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nombre
                </label>
                <input type="text" placeholder="Ej: Juan Pérez" value={developerData.name} onChange={e => setDeveloperData({
              ...developerData,
              name: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input type="email" placeholder="Ej: juan.perez@example.com" value={developerData.email} onChange={e => setDeveloperData({
              ...developerData,
              email: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Rol
                </label>
                <input type="text" placeholder="Ej: Desarrollador Frontend" value={developerData.role} onChange={e => setDeveloperData({
              ...developerData,
              role: e.target.value
            })} className="w-full px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddDeveloperModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleAddDeveloper} className="flex-1">
                Agregar Desarrollador
              </Button>
            </div>
          </div>
        </div>}

      {}
      {selectedTicket && <TicketDetailModal ticket={selectedTicket} projectName={project.name} onClose={() => setSelectedTicket(null)} onUpdate={updates => handleTicketUpdate(selectedTicket.id, updates)} canEdit={canEditTickets} userRole={user.role} onDivideTicket={handleDivideTicket} />}

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
                    "{project.sprints.find(s => s.id === sprintFilter)?.name}"
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