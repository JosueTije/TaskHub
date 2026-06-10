import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Target, Activity, Clock, AlertTriangle,
  Users, CheckCircle2, BarChart3, Shield, Award, ListTodo,
  Loader2, ChevronDown, ChevronUp, Search,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { InfoTooltip } from '../components/InfoTooltip';
import { authFetch } from '../../services/api';
import { useAuth } from '../contexts/AuthContext';
import { normalize } from '../../utils/formatters';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project { id: string; name: string; status: string; }

interface KPIs {
  progress: number; plannedProgress: number;
  completedStoryPoints: number; totalStoryPoints: number;
  blockedTickets: number; delayedMilestones: number;
  scheduleVariance: number; spi: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH'; officialRiskLevel?: string | null;
  estimatedHours: number; actualHours: number;
  hoursVariance: number; efficiency: number | null;
}

interface ProgressPoint { date: string; planned: number; actual: number; }
interface VelocityPoint { sprint: string; velocity: number; commitment: number; }
interface BurndownPoint { day: string; remaining: number; ideal: number; completed: number; }

interface ActiveSprint {
  id: string; name: string; daysRemaining: number;
  isExpired: boolean; daysOverdue: number; totalDays: number;
  capacity: number | null;
  ticketCounts: { total: number; done: number; inProgress: number; blocked: number; todo: number; cancelled: number; };
  burndown: BurndownPoint[];
  ticketsByPriority: { priority: string; completed: number; total: number; }[];
  teamPerformance: { name: string; completed: number; inProgress: number; }[];
}

interface TeamMember {
  id: string; name: string;
  tasksAssigned: number; ticketsCompleted: number; activeBlockers: number;
  estimationAccuracy: number | null; points: number; performance: number;
  priorityDistribution: { name: string; value: number; color: string; }[];
  weeklyEvolution: { week: string; tickets: number; points: number; }[];
  recentTickets: { id: string; title: string; priority: string; status: string; estimatedHours: number | null; actualHours: number | null; }[];
}

interface MetricsData {
  kpis: KPIs; progressHistory: ProgressPoint[];
  velocityHistory: VelocityPoint[];
  activeSprint: ActiveSprint | null; teamMetrics: TeamMember[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RISK_COLOR: Record<string, string> = { LOW: '#34C759', MEDIUM: '#FF9F0A', HIGH: '#FF3B30' };
const RISK_LABEL: Record<string, string> = { LOW: 'Bajo', MEDIUM: 'Medio', HIGH: 'Alto' };
const PRIORITY_COLOR: Record<string, string> = { CRITICAL: '#FF3B30', HIGH: '#FF9F0A', MEDIUM: '#007AFF', LOW: '#34C759' };
const STATUS_LABEL: Record<string, string> = {
  TODO: 'Por hacer', IN_PROGRESS: 'En progreso', IN_REVIEW: 'En revisión',
  DONE: 'Listo', BLOCKED: 'Bloqueado', CANCELLED: 'Cancelado',
};

function makeColors(theme: 'dark' | 'light') {
  const dark = theme === 'dark';
  return {
    bg:           dark ? 'bg-[#0F0F0F]'           : 'bg-[#F6F2EA]',
    card:         dark ? 'bg-[#1C1C1E]'           : 'bg-white',
    cardDeep:     dark ? 'bg-[#0F0F0F]'           : 'bg-[#E5DFD3]',
    border:       dark ? 'border-white/10'         : 'border-[#4A453D]/10',
    text:         dark ? 'text-white'              : 'text-[#29251D]',
    textMuted:    dark ? 'text-[#8E8E93]'         : 'text-[#4A453D]',
    input:        dark ? 'bg-[#1C1C1E] border-white/10 text-white placeholder-[#8E8E93]'
                       : 'bg-white border-[#4A453D]/10 text-[#29251D] placeholder-[#4A453D]',
    dropdownBg:   dark ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-[#4A453D]/10',
    dropdownItem: dark ? 'hover:bg-white/5 text-white'  : 'hover:bg-[#E5DFD3] text-[#29251D]',
    hoverRow:     dark ? 'hover:bg-white/5'         : 'hover:bg-[#E5DFD3]/60',
    devBorder:    dark ? 'border-white/10'          : 'border-[#4A453D]/10',
    expandedBorder: dark ? 'border-white/10'        : 'border-[#4A453D]/10',
    // Chart tokens
    chartGrid:    dark ? '#ffffff08'               : '#00000008',
    chartTick:    dark ? '#8E8E93'                 : '#4A453D',
    chartTooltipBg:     dark ? '#1C1C1E'          : '#FFFFFF',
    chartTooltipBorder: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
    chartTooltipLabel:  dark ? '#ffffff'           : '#29251D',
    chartTooltipItem:   dark ? '#8E8E93'           : '#4A453D',
    velocityBar:  dark ? '#3A3A3C'                 : '#D1CBC0',
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color = '#FF3B30', trend, tip, c }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string; trend?: 'up' | 'down' | 'neutral'; tip?: string;
  c: ReturnType<typeof makeColors>;
}) {
  return (
    <div className={`${c.card} border ${c.border} rounded-xl p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> :
          trend === 'down' ? <TrendingDown className="w-4 h-4 text-[#FF3B30]" /> : null
        )}
      </div>
      <div className={`text-2xl font-bold ${c.text} mb-1`}>{value}</div>
      <div className={`flex items-center gap-1 text-xs ${c.textMuted}`}>
        <span>{label}</span>
        {tip && <InfoTooltip text={tip} position="top" />}
      </div>
      {sub && <div className={`text-xs ${c.textMuted} mt-0.5`}>{sub}</div>}
    </div>
  );
}

function Section({ title, tip, children, c }: {
  title: React.ReactNode; tip?: string;
  children: React.ReactNode; c: ReturnType<typeof makeColors>;
}) {
  return (
    <div className="mb-8">
      <h2 className={`text-base font-semibold ${c.text} mb-4 flex items-center gap-2`}>
        {title}
        {tip && <InfoTooltip text={tip} position="right" />}
      </h2>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Metrics() {
  const { user, theme } = useAuth();
  const c = makeColors(theme);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [data, setData] = useState<MetricsData | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [expandedDev, setExpandedDev] = useState<string | null>(null);
  const [closingSprint, setClosingSprint] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');

  useEffect(() => {
    authFetch<{ projects: Project[] }>('/projects')
      .then((res) => {
        const active = res.projects.filter((p) => p.status !== 'ARCHIVED');
        setProjects(active);
        if (active.length > 0) setSelectedId(active[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, []);

  const loadMetrics = useCallback(async (id: string) => {
    if (!id) return;
    setLoadingMetrics(true);
    setData(null);
    try {
      const res = await authFetch<MetricsData>(`/analytics/project/${id}/metrics`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadMetrics(selectedId);
  }, [selectedId, loadMetrics]);

  const closeSprint = useCallback(async (sprintId: string) => {
    setClosingSprint(true);
    try {
      await authFetch(`/sprints/${sprintId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (selectedId) loadMetrics(selectedId);
    } catch {
      // sprint close failed silently — user can retry
    } finally {
      setClosingSprint(false);
    }
  }, [selectedId, loadMetrics]);

  if (loadingProjects) {
    return (
      <div className={`min-h-screen ${c.bg} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3B30]" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={`min-h-screen ${c.bg}`}>
        <Header title="Métricas" subtitle="Análisis de rendimiento del proyecto" />
        <div className={`p-8 text-center ${c.textMuted}`}>No hay proyectos disponibles.</div>
      </div>
    );
  }

  const kpis = data?.kpis;

  // Shared chart tooltip style
  const tooltipStyle = {
    contentStyle: { background: c.chartTooltipBg, border: c.chartTooltipBorder, borderRadius: 8 },
    labelStyle: { color: c.chartTooltipLabel, fontSize: 12 },
    itemStyle: { color: c.chartTooltipItem, fontSize: 12 },
  };

  return (
    <div className={`min-h-screen ${c.bg}`}>
      <Header title="Métricas" subtitle="Análisis de rendimiento del proyecto" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto">

        {/* Project selector */}
        <div className={`${c.card} border ${c.border} rounded-xl p-4 mb-8 flex items-center gap-4 flex-wrap`}>
          <BarChart3 className="w-5 h-5 text-[#FF3B30] flex-shrink-0" />
          <span className={`text-sm ${c.textMuted} flex-shrink-0`}>Proyecto:</span>
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <div className={`flex items-center gap-2 ${c.cardDeep} border ${c.border} rounded-lg px-3 py-1.5 focus-within:border-[#FF3B30] transition-colors`}>
              <Search className={`w-4 h-4 ${c.textMuted} flex-shrink-0`} />
              <input
                type="text"
                value={projectDropdownOpen ? projectSearch : (projects.find(p => p.id === selectedId)?.name ?? '')}
                onChange={(e) => setProjectSearch(e.target.value)}
                onFocus={() => { setProjectSearch(''); setProjectDropdownOpen(true); }}
                onBlur={() => setTimeout(() => setProjectDropdownOpen(false), 150)}
                placeholder="Buscar proyecto..."
                className={`flex-1 bg-transparent text-sm focus:outline-none min-w-0 ${c.text}`}
                style={{ caretColor: '#FF3B30' }}
              />
              <ChevronDown className={`w-4 h-4 ${c.textMuted} flex-shrink-0 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {projectDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1 ${c.dropdownBg} border rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto`}>
                {projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())).length === 0 ? (
                  <div className={`px-3 py-3 text-sm ${c.textMuted} text-center`}>Sin resultados</div>
                ) : projects
                    .filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
                    .map(p => (
                      <button
                        key={p.id}
                        onMouseDown={() => { setSelectedId(p.id); setProjectSearch(''); setProjectDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${c.dropdownItem} ${p.id === selectedId ? 'text-[#FF3B30] font-medium' : ''}`}
                      >
                        {p.name}
                      </button>
                    ))
                }
              </div>
            )}
          </div>
        </div>

        {loadingMetrics && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF3B30]" />
          </div>
        )}

        {!loadingMetrics && data && kpis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

            {/* ── Strategic KPIs ── */}
            <Section c={c} title="KPIs Estratégicos" tip="Indicadores clave que miden el desempeño global del proyecto: avance, puntualidad, riesgo y eficiencia de cronograma.">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <KpiCard c={c} label="Progreso Real" value={`${kpis.progress}%`} sub={`Planeado: ${kpis.plannedProgress}%`} icon={Target} color="#007AFF" trend={kpis.progress >= kpis.plannedProgress ? 'up' : 'down'} tip="Story points completados (DONE) ÷ story points totales × 100." />
                <KpiCard c={c} label="Varianza Cronograma" value={`${kpis.scheduleVariance > 0 ? '+' : ''}${kpis.scheduleVariance}pp`} icon={Activity} color={kpis.scheduleVariance >= 0 ? '#34C759' : '#FF3B30'} trend={kpis.scheduleVariance >= 0 ? 'up' : 'down'} tip="Progreso Real − Progreso Planeado en puntos porcentuales (pp)." />
                <KpiCard c={c} label="SPI" value={kpis.spi} sub={kpis.spi >= 1 ? 'A tiempo' : 'Retrasado'} icon={TrendingUp} color={kpis.spi >= 1 ? '#34C759' : kpis.spi >= 0.8 ? '#FF9F0A' : '#FF3B30'} trend={kpis.spi >= 1 ? 'up' : 'down'} tip="Schedule Performance Index: Progreso Real ÷ Progreso Planeado." />
                <KpiCard c={c} label="Tickets Vencidos" value={kpis.delayedMilestones} icon={Clock} color={kpis.delayedMilestones === 0 ? '#34C759' : '#FF9F0A'} trend={kpis.delayedMilestones === 0 ? 'neutral' : 'down'} tip="Tickets con fecha límite vencida que aún no están completados." />
                <KpiCard c={c} label="Riesgo operacional" value={RISK_LABEL[kpis.risk]} sub={kpis.officialRiskLevel && kpis.officialRiskLevel !== kpis.risk ? `Asignado: ${RISK_LABEL[kpis.officialRiskLevel] ?? kpis.officialRiskLevel} · ${kpis.blockedTickets} bloqueados` : `${kpis.blockedTickets} bloqueados`} icon={Shield} color={RISK_COLOR[kpis.risk]} tip="Riesgo calculado: ALTO si ≥3 bloqueados/vencidos o SPI<0.8; MEDIO si ≥1 o SPI<1." />
              </div>
            </Section>

            {/* ── Hours ── */}
            <Section c={c} title="Métricas de Horas" tip="Comparativa entre horas estimadas y horas realmente trabajadas en todos los tickets completados.">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard c={c} label="Horas Estimadas" value={`${kpis.estimatedHours}h`} icon={Clock} color="#007AFF" tip="Suma de horas estimadas en todos los tickets DONE." />
                <KpiCard c={c} label="Horas Reales" value={`${kpis.actualHours}h`} icon={Activity} color="#FF9F0A" tip="Suma de horas realmente trabajadas en tickets DONE." />
                <KpiCard c={c} label="Varianza Horas" value={`${kpis.hoursVariance > 0 ? '+' : ''}${kpis.hoursVariance}h`} icon={TrendingUp} color={kpis.hoursVariance <= 0 ? '#34C759' : '#FF3B30'} trend={kpis.hoursVariance <= 0 ? 'up' : 'down'} tip="Horas Reales − Horas Estimadas. Negativo = dentro del presupuesto." />
                <KpiCard c={c} label="Eficiencia" value={kpis.efficiency != null ? `${kpis.efficiency}x` : '0x'} sub={kpis.efficiency != null ? (kpis.efficiency >= 1 ? 'Eficiente' : 'Por encima del estimado') : 'Sin datos'} icon={Award} color={kpis.efficiency != null && kpis.efficiency >= 1 ? '#34C759' : '#FF9F0A'} tip="Horas Estimadas ÷ Horas Reales. ≥1.0 = dentro del presupuesto." />
              </div>
            </Section>

            {/* ── Planned vs Actual ── */}
            {data.progressHistory.length > 0 && (
              <Section c={c} title="Progreso Planeado vs Real" tip="Evolución temporal del % completado real vs el % planeado según cronograma.">
                <div className={`${c.card} border ${c.border} rounded-xl p-5`}>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data.progressHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gPlanned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8E8E93" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8E8E93" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
                      <XAxis dataKey="date" tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`]} />
                      <Area type="monotone" dataKey="planned" name="Planeado" stroke="#8E8E93" fill="url(#gPlanned)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="actual" name="Real" stroke="#FF3B30" fill="url(#gActual)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-6 mt-3 justify-center">
                    <div className={`flex items-center gap-2 text-xs ${c.textMuted}`}><div className="w-3 h-0.5 bg-[#8E8E93]" /> Planeado</div>
                    <div className={`flex items-center gap-2 text-xs ${c.textMuted}`}><div className="w-3 h-0.5 bg-[#FF3B30]" /> Real</div>
                  </div>
                </div>
              </Section>
            )}

            {/* ── Velocity ── */}
            {data.velocityHistory.length > 0 && (
              <Section c={c} title="Velocidad por Sprint" tip="Story points completados vs comprometidos al inicio del sprint.">
                <div className={`${c.card} border ${c.border} rounded-xl p-5`}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.velocityHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
                      <XAxis dataKey="sprint" tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="commitment" name="Comprometido" fill={c.velocityBar} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="velocity" name="Velocidad" fill="#FF3B30" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-6 mt-3 justify-center">
                    <div className={`flex items-center gap-2 text-xs ${c.textMuted}`}><div className="w-3 h-3 rounded" style={{ background: c.velocityBar }} /> Comprometido</div>
                    <div className={`flex items-center gap-2 text-xs ${c.textMuted}`}><div className="w-3 h-3 rounded bg-[#FF3B30]" /> Velocidad</div>
                  </div>
                </div>
              </Section>
            )}

            {/* ── Active Sprint ── */}
            {data.activeSprint && (
              <>
                {data.activeSprint.isExpired && (
                  <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-orange-400">
                          Sprint vencido hace {data.activeSprint.daysOverdue} día{data.activeSprint.daysOverdue !== 1 ? 's' : ''}
                        </p>
                        <p className={`text-xs ${c.textMuted} mt-0.5`}>
                          "{data.activeSprint.name}" sigue marcado como activo pero su fecha de fin ya pasó.
                          {(user?.role === 'ADMIN' || user?.role === 'PM') ? ' Ciérralo para iniciar el siguiente sprint.' : ' Contacta al PM o Admin para cerrarlo.'}
                        </p>
                      </div>
                    </div>
                    {(user?.role === 'ADMIN' || user?.role === 'PM') && (
                      <button
                        onClick={() => closeSprint(data.activeSprint!.id)}
                        disabled={closingSprint}
                        className="px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                      >
                        {closingSprint && <Loader2 className="w-3 h-3 animate-spin" />}
                        Cerrar sprint
                      </button>
                    )}
                  </div>
                )}

                <Section c={c} title={`Sprint Activo — ${data.activeSprint.name}`} tip="Estado en tiempo real del sprint en curso: días restantes, tickets por estado, burndown y distribución por prioridad.">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Sprint summary */}
                    <div className={`${c.card} border ${c.border} rounded-xl p-5 space-y-4`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`flex items-center gap-1 ${c.textMuted}`}>
                          Días restantes <InfoTooltip text="Días calendario que quedan hasta el fin del sprint." position="right" />
                        </span>
                        <span className={`${c.text} font-semibold`}>{data.activeSprint.daysRemaining} / {data.activeSprint.totalDays}</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-[#4A453D]/10'}`}>
                        <div
                          className="h-full bg-[#FF3B30] rounded-full"
                          style={{ width: `${Math.round(((data.activeSprint.totalDays - data.activeSprint.daysRemaining) / data.activeSprint.totalDays) * 100)}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Total', value: data.activeSprint.ticketCounts.total, color: '#8E8E93', tip: 'Cantidad total de tickets incluidos en este sprint.' },
                          { label: 'Completados', value: data.activeSprint.ticketCounts.done, color: '#34C759', tip: 'Tickets en estado DONE.' },
                          { label: 'En progreso', value: data.activeSprint.ticketCounts.inProgress, color: '#007AFF', tip: 'Tickets en estado IN_PROGRESS o IN_REVIEW.' },
                          { label: 'Bloqueados', value: data.activeSprint.ticketCounts.blocked, color: '#FF3B30', tip: 'Tickets en estado BLOCKED.' },
                          { label: 'Por hacer', value: data.activeSprint.ticketCounts.todo ?? 0, color: '#8E8E93', tip: 'Tickets en estado TODO.' },
                          { label: 'Cancelados', value: data.activeSprint.ticketCounts.cancelled ?? 0, color: '#8E8E93', tip: 'Tickets cancelados dentro del sprint.' },
                        ].map((item) => (
                          <div key={item.label} className={`${c.cardDeep} rounded-lg p-3`}>
                            <div className="text-xl font-bold" style={{ color: item.color }}>{item.value}</div>
                            <div className={`flex items-center gap-1 text-xs ${c.textMuted}`}>
                              <span>{item.label}</span>
                              <InfoTooltip text={item.tip} position="top" />
                            </div>
                          </div>
                        ))}
                      </div>
                      {data.activeSprint.ticketsByPriority.length > 0 && (
                        <div className="space-y-2">
                          <div className={`text-xs ${c.textMuted} font-medium`}>Por prioridad</div>
                          {data.activeSprint.ticketsByPriority.map((p) => (
                            <div key={p.priority} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLOR[p.priority] ?? '#8E8E93' }} />
                              <span className={`text-xs ${c.textMuted} w-20 flex-shrink-0`}>{p.priority}</span>
                              <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-[#4A453D]/10'}`}>
                                <div className="h-full rounded-full" style={{ width: `${Math.round((p.completed / p.total) * 100)}%`, background: PRIORITY_COLOR[p.priority] ?? '#8E8E93' }} />
                              </div>
                              <span className={`text-xs ${c.text} flex-shrink-0`}>{p.completed}/{p.total}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Burndown */}
                    {data.activeSprint.burndown.length > 0 && (
                      <div className={`${c.card} border ${c.border} rounded-xl p-5`}>
                        <div className={`text-sm font-medium ${c.text} mb-3 flex items-center gap-2`}>
                          Burndown Chart <InfoTooltip text="Muestra el trabajo restante vs la línea ideal. Si la línea real está por encima, el sprint va retrasado." position="bottom" />
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={data.activeSprint.burndown} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
                            <XAxis dataKey="day" tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip {...{ ...tooltipStyle, labelStyle: { ...tooltipStyle.labelStyle, fontSize: 11 }, itemStyle: { ...tooltipStyle.itemStyle, fontSize: 11 } }} />
                            <Line type="monotone" dataKey="ideal" name="Ideal" stroke={c.velocityBar} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                            <Line type="monotone" dataKey="remaining" name="Restante" stroke="#FF3B30" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="flex items-center gap-6 mt-2 justify-center">
                          <div className={`flex items-center gap-2 text-xs ${c.textMuted}`}><div className="w-4 border-t border-dashed" style={{ borderColor: c.velocityBar }} /> Ideal</div>
                          <div className={`flex items-center gap-2 text-xs ${c.textMuted}`}><div className="w-3 h-0.5 bg-[#FF3B30]" /> Restante</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              </>
            )}

            {/* ── Team Metrics ── */}
            {data.teamMetrics.length > 0 && (
              <Section c={c} title="Métricas del Equipo" tip="Rendimiento individual de cada developer. Haz clic para ver detalle: evolución semanal, tickets recientes y distribución por prioridad.">
                <div className="relative mb-4">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${c.textMuted} pointer-events-none`} />
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Buscar developer..."
                    className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#FF3B30] transition-colors ${c.input}`}
                  />
                </div>
                <div className="space-y-3">
                  {data.teamMetrics
                    .filter(dev => normalize(dev.name).includes(normalize(teamSearch)))
                    .map((dev) => {
                      const isExpanded = expandedDev === dev.id;
                      const isMe = dev.id === user?.id;
                      return (
                        <div key={dev.id} className={`${c.card} border rounded-xl overflow-hidden transition-colors ${isMe ? 'border-[#FF3B30]/40' : c.devBorder}`}>
                          <button
                            className={`w-full p-4 text-left ${c.hoverRow} transition-colors`}
                            onClick={() => setExpandedDev(isExpanded ? null : dev.id)}
                          >
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF3B30] to-[#FF9F0A] flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-white">{dev.name.charAt(0)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${c.text}`}>{dev.name}</span>
                                  {isMe && <span className="text-xs bg-[#FF3B30]/20 text-[#FF3B30] px-2 py-0.5 rounded-full">Tú</span>}
                                </div>
                                <div className={`text-xs ${c.textMuted}`}>{dev.tasksAssigned} tickets asignados</div>
                              </div>
                              <div className="flex items-center gap-6 flex-wrap">
                                {[
                                  { label: 'Completados', value: dev.ticketsCompleted, color: c.text, tip: 'Tickets en estado DONE asignados a este developer.' },
                                  { label: 'Rendimiento', value: `${dev.performance}%`, color: c.text, tip: 'Tickets completados ÷ tickets asignados × 100.' },
                                  { label: 'Precisión', value: dev.estimationAccuracy != null ? `${dev.estimationAccuracy}%` : 'N/A', color: c.text, tip: '% de tickets donde las horas reales no superaron el 115% de las estimadas.' },
                                  { label: 'Bloqueadores', value: dev.activeBlockers, color: dev.activeBlockers > 0 ? 'text-[#FF3B30]' : 'text-[#34C759]', tip: 'Tickets actualmente BLOQUEADOS asignados a este developer.' },
                                  { label: 'Puntos', value: dev.points, color: 'text-[#FF9F0A]', tip: 'Puntos de gamificación acumulados en el proyecto.' },
                                ].map(({ label, value, color, tip }) => (
                                  <div key={label} className="text-center">
                                    <div className={`text-sm font-bold ${color}`}>{value}</div>
                                    <div className={`flex items-center justify-center gap-1 text-xs ${c.textMuted}`}>
                                      <span>{label}</span>
                                      <InfoTooltip text={tip} position="top" />
                                    </div>
                                  </div>
                                ))}
                                {isExpanded ? <ChevronUp className={`w-4 h-4 ${c.textMuted}`} /> : <ChevronDown className={`w-4 h-4 ${c.textMuted}`} />}
                              </div>
                            </div>
                          </button>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div className={`border-t ${c.expandedBorder} p-4 grid grid-cols-1 lg:grid-cols-2 gap-6`}>

                              {/* Weekly evolution */}
                              <div>
                                <div className={`text-xs font-medium ${c.textMuted} mb-3`}>Evolución semanal</div>
                                <ResponsiveContainer width="100%" height={140}>
                                  <BarChart data={dev.weeklyEvolution} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
                                    <XAxis dataKey="week" tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip {...{ ...tooltipStyle, labelStyle: { ...tooltipStyle.labelStyle, fontSize: 11 }, itemStyle: { ...tooltipStyle.itemStyle, fontSize: 11 } }} />
                                    <Bar dataKey="tickets" name="Tickets" fill="#FF3B30" radius={[3, 3, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>

                              {/* Priority distribution + recent tickets */}
                              <div className="space-y-4">
                                {dev.priorityDistribution.length > 0 && (
                                  <div>
                                    <div className={`text-xs font-medium ${c.textMuted} mb-2`}>Tickets completados por prioridad</div>
                                    <div className="flex items-center gap-4">
                                      <PieChart width={80} height={80}>
                                        <Pie data={dev.priorityDistribution} cx={35} cy={35} innerRadius={20} outerRadius={35} dataKey="value" stroke="none">
                                          {dev.priorityDistribution.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                          ))}
                                        </Pie>
                                      </PieChart>
                                      <div className="space-y-1">
                                        {dev.priorityDistribution.map((p) => (
                                          <div key={p.name} className="flex items-center gap-2 text-xs">
                                            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                                            <span className={c.textMuted}>{p.name}</span>
                                            <span className={`${c.text} font-medium`}>{p.value}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {dev.recentTickets.length > 0 && (
                                  <div>
                                    <div className={`text-xs font-medium ${c.textMuted} mb-2`}>Tickets recientes</div>
                                    <div className="space-y-1.5">
                                      {dev.recentTickets.map((t) => (
                                        <div key={t.id} className={`flex items-center gap-2 ${c.cardDeep} rounded-lg px-3 py-2`}>
                                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLOR[t.priority] ?? '#8E8E93' }} />
                                          <span className={`text-xs ${c.text} truncate flex-1`}>{t.title}</span>
                                          <span className={`text-xs ${c.textMuted} flex-shrink-0`}>{STATUS_LABEL[t.status] ?? t.status}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </Section>
            )}

          </motion.div>
        )}

        {!loadingMetrics && !data && selectedId && (
          <div className={`text-center py-16 ${c.textMuted}`}>No se pudieron cargar las métricas del proyecto.</div>
        )}

      </div>
    </div>
  );
}
