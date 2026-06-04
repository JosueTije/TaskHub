import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Trophy, TrendingUp, ArrowLeft, Crown, Zap, CheckCircle2, Target, AlertTriangle, Star, Loader2, Flame, Minus } from 'lucide-react';
import { InfoTooltip } from '../components/InfoTooltip';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { authFetch } from '../../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ProjectDeveloper {
  id: string;
  name: string;
  totalPoints: number;
  highPriorityTickets: number;
  estimationAccuracy: number | null;
  criticalTickets: number;
  badge: string;
  streak: number;
  position: number;
  currentSprintPoints: number;
  sprintCompletion: number;
  weeklyEvolution: { week: string; points: number; tickets: number }[];
  consistency: number;
  trend: 'up' | 'down' | 'neutral';
}

interface SprintWinner {
  name: string;
  points: number;
  completion: number;
  sprintName: string;
}

interface ProjectGamificationData {
  projectName: string;
  totalScore: number;
  developers: ProjectDeveloper[];
  sprintWinner: SprintWinner | null;
}

const BADGE_COLORS: Record<string, string> = {
  Legend: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  Master: 'bg-gradient-to-r from-purple-500 to-pink-500',
  Expert: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  Pro: 'bg-gradient-to-r from-green-500 to-emerald-500',
  Advanced: 'bg-gradient-to-r from-indigo-500 to-violet-500',
  Intermediate: 'bg-gradient-to-r from-gray-500 to-slate-500',
};

const POINTS_SYSTEM = [
  { action: 'Ticket Crítico', points: '50', type: 'positive' },
  { action: 'Ticket Alta Prioridad', points: '30', type: 'positive' },
  { action: 'Ticket Media Prioridad', points: '20', type: 'positive' },
  { action: 'Ticket Baja Prioridad', points: '10', type: 'positive' },
  { action: 'Story Points (×5)', points: '+SP×5', type: 'bonus' },
  { action: 'Estimación precisa (≤115%)', points: '+5', type: 'bonus' },
];

function EstimationCell({ value, textSecondary }: { value: number | null; textSecondary: string }) {
  if (value === null) {
    return <span className={`text-sm ${textSecondary}`}>—</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-semibold ${value >= 90 ? 'text-green-500' : value >= 80 ? 'text-yellow-500' : 'text-[#FF3B30]'}`}>
        {value}%
      </span>
      {value >= 90 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
    </div>
  );
}

function TrendDisplay({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'up') return (
    <div className="flex items-center gap-2 mb-1">
      <TrendingUp className="w-4 h-4 text-green-500" />
      <p className="text-lg font-bold text-green-500">Alza</p>
    </div>
  );
  if (trend === 'neutral') return (
    <div className="flex items-center gap-2 mb-1">
      <Minus className="w-4 h-4 text-[#8E8E93]" />
      <p className="text-lg font-bold text-[#8E8E93]">Sin actividad</p>
    </div>
  );
  return (
    <div className="flex items-center gap-2 mb-1">
      <AlertTriangle className="w-4 h-4 text-yellow-500" />
      <p className="text-lg font-bold text-yellow-500">Baja</p>
    </div>
  );
}

export function ProjectGamification() {
  const { id } = useParams();
  const { theme } = useAuth();
  const [data, setData] = useState<ProjectGamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDev, setSelectedDev] = useState<string | null>(null);

  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    card: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white',
    cardSecondary: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#E5DFD3]',
    cardDarker: theme === 'dark' ? 'bg-[#0F0F0F]/50' : 'bg-[#D6CFC0]/50',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(74,69,61,0.1)',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    textSecondary: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
    hover: theme === 'dark' ? 'hover:bg-[#0F0F0F]/50' : 'hover:bg-[#E5DFD3]/50',
    chartGrid: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(74,69,61,0.1)',
    chartText: theme === 'dark' ? '#8E8E93' : '#4A453D',
    tooltipBg: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
  };

  useEffect(() => {
    if (!id) return;
    authFetch<ProjectGamificationData>(`/gamification/project/${id}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3B30]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <div className="text-center">
          <Trophy className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-4`} />
          <p className={`${colors.textPrimary} font-semibold mb-2`}>No se pudo cargar la gamificación</p>
          <Link to="/gamification" className="text-sm text-[#FF3B30] hover:underline">Volver a Global</Link>
        </div>
      </div>
    );
  }

  const winner = data.developers[0] ?? null;
  const selected = data.developers.find((d) => d.id === selectedDev) ?? null;

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* Header */}
      <div className={`border-b ${colors.border} ${colors.card} sticky top-0 z-10`}>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link to="/gamification" className={`inline-flex items-center gap-2 ${colors.textSecondary} hover:text-[#FF3B30] transition-colors mb-3`}>
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver a Global</span>
              </Link>
              <h1 className={`text-2xl md:text-3xl font-bold ${colors.textPrimary} mb-2`}>{data.projectName}</h1>
              <p className={`text-sm ${colors.textSecondary}`}>Gamificación del proyecto</p>
            </div>
            <div className={`${colors.card} border ${colors.border} rounded-xl p-4`}>
              <div className="flex items-center gap-1 mb-1">
                <p className={`text-xs ${colors.textSecondary}`}>Score Total del Proyecto</p>
                <InfoTooltip text="Suma de todos los puntos obtenidos por el equipo: base por prioridad + story points × 5 + bonus por estimación precisa (≤115% de lo estimado)." position="left" />
              </div>
              <p className={`text-3xl font-bold ${colors.textPrimary}`}>{data.totalScore.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall winner */}
          <section>
            <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
              <Crown className="w-5 h-5 text-[#FF3B30]" />
              Ganador General del Proyecto
            </h2>
            {winner ? (
              <div className={`bg-gradient-to-br from-yellow-500/10 to-transparent ${colors.card} border border-yellow-500/30 rounded-xl p-6 shadow-lg shadow-yellow-500/10`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full ${colors.cardSecondary} border-2 border-yellow-500 flex items-center justify-center text-3xl font-bold ${colors.textPrimary}`}>
                      {winner.name.charAt(0)}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${colors.textPrimary} mb-1`}>{winner.name}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${BADGE_COLORS[winner.badge] ?? BADGE_COLORS.Intermediate}`}>
                      {winner.badge}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${colors.cardDarker} border ${colors.border} rounded-lg p-4`}>
                    <p className={`text-2xl font-bold ${colors.textPrimary} mb-1`}>{winner.totalPoints.toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      <p className={`text-xs ${colors.textSecondary}`}>Puntos Totales</p>
                      <InfoTooltip text="Suma de puntos acumulados en todos los tickets completados del proyecto (prioridad base + story points × 5 + bonus estimación)." position="top" />
                    </div>
                  </div>
                  <div className={`${colors.cardDarker} border ${colors.border} rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <p className={`text-2xl font-bold ${colors.textPrimary}`}>{winner.streak}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className={`text-xs ${colors.textSecondary}`}>Días Streak</p>
                      <InfoTooltip text="Días consecutivos con al menos un ticket completado. Mide la constancia del developer en el proyecto." position="top" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`}>
                <Trophy className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-4`} />
                <p className={`text-sm ${colors.textSecondary}`}>No hay developers con tickets completados aún.</p>
              </div>
            )}
          </section>

          {/* Sprint winner */}
          <section>
            <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
              <Zap className="w-5 h-5 text-[#FF3B30]" />
              Ganador del Sprint Actual
            </h2>
            {data.sprintWinner ? (
              <div className={`bg-gradient-to-br from-[#FF3B30]/10 to-transparent ${colors.card} border border-[#FF3B30]/30 rounded-xl p-6 shadow-lg shadow-[#FF3B30]/10`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full ${colors.cardSecondary} border-2 border-[#FF3B30] flex items-center justify-center text-3xl font-bold ${colors.textPrimary}`}>
                      {data.sprintWinner.name.charAt(0)}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-[#FF3B30] rounded-full p-1.5">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${colors.textPrimary} mb-1`}>{data.sprintWinner.name}</h3>
                    <Badge variant="danger" className="text-xs">{data.sprintWinner.sprintName}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${colors.cardDarker} border ${colors.border} rounded-lg p-4`}>
                    <p className={`text-2xl font-bold ${colors.textPrimary} mb-1`}>{data.sprintWinner.points}</p>
                    <div className="flex items-center gap-1">
                      <p className={`text-xs ${colors.textSecondary}`}>Puntos del Sprint</p>
                      <InfoTooltip text="Puntos obtenidos en el sprint actual únicamente. Suma de puntos por tickets completados durante este sprint." position="top" />
                    </div>
                  </div>
                  <div className={`${colors.cardDarker} border ${colors.border} rounded-lg p-4`}>
                    <p className={`text-2xl font-bold ${colors.textPrimary} mb-1`}>{data.sprintWinner.completion}%</p>
                    <div className="flex items-center gap-1">
                      <p className={`text-xs ${colors.textSecondary}`}>% Cumplimiento</p>
                      <InfoTooltip text="Tickets completados (DONE) del developer en este sprint ÷ total de tickets asignados en el sprint." position="top" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`}>
                <Zap className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-4`} />
                <p className={`text-sm ${colors.textSecondary}`}>No hay sprint activo o aún no hay tickets completados en este sprint.</p>
              </div>
            )}
          </section>
        </div>

        {/* Ranking table */}
        <section>
          <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
            <Trophy className="w-5 h-5 text-[#FF3B30]" />
            Ranking Interno del Proyecto
          </h2>
          <div className={`${colors.card} border ${colors.border} rounded-xl overflow-hidden`}>
            <div className={`grid grid-cols-12 gap-4 px-6 py-4 border-b ${colors.border} ${colors.cardSecondary}`}>
              <div className={`col-span-1 text-xs font-semibold ${colors.textSecondary}`}>#</div>
              <div className={`col-span-3 text-xs font-semibold ${colors.textSecondary}`}>Developer</div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right flex items-center justify-end gap-1`}>
                Puntos <InfoTooltip text="Total de puntos del developer en este proyecto (todos los sprints)." position="bottom" />
              </div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right flex items-center justify-end gap-1`}>
                Alta Prioridad <InfoTooltip text="Tickets completados con prioridad HIGH o CRITICAL. Valen más puntos." position="bottom" />
              </div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right flex items-center justify-end gap-1`}>
                % Estimación <InfoTooltip text="% de tickets donde las horas reales no superaron el 115% de las estimadas. '—' si no hay tickets con horas estimadas." position="bottom" />
              </div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right flex items-center justify-end gap-1`}>
                Tickets Críticos <InfoTooltip text="Tickets con prioridad CRITICAL completados. Mayor número indica mayor impacto resuelto." position="bottom" />
              </div>
            </div>
            <div className={`divide-y ${colors.border}`}>
              {data.developers.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className={`text-sm ${colors.textSecondary}`}>No hay developers con tickets completados aún.</p>
                </div>
              ) : data.developers.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDev(dev.id === selectedDev ? null : dev.id)}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 ${colors.hover} transition-all cursor-pointer ${selectedDev === dev.id ? 'bg-[#FF3B30]/5 border-l-2 border-[#FF3B30]' : ''}`}
                >
                  <div className="col-span-1 flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      dev.position === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                      dev.position === 2 ? 'bg-gray-400/20 text-gray-400' :
                      dev.position === 3 ? 'bg-orange-500/20 text-orange-500' :
                      `${theme === 'dark' ? 'bg-white/5' : 'bg-[#4A453D]/10'} ${colors.textSecondary}`
                    }`}>{dev.position}</div>
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${colors.cardSecondary} border ${colors.border} flex items-center justify-center text-sm font-bold ${colors.textPrimary}`}>
                      {dev.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${colors.textPrimary}`}>{dev.name}</p>
                      <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white mt-1 ${BADGE_COLORS[dev.badge] ?? BADGE_COLORS.Intermediate}`}>
                        {dev.badge}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <p className={`text-sm font-semibold ${colors.textPrimary}`}>{dev.totalPoints.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Badge variant="default">{dev.highPriorityTickets}</Badge>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <EstimationCell value={dev.estimationAccuracy} textSecondary={colors.textSecondary} />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Badge variant={dev.criticalTickets > 5 ? 'danger' : 'default'}>{dev.criticalTickets}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Points system */}
          <section>
            <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
              <Target className="w-5 h-5 text-[#FF3B30]" />
              Sistema de Puntos
            </h2>
            <div className={`${colors.card} border ${colors.border} rounded-xl p-6`}>
              <div className="space-y-3">
                {POINTS_SYSTEM.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                    item.type === 'positive' ? 'bg-blue-500/5 border border-blue-500/20' :
                    'bg-green-500/5 border border-green-500/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      {item.type === 'positive'
                        ? <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        : <Star className="w-5 h-5 text-green-500" />}
                      <span className={`text-sm ${colors.textPrimary}`}>{item.action}</span>
                    </div>
                    <span className={`text-lg font-bold ${item.type === 'positive' ? 'text-blue-500' : 'text-green-500'}`}>
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Individual evolution */}
          <section>
            <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
              <TrendingUp className="w-5 h-5 text-[#FF3B30]" />
              Evolución Individual
            </h2>
            {selected ? (
              <div className={`${colors.card} border ${colors.border} rounded-xl p-6`}>
                <div className={`flex items-center gap-3 mb-6 pb-6 border-b ${colors.border}`}>
                  <div className={`w-12 h-12 rounded-full ${colors.cardSecondary} border ${colors.border} flex items-center justify-center text-xl font-bold ${colors.textPrimary}`}>
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-semibold ${colors.textPrimary}`}>{selected.name}</p>
                    <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white mt-1 ${BADGE_COLORS[selected.badge] ?? BADGE_COLORS.Intermediate}`}>
                      {selected.badge}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`${colors.cardDarker} border ${colors.border} rounded-lg p-3`}>
                    <p className={`text-lg font-bold ${colors.textPrimary} mb-1`}>{selected.consistency}%</p>
                    <div className="flex items-center gap-1">
                      <p className={`text-xs ${colors.textSecondary}`}>Consistencia (4 semanas)</p>
                      <InfoTooltip text="% de semanas activas en las últimas 4 semanas. 100% = completó tickets en las 4 semanas." position="top" />
                    </div>
                  </div>
                  <div className={`${colors.cardDarker} border ${colors.border} rounded-lg p-3`}>
                    <TrendDisplay trend={selected.trend} />
                    <div className="flex items-center gap-1">
                      <p className={`text-xs ${colors.textSecondary}`}>Tendencia</p>
                      <InfoTooltip text="Compara puntos de Sem4 vs Sem1. 'Sin actividad' si no hay puntos en las últimas 4 semanas." position="top" />
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={selected.weeklyEvolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                    <XAxis dataKey="week" stroke={colors.chartText} tick={{ fill: colors.chartText, fontSize: 10 }} />
                    <YAxis stroke={colors.chartText} tick={{ fill: colors.chartText, fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.borderColor}`, borderRadius: '8px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="points" stroke="#FF3B30" strokeWidth={3} dot={{ fill: '#FF3B30', r: 4 }} name="Puntos" />
                  </LineChart>
                </ResponsiveContainer>
                <div className={`mt-6 pt-6 border-t ${colors.border}`}>
                  <p className={`text-sm font-semibold ${colors.textPrimary} mb-4`}>Tickets cerrados por semana</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={selected.weeklyEvolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                      <XAxis dataKey="week" stroke={colors.chartText} tick={{ fill: colors.chartText, fontSize: 10 }} />
                      <YAxis stroke={colors.chartText} tick={{ fill: colors.chartText, fontSize: 10 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.borderColor}`, borderRadius: '8px', fontSize: '11px' }} />
                      <Bar dataKey="tickets" fill="#007AFF" radius={[8, 8, 0, 0]} name="Tickets" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`}>
                <Trophy className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-4`} />
                <p className={`text-sm ${colors.textSecondary}`}>Selecciona un developer del ranking para ver su evolución individual</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
