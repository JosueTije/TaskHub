import { useEffect, useState, useCallback } from 'react';
import { usePolling } from '../../hooks/usePolling';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Trophy, Medal, Flame, Crown, Star, BarChart3, TrendingUp, ChevronRight, CheckCircle2, Target, Loader2, Award } from 'lucide-react';
import { InfoTooltip } from '../components/InfoTooltip';
import { Link } from 'react-router';
import { authFetch } from '../../services/api';

interface Developer {
  id: string;
  name: string;
  totalPoints: number;
  mainProject: string;
  highPriorityTickets: number;
  estimationAccuracy: number | null;
  badge: string;
  streak: number;
  position: number;
}

interface TopProject {
  id: string;
  name: string;
  score: number;
  completion: number;
  developers: number;
}

interface LeaderboardData {
  developers: Developer[];
  topProjects: TopProject[];
  weeklyTrend: Record<string, string | number>[];
}

const PROJECT_COLORS = ['#FF3B30', '#007AFF', '#34C759', '#FF9F0A'];

const BADGE_COLORS: Record<string, string> = {
  Legend: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  Master: 'bg-gradient-to-r from-purple-500 to-pink-500',
  Expert: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  Pro: 'bg-gradient-to-r from-green-500 to-emerald-500',
  Advanced: 'bg-gradient-to-r from-indigo-500 to-violet-500',
  Intermediate: 'bg-gradient-to-r from-gray-500 to-slate-500',
};

function getPositionIcon(position: number) {
  if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
  if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (position === 3) return <Medal className="w-6 h-6 text-orange-500" />;
  return null;
}

export function Gamification() {
  const { user, theme } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    card: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white',
    cardSecondary: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#E5DFD3]',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(74,69,61,0.1)',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    textSecondary: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
    hover: theme === 'dark' ? 'hover:bg-[#0F0F0F]/50' : 'hover:bg-[#E5DFD3]/50',
    inputBg: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white',
    chartGrid: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(74,69,61,0.1)',
    chartText: theme === 'dark' ? '#8E8E93' : '#4A453D',
    tooltipBg: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
  };

  const fetchLeaderboard = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const result = await authFetch<LeaderboardData>('/gamification/leaderboard');
      setData(result);
      setLastUpdated(new Date());
    } catch {
      if (showSpinner) setData(null);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  // Poll every 30s — served from cache for first 5 min, then fresh DB query
  usePolling(() => fetchLeaderboard(false), 30_000);

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3B30]" />
      </div>
    );
  }

  const developers = data?.developers ?? [];
  const topProjects = data?.topProjects ?? [];
  const weeklyTrend = data?.weeklyTrend ?? [];
  const top3 = developers.slice(0, 3);
  const role = user?.role ?? 'DEVELOPER';

  const visibleProjects =
    role === 'DEVELOPER'
      ? topProjects.filter((p) => developers.find((d) => d.id === user?.id && d.mainProject === p.name))
      : topProjects;

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      <div className={`border-b ${colors.border} ${colors.card} sticky top-0 z-10`}>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-2xl md:text-3xl font-bold ${colors.textPrimary}`}>Gamificación Global</h1>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  En vivo
                </span>
              </div>
              <p className={`text-sm ${colors.textSecondary}`}>
                {lastUpdated
                  ? `Actualizado ${lastUpdated.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · se refresca cada 30s`
                  : 'Desempeño general en todos los proyectos'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Top 3 */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
            <Trophy className="w-5 h-5 text-[#FF3B30]" />
            Top 3 Developers Globales
          </h2>
          {top3.length === 0 ? (
            <div className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`}>
              <Trophy className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-4`} />
              <p className={`text-sm ${colors.textSecondary}`}>Aún no hay datos de gamificación. Completa tickets para aparecer aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {top3.map((dev, index) => (
                <motion.div
                  key={dev.id}
                  className={`relative overflow-hidden ${colors.card} border rounded-xl p-6 backdrop-blur-xl transition-all cursor-pointer group ${
                    index === 0 ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' :
                    index === 1 ? 'border-gray-400/50 shadow-lg shadow-gray-400/20' :
                    'border-orange-500/50 shadow-lg shadow-orange-500/20'
                  }`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                >
                  <div className="absolute -top-2 -right-2">
                    <div className={`w-16 h-16 flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-500/20' : index === 1 ? 'bg-gray-400/20' : 'bg-orange-500/20'
                    } rounded-full`}>
                      {getPositionIcon(dev.position)}
                    </div>
                  </div>
                  <div className="text-center relative z-10">
                    <div className={`w-20 h-20 mx-auto mb-4 flex items-center justify-center ${colors.cardSecondary} rounded-full border-2 ${colors.border} text-2xl font-bold ${colors.textPrimary}`}>
                      {dev.name.charAt(0)}
                    </div>
                    <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-1`}>{dev.name}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4 ${BADGE_COLORS[dev.badge] ?? BADGE_COLORS.Intermediate}`}>
                      {dev.badge}
                    </div>
                    <div className={`${colors.cardSecondary} rounded-lg p-4 mb-4`}>
                      <p className={`text-3xl font-bold ${colors.textPrimary} mb-1`}>{dev.totalPoints.toLocaleString()}</p>
                      <div className={`flex items-center justify-center gap-1 text-xs ${colors.textSecondary}`}>
                        <span>Puntos Totales</span>
                        <InfoTooltip text="Suma de puntos acumulados en TODOS los proyectos (activos e históricos). Fórmula: prioridad base (CRITICAL=50, HIGH=30, MEDIUM=20, LOW=10) + story points × 5 + bono +5 si estimación ≤115%. Para ver puntos por proyecto usa 'Ver Detalle'." position="bottom" />
                      </div>
                    </div>
                    <div className={`flex items-center justify-center gap-1 text-sm ${colors.textSecondary}`}>
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className={`${colors.textPrimary} font-semibold`}>{dev.streak}</span>
                      <span>días streak</span>
                      <InfoTooltip text="Días consecutivos con al menos 1 ticket completado, contando hacia atrás desde hoy. Se rompe si un día no se completa ningún ticket." position="bottom" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Best project */}
        {topProjects.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
              <Star className="w-5 h-5 text-[#FF3B30]" />
              Proyecto con Mejor Desempeño
            </h2>
            <motion.div
              className={`${colors.card} border border-[#FF3B30]/20 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden cursor-pointer`}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255, 59, 48, 0.5)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-[#FF3B30]/20 rounded-xl">
                      <Trophy className="w-8 h-8 text-[#FF3B30]" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${colors.textPrimary}`}>{topProjects[0].name}</h3>
                      <p className={`text-sm ${colors.textSecondary}`}>{topProjects[0].developers} developers activos</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Score General', value: topProjects[0].score.toLocaleString(), tip: 'Suma de todos los puntos de todos los developers del proyecto.' },
                      { label: '% Cumplimiento', value: topProjects[0].completion + '%', tip: 'Tickets completados (DONE) ÷ total de tickets del proyecto × 100.' },
                      { label: 'Developers', value: topProjects[0].developers, tip: 'Número de developers activos actualmente en el proyecto.' },
                    ].map((stat, idx) => (
                      <motion.div key={idx} className={`${colors.cardSecondary} border ${colors.border} rounded-lg p-4`} whileHover={{ scale: 1.05, y: -4 }}>
                        <p className={`text-2xl font-bold ${colors.textPrimary} mb-1`}>{stat.value}</p>
                        <div className={`flex items-center gap-1 text-xs ${colors.textSecondary}`}>
                          <span>{stat.label}</span>
                          <InfoTooltip text={stat.tip} position="top" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <Link to={`/gamification/project/${topProjects[0].id}`} className="flex items-center gap-2 px-6 py-3 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white rounded-lg transition-all font-medium">
                  <span>Ver Detalle</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Global ranking */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <h2 className={`text-xl font-semibold ${colors.textPrimary} flex items-center gap-2`}>
              <BarChart3 className="w-5 h-5 text-[#FF3B30]" />
              Ranking Global
            </h2>
            <p className={`text-xs ${colors.textSecondary} max-w-sm text-right`}>
              Los puntos son la suma de <span className={`font-medium ${colors.textPrimary}`}>todos los proyectos</span> (activos e históricos). Para ver puntos por proyecto usa "Ver Detalle".
            </p>
          </div>
          <motion.div className={`${colors.card} border ${colors.border} rounded-xl overflow-hidden`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.4 }}>
            <div className={`grid grid-cols-12 gap-4 px-6 py-4 border-b ${colors.border} ${colors.cardSecondary}`}>
              <div className={`col-span-1 text-xs font-semibold ${colors.textSecondary}`}>#</div>
              <div className={`col-span-3 text-xs font-semibold ${colors.textSecondary}`}>Developer</div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary}`}>
                Proyecto Principal
                <InfoTooltip text="El proyecto donde el developer tiene más tickets completados." position="bottom" className="ml-1" />
              </div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right flex items-center justify-end gap-1`}>
                Puntos (global)
                <InfoTooltip text="Suma de puntos en TODOS los proyectos. Un developer con 300 en E-Commerce + 360 en DataFlow aparece con 660 aquí. Para ver puntos por proyecto, usa 'Ver Detalle'." position="bottom" />
              </div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right flex items-center justify-end gap-1`}>
                Alta Prioridad
                <InfoTooltip text="Número de tickets de prioridad HIGH o CRITICAL completados en total." position="bottom" />
              </div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right flex items-center justify-end gap-1`}>
                % Estimación
                <InfoTooltip text="Porcentaje de tickets completados donde el tiempo real fue ≤ tiempo estimado × 1.15. ≥90% es excelente, 80-89% es bueno, &lt;80% indica subestimación frecuente." position="left" />
              </div>
            </div>
            <div className={`divide-y ${colors.border}`}>
              {developers.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className={`text-sm ${colors.textSecondary}`}>No hay developers con tickets completados aún.</p>
                </div>
              ) : developers.map((dev, index) => {
                const isMe = dev.id === user?.id;
                return (
                  <motion.div
                    key={dev.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 ${colors.hover} transition-all cursor-pointer group relative ${isMe ? 'bg-[#FF3B30]/5 border-l-4 border-[#FF3B30]' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                  >
                    <div className="col-span-1 flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        dev.position === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                        dev.position === 2 ? 'bg-gray-400/20 text-gray-400' :
                        dev.position === 3 ? 'bg-orange-500/20 text-orange-500' :
                        `${theme === 'dark' ? 'bg-white/5' : 'bg-[#4A453D]/10'} ${colors.textSecondary}`
                      }`}>
                        {dev.position}
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${colors.cardSecondary} flex items-center justify-center text-sm font-bold border ${colors.border} ${isMe ? 'border-2 border-[#FF3B30] ring-2 ring-[#FF3B30]/20' : ''} ${colors.textPrimary}`}>
                        {dev.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium transition-colors ${isMe ? 'text-[#FF3B30]' : `${colors.textPrimary} group-hover:text-[#FF3B30]`}`}>
                            {dev.name}
                          </p>
                          {isMe && <Badge variant="danger" className="text-[10px] px-2 py-0.5">Tú</Badge>}
                        </div>
                        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white mt-1 ${BADGE_COLORS[dev.badge] ?? BADGE_COLORS.Intermediate}`}>
                          {dev.badge}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <p className={`text-sm ${colors.textSecondary}`}>{dev.mainProject}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <p className={`text-sm font-semibold ${colors.textPrimary}`}>{dev.totalPoints.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <Badge variant="default">{dev.highPriorityTickets}</Badge>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      {dev.estimationAccuracy === null ? (
                        <span className={`text-sm ${colors.textSecondary}`}>—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${dev.estimationAccuracy >= 90 ? 'text-green-500' : dev.estimationAccuracy >= 80 ? 'text-yellow-500' : 'text-[#FF3B30]'}`}>
                            {dev.estimationAccuracy}%
                          </span>
                          {dev.estimationAccuracy >= 90 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.section>

        {/* Weekly trend chart */}
        {weeklyTrend.length > 0 && topProjects.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
            <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
              <TrendingUp className="w-5 h-5 text-[#FF3B30]" />
              Tendencia Global
              <InfoTooltip text="Puntos gamificados acumulados por proyecto a lo largo de las últimas 4 semanas. Muestra cuáles proyectos tienen más actividad reciente." position="bottom" />
            </h2>
            <motion.div className={`${colors.card} border ${colors.border} rounded-xl p-6`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.4 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                  <XAxis dataKey="week" stroke={colors.chartText} tick={{ fill: colors.chartText, fontSize: 12 }} />
                  <YAxis stroke={colors.chartText} tick={{ fill: colors.chartText, fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.borderColor}`, borderRadius: '12px', color: theme === 'dark' ? '#FFFFFF' : '#29251D' }} />
                  {topProjects.map((proj, idx) => (
                    <Line key={proj.id} type="monotone" dataKey={proj.id} stroke={PROJECT_COLORS[idx] ?? '#8E8E93'} strokeWidth={3} name={proj.name} dot={{ fill: PROJECT_COLORS[idx] ?? '#8E8E93', r: 5 }} activeDot={{ r: 7 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
                {topProjects.map((proj, idx) => (
                  <div key={proj.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROJECT_COLORS[idx] ?? '#8E8E93' }} />
                    <span className={`text-xs ${colors.textSecondary}`}>{proj.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Badge system legend */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.5 }}>
          <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
            <Award className="w-5 h-5 text-[#FF3B30]" />
            Sistema de Insignias
          </h2>
          <motion.div className={`${colors.card} border ${colors.border} rounded-xl p-6`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9, duration: 0.4 }}>
            <p className={`text-sm ${colors.textSecondary} mb-6`}>
              Las insignias se asignan automáticamente según los puntos acumulados. Los puntos se ganan completando tickets: base por prioridad + story points × 5 + +5 si estimaste bien.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { badge: 'Legend',       min: 2000, max: null, gradient: 'from-yellow-500 to-orange-500',  ring: 'ring-yellow-500/30',  desc: 'Élite absoluta' },
                { badge: 'Master',       min: 1500, max: 1999, gradient: 'from-purple-500 to-pink-500',    ring: 'ring-purple-500/30',  desc: 'Alto rendimiento' },
                { badge: 'Expert',       min: 1000, max: 1499, gradient: 'from-blue-500 to-cyan-500',      ring: 'ring-blue-500/30',    desc: 'Muy consistente' },
                { badge: 'Pro',          min: 600,  max: 999,  gradient: 'from-green-500 to-emerald-500',  ring: 'ring-green-500/30',   desc: 'Nivel profesional' },
                { badge: 'Advanced',     min: 300,  max: 599,  gradient: 'from-indigo-500 to-violet-500',  ring: 'ring-indigo-500/30',  desc: 'En progreso' },
                { badge: 'Intermediate', min: 0,    max: 299,  gradient: 'from-gray-500 to-slate-500',     ring: 'ring-gray-500/30',    desc: 'Comenzando' },
              ].map(({ badge, min, max, gradient, ring, desc }, i) => (
                <motion.div
                  key={badge}
                  className={`${colors.cardSecondary} border ${colors.border} rounded-xl p-4 flex flex-col items-center text-center gap-3 ring-1 ${ring}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${gradient}`}>
                    {badge}
                  </div>
                  <p className={`text-[11px] font-semibold ${colors.textPrimary}`}>
                    {max === null
                      ? `≥ ${min.toLocaleString()} pts`
                      : min === 0
                        ? `0 – ${max.toLocaleString()} pts`
                        : `${min.toLocaleString()} – ${max.toLocaleString()} pts`}
                  </p>
                  <p className={`text-[10px] ${colors.textSecondary} leading-tight`}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Project detail cards */}
        {role !== 'DEVELOPER' && visibleProjects.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5 }}>
            <h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}>
              <Target className="w-5 h-5 text-[#FF3B30]" />
              Ver Detalle por Proyecto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleProjects.map((project, index) => (
                <motion.div key={project.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }} whileHover={{ scale: 1.03, y: -4 }}>
                  <Link to={`/gamification/project/${project.id}`} className={`${colors.card} border ${colors.border} rounded-xl p-6 hover:border-[#FF3B30] transition-all group block`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${colors.textPrimary} group-hover:text-[#FF3B30] transition-colors`}>{project.name}</h3>
                      <ChevronRight className={`w-5 h-5 ${colors.textSecondary} group-hover:text-[#FF3B30] transition-colors`} />
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Score', value: project.score.toLocaleString() },
                        { label: 'Cumplimiento', value: project.completion + '%' },
                        { label: 'Developers', value: project.developers },
                      ].map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className={colors.textSecondary}>{stat.label}:</span>
                          <span className={`${colors.textPrimary} font-semibold`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
