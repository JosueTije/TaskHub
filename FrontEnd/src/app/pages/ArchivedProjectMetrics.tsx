import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import {
  Archive, Users, Calendar, FileText, CheckCircle, Clock,
  ChevronLeft, Loader2, AlertTriangle, TrendingUp,
} from 'lucide-react';
import { Header } from '../components/Header';
import { authFetch } from '../../services/api';
import { mapRisk, riskBadgeClass, formatDate } from '../../utils/formatters';

// ── Types ──────────────────────────────────────────────────────────────────

interface TicketRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number | null;
  assignedTo: { id: string; fullName: string; avatarUrl: string | null } | null;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
}

interface TeamMember {
  memberId: string;
  fullName: string;
  avatarUrl: string | null;
  ticketsCount: number;
  storyPointsCompleted: number;
}

interface SprintMetrics {
  ticketsByStatus: Record<string, number>;
  storyPoints: { planned: number; completed: number };
  teamAssignments: TeamMember[];
  timing: { plannedDays: number; actualDays: number | null; onTime: boolean | null };
}

interface SprintData {
  id: string;
  name: string;
  goal: string | null;
  status: string;
  startDate: string;
  endDate: string;
  completedAt: string | null;
  metrics: SprintMetrics;
  tickets: TicketRow[];
}

interface Totals {
  durationDays: { planned: number | null; actual: number | null };
  tickets: { total: number; byStatus: Record<string, number> };
  storyPoints: { planned: number; completed: number };
  completionRate: number;
  teamAssignments: TeamMember[];
}

interface ProjectInfo {
  id: string;
  name: string;
  code: string;
  status: string;
  riskLevel: string;
  startDate: string;
  targetEndDate: string;
  actualEndDate: string | null;
  archivedAt: string | null;
  pm: { id: string; fullName: string } | null;
  members: { id: string; fullName: string; role: string; avatarUrl: string | null }[];
}

interface HistoryData {
  project: ProjectInfo;
  sprints: SprintData[];
  totals: Totals;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En progreso',
  IN_REVIEW: 'En revisión',
  BLOCKED: 'Bloqueado',
  DONE: 'Hecho',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-zinc-500/10 text-zinc-400',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
  IN_REVIEW: 'bg-purple-500/10 text-purple-400',
  BLOCKED: 'bg-red-500/10 text-red-400',
  DONE: 'bg-green-500/10 text-green-400',
  CANCELLED: 'bg-zinc-500/10 text-zinc-500 line-through',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-red-400',
};

const STATUS_ORDER = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CANCELLED'];

function ProgressBar({ value, max, color = 'bg-purple-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-white/10 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TimingBadge({ timing }: { timing: SprintMetrics['timing'] }) {
  if (timing.actualDays === null) {
    return <span className="text-xs text-zinc-500">Sin completar</span>;
  }
  const diff = timing.actualDays - timing.plannedDays;
  if (diff > 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full">
        <Clock className="w-3 h-3" />{diff}d tarde
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
        <CheckCircle className="w-3 h-3" />{Math.abs(diff)}d antes
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full">
      <CheckCircle className="w-3 h-3" />A tiempo
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function ArchivedProjectMetrics() {
  const { id } = useParams<{ id: string }>();
  const { theme } = useAuth();
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<string>('all');

  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    card: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#E5DFD3]',
    cardDarker: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#D6CFC0]',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    textMuted: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
  };

  useEffect(() => {
    if (!id) return;
    authFetch<HistoryData>(`/projects/${id}/history`)
      .then(setData)
      .catch((e) => setError(e?.message ?? 'Error al cargar las métricas'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen ${colors.bg} flex flex-col items-center justify-center gap-4`}>
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className={`text-sm ${colors.textMuted}`}>{error ?? 'No se pudieron cargar las métricas'}</p>
        <Link to="/archived-projects" className="text-purple-400 text-sm hover:underline">
          ← Volver al Archivo
        </Link>
      </div>
    );
  }

  const { project, sprints, totals } = data;
  const currentSprint = selectedSprint === 'all' ? null : sprints.find((s) => s.id === selectedSprint);
  const metrics: SprintMetrics | null = currentSprint ? currentSprint.metrics : null;
  const tickets: TicketRow[] = currentSprint
    ? currentSprint.tickets
    : sprints.flatMap((s) => s.tickets);

  const displayMetrics = metrics ?? {
    ticketsByStatus: totals.tickets.byStatus,
    storyPoints: totals.storyPoints,
    teamAssignments: totals.teamAssignments,
    timing: {
      plannedDays: totals.durationDays.planned ?? 0,
      actualDays: totals.durationDays.actual,
      onTime: totals.durationDays.actual !== null && totals.durationDays.planned !== null
        ? totals.durationDays.actual <= totals.durationDays.planned
        : null,
    },
  };

  const kpiDuration = currentSprint
    ? (currentSprint.metrics.timing.actualDays ?? currentSprint.metrics.timing.plannedDays)
    : (totals.durationDays.actual ?? totals.durationDays.planned ?? '—');

  const kpiCompletion = currentSprint
    ? (currentSprint.metrics.storyPoints.planned > 0
        ? Math.round((currentSprint.metrics.storyPoints.completed / currentSprint.metrics.storyPoints.planned) * 100)
        : 0)
    : totals.completionRate;

  const kpiTickets = currentSprint
    ? currentSprint.tickets.length
    : totals.tickets.total;

  const kpiTeam = currentSprint
    ? currentSprint.metrics.teamAssignments.length
    : project.members.length;

  const risk = mapRisk(project.riskLevel);

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      <Header
        title={project.name}
        subtitle="Métricas históricas · Solo lectura"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Back + project meta */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <Link
            to="/archived-projects"
            className={`flex items-center gap-2 text-sm ${colors.textMuted} hover:text-purple-400 transition-colors`}
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al Archivo
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-medium rounded-full">Archivado</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskBadgeClass(project.riskLevel)}`}>
              Riesgo {risk}
            </span>
          </div>
        </div>

        {/* Project info banner */}
        <motion.div
          className={`${colors.card} border ${colors.border} rounded-xl p-5`}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        >
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${colors.textMuted}`}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0" />
              <span>PM: <span className={colors.textPrimary}>{project.pm?.fullName ?? '—'}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{formatDate(project.startDate)} → {formatDate(project.targetEndDate)}</span>
            </div>
            {project.actualEndDate && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Cerrado: <span className={colors.textPrimary}>{formatDate(project.actualEndDate)}</span></span>
              </div>
            )}
            {project.archivedAt && (
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 shrink-0" />
                <span>Archivado: <span className={colors.textPrimary}>{formatDate(project.archivedAt)}</span></span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sprint selector */}
        {sprints.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSprint('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                ${selectedSprint === 'all'
                  ? 'bg-purple-500 text-white border-purple-500'
                  : `${colors.card} ${colors.border} ${colors.textMuted} hover:border-purple-500/50`}`}
            >
              Todos los sprints
            </button>
            {sprints.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSprint(s.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                  ${selectedSprint === s.id
                    ? 'bg-purple-500 text-white border-purple-500'
                    : `${colors.card} ${colors.border} ${colors.textMuted} hover:border-purple-500/50`}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {/* Sprint date range when a sprint is selected */}
        {currentSprint && (
          <div className={`flex items-center gap-4 text-sm ${colors.textMuted}`}>
            <span>{formatDate(currentSprint.startDate)} → {formatDate(currentSprint.endDate)}</span>
            {currentSprint.completedAt && (
              <span>Completado: {formatDate(currentSprint.completedAt)}</span>
            )}
            <TimingBadge timing={currentSprint.metrics.timing} />
            {currentSprint.goal && (
              <span className="italic">"{currentSprint.goal}"</span>
            )}
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tickets', value: kpiTickets, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Completado', value: `${kpiCompletion}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Equipo', value: kpiTeam, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Duración (días)', value: kpiDuration, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              className={`${colors.card} border ${colors.border} rounded-xl p-5`}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 ${bg} rounded-lg shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${colors.textPrimary}`}>{value}</p>
                  <p className={`text-xs ${colors.textMuted}`}>{label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tickets por estado */}
        <motion.div
          className={`${colors.card} border ${colors.border} rounded-xl p-6`}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <h3 className={`text-sm font-semibold ${colors.textPrimary} mb-4`}>Tickets por estado</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STATUS_ORDER.map((status) => {
              const count = displayMetrics.ticketsByStatus[status] ?? 0;
              return (
                <div key={status} className={`${colors.cardDarker} rounded-lg p-3 text-center`}>
                  <p className={`text-xl font-bold ${colors.textPrimary}`}>{count}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[status]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Story points */}
        <motion.div
          className={`${colors.card} border ${colors.border} rounded-xl p-6`}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        >
          <h3 className={`text-sm font-semibold ${colors.textPrimary} mb-4`}>Story Points</h3>
          <div className="flex items-center gap-8 mb-3 flex-wrap">
            <div>
              <p className={`text-2xl font-bold ${colors.textPrimary}`}>{displayMetrics.storyPoints.completed}</p>
              <p className={`text-xs ${colors.textMuted}`}>Completados</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${colors.textMuted}`}>{displayMetrics.storyPoints.planned}</p>
              <p className={`text-xs ${colors.textMuted}`}>Planeados</p>
            </div>
            <div className="flex-1 min-w-[160px]">
              <div className="flex justify-between text-xs mb-1">
                <span className={colors.textMuted}>Progreso</span>
                <span className={colors.textPrimary}>
                  {displayMetrics.storyPoints.planned > 0
                    ? Math.round((displayMetrics.storyPoints.completed / displayMetrics.storyPoints.planned) * 100)
                    : 0}%
                </span>
              </div>
              <ProgressBar
                value={displayMetrics.storyPoints.completed}
                max={displayMetrics.storyPoints.planned}
                color="bg-purple-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Equipo */}
        {displayMetrics.teamAssignments.length > 0 && (
          <motion.div
            className={`${colors.card} border ${colors.border} rounded-xl p-6`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <h3 className={`text-sm font-semibold ${colors.textPrimary} mb-4`}>Equipo</h3>
            <div className="space-y-3">
              {displayMetrics.teamAssignments
                .slice()
                .sort((a, b) => b.ticketsCount - a.ticketsCount)
                .map((member) => (
                  <div key={member.memberId} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-purple-400">
                        {member.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${colors.textPrimary} truncate`}>{member.fullName}</p>
                      <p className={`text-xs ${colors.textMuted}`}>
                        {member.ticketsCount} ticket{member.ticketsCount !== 1 ? 's' : ''} · {member.storyPointsCompleted} pts completados
                      </p>
                    </div>
                    <div className="w-32 shrink-0">
                      <ProgressBar
                        value={member.storyPointsCompleted}
                        max={displayMetrics.storyPoints.completed || 1}
                        color="bg-blue-500"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Timeline de sprints (solo en vista "Todos") */}
        {selectedSprint === 'all' && sprints.length > 0 && (
          <motion.div
            className={`${colors.card} border ${colors.border} rounded-xl p-6`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          >
            <h3 className={`text-sm font-semibold ${colors.textPrimary} mb-4`}>Timeline de sprints</h3>
            <div className="space-y-3">
              {sprints.map((s) => (
                <div key={s.id} className={`${colors.cardDarker} rounded-lg p-4 flex items-center gap-4 flex-wrap`}>
                  <div className="min-w-[140px]">
                    <p className={`text-sm font-medium ${colors.textPrimary}`}>{s.name}</p>
                    <p className={`text-xs ${colors.textMuted}`}>
                      {formatDate(s.startDate)} → {formatDate(s.endDate)}
                    </p>
                  </div>
                  <div className={`text-xs ${colors.textMuted}`}>
                    {s.metrics.timing.actualDays !== null
                      ? `${s.metrics.timing.actualDays}d reales / ${s.metrics.timing.plannedDays}d planeados`
                      : `${s.metrics.timing.plannedDays}d planeados`}
                  </div>
                  <TimingBadge timing={s.metrics.timing} />
                  <div className={`text-xs ${colors.textMuted} ml-auto`}>
                    {s.metrics.ticketsByStatus['DONE'] ?? 0}/{s.tickets.length} tickets · {s.metrics.storyPoints.completed}/{s.metrics.storyPoints.planned} pts
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabla de tickets */}
        {tickets.length > 0 && (
          <motion.div
            className={`${colors.card} border ${colors.border} rounded-xl p-6`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            <h3 className={`text-sm font-semibold ${colors.textPrimary} mb-4`}>
              Tickets {currentSprint ? `— ${currentSprint.name}` : '— todos los sprints'}
              <span className={`ml-2 text-xs font-normal ${colors.textMuted}`}>({tickets.length})</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-xs ${colors.textMuted} border-b ${colors.border}`}>
                    <th className="text-left py-2 pr-4 font-medium">Título</th>
                    <th className="text-left py-2 pr-4 font-medium">Estado</th>
                    <th className="text-left py-2 pr-4 font-medium">Prioridad</th>
                    <th className="text-left py-2 pr-4 font-medium">Asignado</th>
                    <th className="text-right py-2 font-medium">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.map((t) => (
                    <tr key={t.id} className="group">
                      <td className={`py-3 pr-4 ${colors.textPrimary} max-w-xs truncate`}>{t.title}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[t.status]}`}>
                          {STATUS_LABELS[t.status] ?? t.status}
                        </span>
                      </td>
                      <td className={`py-3 pr-4 text-xs font-medium ${PRIORITY_COLORS[t.priority] ?? ''}`}>
                        {t.priority}
                      </td>
                      <td className={`py-3 pr-4 text-xs ${colors.textMuted}`}>
                        {t.assignedTo?.fullName ?? '—'}
                      </td>
                      <td className={`py-3 text-right text-xs font-mono ${colors.textMuted}`}>
                        {t.storyPoints ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tickets.length === 0 && (
          <div className={`${colors.card} border ${colors.border} rounded-xl p-10 text-center`}>
            <FileText className={`w-10 h-10 ${colors.textMuted} mx-auto mb-3`} />
            <p className={`text-sm ${colors.textMuted}`}>
              {sprints.length === 0 ? 'Este proyecto no tiene sprints registrados' : 'No hay tickets en este sprint'}
            </p>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Link to="/archived-projects">
            <button className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border ${colors.border} ${colors.textMuted} hover:border-purple-500/50 transition-colors`}>
              <ChevronLeft className="w-4 h-4" />
              Volver al Archivo
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
