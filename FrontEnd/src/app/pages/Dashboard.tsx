import { useEffect, useState, useCallback } from 'react';
import { usePolling } from '../../hooks/usePolling';
import { Header } from '../components/Header';
import { KPICard } from '../components/KPICard';
import { Button } from '../components/Button';
import { InfoTooltip } from '../components/InfoTooltip';
import { Plus, TrendingUp, Clock, AlertTriangle, Activity, CheckCircle2, ListTodo, Code, Trophy, Target, Loader2, Search, ChevronDown } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { mapRisk } from '../../utils/formatters';
import { getThemeColors } from '../utils/themeColors';
import { Badge } from '../components/Badge';
import { authFetch } from '../../services/api';

interface BackendProject {
  id: string;
  name: string;
  status: string;
  riskLevel: string;
  startDate: string;
  targetEndDate: string;
  pm: { id: string; fullName: string } | null;
  members: { id: string; fullName: string; role: string }[];
  stats: { membersCount: number; sprintsCount: number; ticketsCount: number };
}

interface Analytics {
  kpis: {
    progress: number;
    plannedProgress: number;
    scheduleVariance: number;
    spi: number;
    risk: string;
    officialRiskLevel?: string | null;
    blockedTickets: number;
    delayedMilestones: number;
    completedStoryPoints: number;
    totalStoryPoints: number;
  };
  progressHistory: { date: string; planned: number; actual: number }[];
  teamMetrics: { id: string; name: string; tasksAssigned: number; performance: number }[];
}

interface EnrichedProject extends BackendProject {
  analytics: Analytics | null;
}

interface BackendTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number | null;
  assignedToId: string | null;
  completedAt?: string | null;
}

interface BackendSprint {
  id: string;
  name: string;
  status: string;
  projectId: string;
  projectName?: string;
  tickets?: BackendTicket[];
}

function toTitleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


function mapStatus(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'Active', ON_HOLD: 'On Hold', COMPLETED: 'Completed', ARCHIVED: 'Archived',
  };
  return map[status] ?? toTitleCase(status);
}

export function Dashboard() {
  const { user, theme } = useAuth();
  const role = user?.role || 'DEVELOPER';
  const colors = getThemeColors(theme);

  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Developer-specific state
  const [myTickets, setMyTickets] = useState<(BackendTicket & { projectName: string; sprintName: string })[]>([]);

  // Planned vs Actual chart project selector
  const [selectedChartId, setSelectedChartId] = useState('');
  const [chartSearch, setChartSearch] = useState('');
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);

  const fetchDashboard = useCallback(async (showSpinner = false) => {
    if (!user) return;
    if (showSpinner) setLoading(true);
    try {
      const { projects: projectList } = await authFetch<{ projects: BackendProject[] }>('/projects');

      if (role === 'DEVELOPER') {
        const sprintResults = await Promise.allSettled(
          projectList.map(p => authFetch<{ sprints: BackendSprint[] }>(`/sprints/project/${p.id}`))
        );

        const allSprintsByProject: { sprint: BackendSprint; projectName: string }[] = [];
        sprintResults.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            (result.value.sprints ?? []).forEach(sprint => {
              allSprintsByProject.push({ sprint, projectName: projectList[i].name });
            });
          }
        });

        const ticketResults = await Promise.allSettled(
          allSprintsByProject.map(({ sprint }) =>
            authFetch<{ tickets: BackendTicket[] }>(`/tickets/sprint/${sprint.id}`)
          )
        );

        const gathered: (BackendTicket & { projectName: string; sprintName: string })[] = [];
        ticketResults.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            (result.value.tickets ?? [])
              .filter(t => t.assignedToId === user!.id)
              .forEach(ticket => {
                gathered.push({
                  ...ticket,
                  projectName: allSprintsByProject[i].projectName,
                  sprintName: allSprintsByProject[i].sprint.name,
                });
              });
          }
        });
        setMyTickets(gathered);
        setProjects(projectList.map(p => ({ ...p, analytics: null })));
      } else {
        const analyticsResults = await Promise.allSettled(
          projectList.map(p => authFetch<Analytics>(`/analytics/project/${p.id}/dashboard`))
        );

        const enriched: EnrichedProject[] = projectList.map((p, i) => ({
          ...p,
          analytics: analyticsResults[i].status === 'fulfilled'
            ? (analyticsResults[i] as PromiseFulfilledResult<Analytics>).value
            : null,
        }));
        setProjects(enriched);
      }
      setLastUpdated(new Date());
    } catch {
      setProjects([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [user, role]);

  // Initial load with spinner
  useEffect(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  // Poll every 30s — silent background refresh
  usePolling(() => fetchDashboard(false), 30_000, !!user);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]'}`} />
      </div>
    );
  }

  // ─── DEVELOPER VIEW ───────────────────────────────────────────────────────
  if (role === 'DEVELOPER') {
    const completedTickets = myTickets.filter(t => t.status === 'DONE').length;
    const inProgressTickets = myTickets.filter(t => t.status === 'IN_PROGRESS').length;
    const blockedTickets = myTickets.filter(t => t.status === 'BLOCKED').length;
    const totalTickets = myTickets.length;
    const totalStoryPoints = myTickets.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const completionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0;

    // Real daily completions for Mon–Fri of the current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...6=Sat
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const weeklyData = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((day, i) => {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
      const completed = myTickets.filter(t => {
        if (t.status !== 'DONE' || !t.completedAt) return false;
        const d = new Date(t.completedAt);
        return d >= dayStart && d < dayEnd;
      }).length;
      return { id: day, day, completed };
    });

    const statusLabel: Record<string, string> = {
      TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review',
      BLOCKED: 'Blocked', DONE: 'Done', CANCELLED: 'Cancelled',
    };
    const priorityLabel: Record<string, string> = {
      LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical',
    };

    return (
      <div className={`min-h-screen ${colors.bg}`}>
        <Header
          title="Mi Dashboard"
          subtitle={lastUpdated
            ? `Bienvenido, ${user!.name} · actualizado ${lastUpdated.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : `Bienvenido, ${user!.name} 👨‍💻`}
        />

        <motion.div className="p-8 space-y-8" initial="hidden" animate="show" variants={containerVariants}>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants}>
            <motion.div variants={itemVariants}><KPICard title="Mis Tareas" value={totalTickets} icon={ListTodo} trend="up" /></motion.div>
            <motion.div variants={itemVariants}><KPICard title="Completadas" value={completedTickets} icon={CheckCircle2} variant="default" /></motion.div>
            <motion.div variants={itemVariants}><KPICard title="En Progreso" value={inProgressTickets} icon={Code} trend="up" /></motion.div>
            <motion.div variants={itemVariants}><KPICard title="Story Points" value={totalStoryPoints} icon={Trophy} variant="default" /></motion.div>
          </motion.div>

          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
            <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-6`} variants={itemVariants}>
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Actividad Semanal</h3>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>Tickets completados esta semana</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                  <XAxis dataKey="day" stroke={colors.chartAxis} />
                  <YAxis stroke={colors.chartAxis} />
                  <Tooltip contentStyle={{ backgroundColor: colors.chartTooltipBg, border: `1px solid ${colors.chartTooltipBorder}`, borderRadius: '8px', color: theme === 'dark' ? '#FFFFFF' : '#29251D' }} />
                  <Bar dataKey="completed" fill={theme === 'dark' ? '#E31837' : '#5F0229'} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-6`} variants={itemVariants}>
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Mis Estadísticas</h3>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>Resumen de tu desempeño</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Tasa de Completado', value: `${completionRate}%`, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'Story Points', value: totalStoryPoints, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Bloqueadas', value: blockedTickets, icon: AlertTriangle, color: theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]', bg: theme === 'dark' ? 'bg-[#E31837]/10' : 'bg-[#5F0229]/10' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`flex items-center justify-between p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <p className={`text-sm ${colors.textSecondary}`}>{label}</p>
                        <p className={`text-xl font-bold ${colors.textPrimary}`}>{value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl overflow-hidden`} variants={itemVariants}>
            <div className={`p-6 border-b ${colors.border}`}>
              <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Mis Tareas</h3>
              <p className={`text-sm ${colors.textSecondary} mt-1`}>Tickets asignados a mí</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${colors.border} ${theme === 'dark' ? 'bg-[#0F0F0F]/50' : 'bg-[#4A453D]/5'}`}>
                    {['Ticket', 'Proyecto', 'Pts', 'Estado', 'Prioridad'].map(h => (
                      <th key={h} className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-[#4A453D]/10'}`}>
                  {myTickets.length === 0 ? (
                    <tr><td colSpan={5} className={`px-6 py-8 text-center text-sm ${colors.textSecondary}`}>No tienes tickets asignados</td></tr>
                  ) : myTickets.map((ticket, index) => (
                    <motion.tr key={ticket.id} className={`${colors.hover} transition-all duration-200 cursor-pointer`}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${colors.textPrimary}`}>{ticket.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${colors.textSecondary}`}>{ticket.projectName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${colors.textPrimary}`}>{ticket.storyPoints ?? '–'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={ticket.status === 'DONE' ? 'default' : ticket.status === 'BLOCKED' ? 'danger' : 'default'}>
                          {statusLabel[ticket.status] ?? ticket.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL'
                            ? theme === 'dark' ? 'bg-[#E31837]/10 text-[#E31837]' : 'bg-[#5F0229]/10 text-[#5F0229]'
                            : ticket.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {priorityLabel[ticket.priority] ?? ticket.priority}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ─── ADMIN / PM VIEW ──────────────────────────────────────────────────────
  const totalProgress = projects.length > 0
    ? Math.round(projects.reduce((s, p) => s + (p.analytics?.kpis.progress ?? 0), 0) / projects.length)
    : 0;
  const avgSV = projects.length > 0
    ? Math.round(projects.reduce((s, p) => s + (p.analytics?.kpis.scheduleVariance ?? 0), 0) / projects.length)
    : 0;
  const totalDelayed = projects.reduce((s, p) => s + (p.analytics?.kpis.delayedMilestones ?? 0), 0);
  const riskCounts = projects.reduce((acc, p) => {
    const r = p.analytics?.kpis.risk ?? p.riskLevel;
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const overallRisk = riskCounts['HIGH'] ? 'High' : riskCounts['MEDIUM'] ? 'Medium' : 'Low';

  const progressTrend: 'up' | 'down' | 'neutral' = avgSV > 0 ? 'up' : avgSV < 0 ? 'down' : 'neutral';
  const svTrend: 'up' | 'down' | 'neutral' = avgSV > 0 ? 'up' : avgSV < 0 ? 'down' : 'neutral';
  const activeProjects = projects.filter(p => p.status === 'ACTIVE');

  const effectiveChartId = selectedChartId || projects.find(p => p.analytics)?.id || '';
  const chartProject = projects.find(p => p.id === effectiveChartId);
  const chartData = chartProject?.analytics?.progressHistory ?? [];
  const filteredChartProjects = projects.filter(p =>
    p.analytics && p.name.toLowerCase().includes(chartSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      <Header
        title="Dashboard"
        subtitle={
          lastUpdated
            ? `Vista general · actualizado ${lastUpdated.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : 'Vista general de todos tus proyectos'
        }
      />

      <motion.div className="p-8 space-y-8" initial="hidden" animate="show" variants={containerVariants}>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants}>
          <motion.div variants={itemVariants} className="relative">
            <KPICard title="Avance Global" value={`${totalProgress}%`} icon={TrendingUp} trend={progressTrend} />
            <div className="absolute top-3 right-3">
              <InfoTooltip text="Promedio del progreso real de todos los proyectos activos. Se calcula como: (story points DONE ÷ story points totales × 100) promediado entre todos los proyectos." />
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <KPICard title="Schedule Variance Prom." value={`${avgSV}%`} icon={Clock} trend={svTrend} variant={avgSV < 0 ? 'danger' : 'default'} />
            <div className="absolute top-3 right-3">
              <InfoTooltip text="Diferencia promedio entre el avance real y el avance planeado. Planeado = días transcurridos ÷ días totales × 100. Positivo = adelantado, negativo = retrasado." />
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <KPICard title="Hitos Retrasados" value={totalDelayed} icon={AlertTriangle} variant="danger" />
            <div className="absolute top-3 right-3">
              <InfoTooltip text="Total de tickets con dueDate ya vencida que aún no están en DONE ni CANCELLED, sumados de todos los proyectos activos." />
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <KPICard title="Nivel de Riesgo General" value={overallRisk} icon={Activity} variant={overallRisk === 'High' ? 'danger' : 'default'} />
            <div className="absolute top-3 right-3">
              <InfoTooltip text="Riesgo operacional calculado automáticamente: HIGH si ≥3 bloqueados/vencidos o SPI<0.8, MEDIUM si ≥1. Puede diferir del riesgo asignado manualmente en cada proyecto." />
            </div>
          </motion.div>
        </motion.div>

        <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-6`} variants={itemVariants}>
          {/* Header + project selector */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Planned vs Actual</h3>
                <InfoTooltip
                  text="Evolución del avance planeado vs real a lo largo del tiempo para el proyecto seleccionado. Planeado = tiempo transcurrido ÷ duración total × 100. Real = story points DONE ÷ totales × 100."
                  position="bottom"
                />
              </div>
              <p className={`text-sm ${colors.textSecondary} mt-1`}>
                {chartProject ? chartProject.name : 'Selecciona un proyecto'}
              </p>
            </div>
            {/* Searchable project selector */}
            <div className="relative w-full sm:w-64">
              <div className={`flex items-center gap-2 bg-[#0F0F0F]/60 border ${colors.border} rounded-lg px-3 py-2`}>
                <Search className="w-4 h-4 text-[#8E8E93] flex-shrink-0" />
                <input
                  type="text"
                  value={chartDropdownOpen ? chartSearch : (chartProject?.name ?? '')}
                  onChange={(e) => setChartSearch(e.target.value)}
                  onFocus={() => { setChartSearch(''); setChartDropdownOpen(true); }}
                  onBlur={() => setTimeout(() => setChartDropdownOpen(false), 150)}
                  placeholder="Buscar proyecto..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#8E8E93] focus:outline-none min-w-0"
                />
                <ChevronDown className={`w-4 h-4 text-[#8E8E93] flex-shrink-0 transition-transform ${chartDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {chartDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1C1C1E] border border-white/10 rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto">
                  {filteredChartProjects.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-[#8E8E93] text-center">Sin resultados</div>
                  ) : filteredChartProjects.map(p => (
                    <button
                      key={p.id}
                      onMouseDown={() => { setSelectedChartId(p.id); setChartSearch(''); setChartDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/5 ${p.id === effectiveChartId ? 'text-[#E31837] font-medium' : 'text-white'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          {chartData.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-[280px] gap-2 text-sm ${colors.textSecondary}`}>
              <span>Sin historial de progreso para este proyecto</span>
              {chartProject && (
                <span className="text-xs opacity-60">
                  Planeado: {chartProject.analytics?.kpis.plannedProgress ?? 0}% · Real: {chartProject.analytics?.kpis.progress ?? 0}%
                </span>
              )}
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDashPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme === 'dark' ? '#3A3A3C' : '#C4BEB4'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme === 'dark' ? '#3A3A3C' : '#C4BEB4'} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDashActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme === 'dark' ? '#E31837' : '#5F0229'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme === 'dark' ? '#E31837' : '#5F0229'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                  <XAxis dataKey="date" stroke={colors.chartAxis} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke={colors.chartAxis} unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: colors.chartTooltipBg, border: `1px solid ${colors.chartTooltipBorder}`, borderRadius: '8px', color: theme === 'dark' ? '#FFFFFF' : '#29251D' }}
                    formatter={(v: number) => [`${v}%`]}
                  />
                  <Area type="monotone" dataKey="planned" name="Planeado" stroke={theme === 'dark' ? '#3A3A3C' : '#C4BEB4'} fill="url(#gDashPlanned)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="actual" name="Real" stroke={theme === 'dark' ? '#E31837' : '#5F0229'} fill="url(#gDashActual)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-3 justify-center">
                <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                  <div className="w-3 h-0.5" style={{ background: theme === 'dark' ? '#3A3A3C' : '#C4BEB4' }} /> Planeado
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                  <div className="w-3 h-0.5" style={{ background: theme === 'dark' ? '#E31837' : '#5F0229' }} /> Real
                </div>
              </div>
            </>
          )}
        </motion.div>

        <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl overflow-hidden`} variants={itemVariants}>
          <div className={`p-6 border-b ${colors.border} flex items-center justify-between`}>
            <div>
              <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Proyectos Activos</h3>
              <p className={`text-sm ${colors.textSecondary} mt-1`}>Gestiona y monitorea tus proyectos</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${colors.border} ${theme === 'dark' ? 'bg-[#0F0F0F]/50' : 'bg-[#4A453D]/5'}`}>
                  {[
                    { label: 'Proyecto', tip: null },
                    { label: '% Avance', tip: 'Story points completados (DONE) ÷ story points totales × 100. Mide cuánto trabajo real se ha entregado.' },
                    { label: 'SV', tip: 'Schedule Variance: avance real % − avance planeado %. El avance planeado se calcula como días transcurridos ÷ duración total × 100. Verde = adelantado, rojo = retrasado.' },
                    { label: 'Riesgo', tip: 'HIGH si ≥3 tickets bloqueados, ≥3 retrasados o SPI < 0.8. MEDIUM si ≥1 de cualquiera. LOW si el proyecto va bien sin bloqueos ni retrasos.' },
                    { label: 'Estado', tip: null },
                    { label: 'Acción', tip: null },
                  ].map(({ label, tip }) => (
                    <th key={label} className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                      <div className="flex items-center gap-1.5">
                        {label}
                        {tip && <InfoTooltip text={tip} position="bottom" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-[#4A453D]/10'}`}>
                {activeProjects.length === 0 ? (
                  <tr><td colSpan={6} className={`px-6 py-8 text-center text-sm ${colors.textSecondary}`}>No hay proyectos activos</td></tr>
                ) : activeProjects.map((project, index) => {
                  const progress = project.analytics?.kpis.progress ?? 0;
                  const sv = project.analytics?.kpis.scheduleVariance ?? 0;
                  const risk = mapRisk(project.analytics?.kpis.risk ?? project.riskLevel);
                  const status = mapStatus(project.status);

                  return (
                    <motion.tr key={project.id} className={`${colors.hover} transition-all duration-200 group cursor-pointer`}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                            <Activity className={`w-5 h-5 ${theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]'}`} />
                          </div>
                          <span className={`text-sm font-medium ${colors.textPrimary}`}>{project.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex-1 h-2 ${colors.bg} rounded-full overflow-hidden max-w-[100px]`}>
                            <motion.div className={`h-full ${theme === 'dark' ? 'bg-[#E31837]' : 'bg-[#5F0229]'} rounded-full`}
                              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: index * 0.1 }} />
                          </div>
                          <span className={`text-sm ${colors.textPrimary} font-medium`}>{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${sv < 0 ? theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]' : 'text-green-500'}`}>
                          {sv > 0 ? '+' : ''}{sv}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          risk === 'High' || risk === 'Critical'
                            ? theme === 'dark' ? 'bg-[#E31837]/10 text-[#E31837]' : 'bg-[#5F0229]/10 text-[#5F0229]'
                            : risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {risk}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          status === 'Active' ? 'bg-blue-500/10 text-blue-500'
                            : status === 'On Hold' ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/project/${project.id}`}>
                          <motion.button className={`text-sm ${theme === 'dark' ? 'text-[#E31837] hover:text-[#C41530]' : 'text-[#5F0229] hover:text-[#4A0120]'} font-medium flex items-center gap-1`}
                            whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                            Ver detalles →
                          </motion.button>
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
