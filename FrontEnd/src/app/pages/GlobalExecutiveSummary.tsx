import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { FileText, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, Folder, Target, Clock, BarChart3, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authFetch } from '../../services/api';
import { mapRisk } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface BackendProject {
  id: string;
  name: string;
  status: string;
  riskLevel: string;
  startDate: string;
  targetEndDate: string;
  pm: { id: string; fullName: string } | null;
  members: { id: string; fullName: string }[];
  stats: { membersCount: number; sprintsCount: number; ticketsCount: number };
}

interface Analytics {
  kpis: {
    progress: number;
    scheduleVariance: number;
    spi: number;
    risk: string;
    blockedTickets: number;
    delayedMilestones: number;
    totalStoryPoints: number;
    completedStoryPoints: number;
  };
}

interface EnrichedProject extends BackendProject {
  analytics: Analytics | null;
}

function mapStatus(s: string) {
  const map: Record<string, string> = { ACTIVE: 'Active', ON_HOLD: 'On Hold', COMPLETED: 'Completed', ARCHIVED: 'Archived' };
  return map[s] ?? s;
}

const STATUS_COLORS = ['#34C759', '#FF9500', '#FF3B30', '#007AFF'];

export function GlobalExecutiveSummary() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'quarter' | 'all'>('month');

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const { projects: list } = await authFetch<{ projects: BackendProject[] }>('/projects');
        const analyticsResults = await Promise.allSettled(
          list.map(p => authFetch<Analytics>(`/analytics/project/${p.id}/dashboard`))
        );
        const enriched: EnrichedProject[] = list.map((p, i) => ({
          ...p,
          analytics: analyticsResults[i].status === 'fulfilled'
            ? (analyticsResults[i] as PromiseFulfilledResult<Analytics>).value
            : null,
        }));
        setProjects(enriched);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const kpis = useMemo(() => {
    const total = projects.length;
    if (total === 0) return null;
    const totalMembers = projects.reduce((s, p) => s + p.stats.membersCount, 0);
    const totalTickets = projects.reduce((s, p) => s + p.stats.ticketsCount, 0);
    const completedSP = projects.reduce((s, p) => s + (p.analytics?.kpis.completedStoryPoints ?? 0), 0);
    const totalSP = projects.reduce((s, p) => s + (p.analytics?.kpis.totalStoryPoints ?? 0), 0);
    const avgProgress = Math.round(projects.reduce((s, p) => s + (p.analytics?.kpis.progress ?? 0), 0) / total);
    const avgSV = Math.round(projects.reduce((s, p) => s + (p.analytics?.kpis.scheduleVariance ?? 0), 0) / total);
    const avgSPI = (projects.reduce((s, p) => s + (p.analytics?.kpis.spi ?? 1), 0) / total).toFixed(2);
    const blockedTotal = projects.reduce((s, p) => s + (p.analytics?.kpis.blockedTickets ?? 0), 0);
    const delayedTotal = projects.reduce((s, p) => s + (p.analytics?.kpis.delayedMilestones ?? 0), 0);
    const highRisk = projects.filter(p => (p.analytics?.kpis.risk ?? p.riskLevel) === 'HIGH').length;
    const completionRate = totalSP > 0 ? Math.round((completedSP / totalSP) * 100) : 0;
    const delayedProjects = projects.filter(p => (p.analytics?.kpis.scheduleVariance ?? 0) < 0).length;

    return { total, totalMembers, totalTickets, completedSP, totalSP, avgProgress, avgSV, avgSPI, blockedTotal, delayedTotal, highRisk, completionRate, delayedProjects };
  }, [projects]);

  const statusData = useMemo(() => {
    const counts = projects.reduce((acc, p) => {
      const s = mapStatus(p.status);
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const riskData = useMemo(() => [
    { name: 'Low', value: projects.filter(p => (p.analytics?.kpis.risk ?? p.riskLevel) === 'LOW').length, color: '#34C759' },
    { name: 'Medium', value: projects.filter(p => (p.analytics?.kpis.risk ?? p.riskLevel) === 'MEDIUM').length, color: '#FF9500' },
    { name: 'High', value: projects.filter(p => (p.analytics?.kpis.risk ?? p.riskLevel) === 'HIGH').length, color: '#FF3B30' },
  ], [projects]);

  const progressTrendData = useMemo(() =>
    projects.map(p => ({
      name: p.name.split(' ').slice(0, 2).join(' '),
      progress: p.analytics?.kpis.progress ?? 0,
      spi: Math.round((p.analytics?.kpis.spi ?? 1) * 100),
    })), [projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E31837]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Resumen Ejecutivo Global"
        subtitle={user?.role === 'ADMIN' ? 'Vista consolidada de todos los proyectos' : 'Vista consolidada de tus proyectos asignados'} />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Filter + Export */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'all'] as const).map(f => (
              <button key={f} onClick={() => setTimeFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeFilter === f ? 'bg-[#FF3B30] text-white' : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-white/10'}`}>
                {f === 'week' ? 'Esta Semana' : f === 'month' ? 'Este Mes' : f === 'quarter' ? 'Este Trimestre' : 'Histórico'}
              </button>
            ))}
          </div>
          <Button variant="primary" icon={Download} onClick={() => window.print()}>Exportar Reporte</Button>
        </div>

        {kpis && (
          <>
            {/* Main KPIs */}
            <div className="grid grid-cols-4 gap-6">
              {[
                { icon: Folder, color: 'text-blue-500', trend: TrendingUp, trendColor: 'text-green-500', value: kpis.total, label: 'Proyectos Activos' },
                { icon: Target, color: 'text-purple-500', trend: null, trendColor: '', value: `${kpis.completionRate}%`, label: 'Tasa de Completitud', sub: `${kpis.avgProgress}% avance promedio` },
                { icon: AlertTriangle, color: 'text-[#FF3B30]', trend: null, trendColor: '', value: kpis.highRisk, label: 'Proyectos Alto Riesgo', sub: `${kpis.blockedTotal} tickets bloqueados` },
                { icon: Users, color: 'text-green-500', trend: CheckCircle, trendColor: 'text-green-500', value: kpis.totalMembers, label: 'Miembros del Equipo' },
              ].map(({ icon: Icon, color, trend: Trend, trendColor, value, label, sub }) => (
                <div key={label} className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    {Trend && <Trend className={`w-4 h-4 ${trendColor}`} />}
                    {sub && <span className="text-xs text-[#8E8E93]">{sub}</span>}
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{value}</p>
                  <p className="text-xs text-[#8E8E93]">{label}</p>
                </div>
              ))}
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="w-5 h-5 text-blue-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-white">{kpis.totalTickets}</p>
                    <p className="text-xs text-[#8E8E93]">Tickets Totales</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-500 font-medium">{kpis.completedSP} SP completados</span>
                  <span className="text-[#8E8E93]">•</span>
                  <span className="text-[#FF3B30] font-medium">{kpis.blockedTotal} bloqueados</span>
                </div>
              </div>

              <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg"><BarChart3 className="w-5 h-5 text-purple-500" /></div>
                  <div>
                    <p className={`text-2xl font-bold ${parseFloat(kpis.avgSPI) >= 1 ? 'text-green-500' : 'text-[#FF3B30]'}`}>{kpis.avgSPI}</p>
                    <p className="text-xs text-[#8E8E93]">SPI Promedio</p>
                  </div>
                </div>
                <p className="text-xs text-[#8E8E93]">
                  {parseFloat(kpis.avgSPI) >= 1 ? 'Por encima del cronograma' : 'Por debajo del cronograma'}
                </p>
              </div>

              <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg"><Clock className="w-5 h-5 text-orange-500" /></div>
                  <div>
                    <p className={`text-2xl font-bold ${kpis.avgSV < 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>
                      {kpis.avgSV > 0 ? '+' : ''}{kpis.avgSV}%
                    </p>
                    <p className="text-xs text-[#8E8E93]">Variación de Cronograma</p>
                  </div>
                </div>
                <p className="text-xs text-[#8E8E93]">
                  {kpis.delayedProjects} proyecto{kpis.delayedProjects !== 1 ? 's' : ''} retrasado{kpis.delayedProjects !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Distribución por Estado</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Distribución de Riesgo</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#8E8E93" />
                    <YAxis stroke="#8E8E93" />
                    <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Progress trend */}
            {progressTrendData.length > 0 && (
              <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Progreso y SPI por Proyecto</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#8E8E93" />
                    <YAxis stroke="#8E8E93" />
                    <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="progress" stroke="#007AFF" strokeWidth={2} name="Progreso %" />
                    <Line type="monotone" dataKey="spi" stroke="#34C759" strokeWidth={2} name="SPI %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Projects table */}
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Detalle de Proyectos</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0F0F0F]">
                    <tr>
                      {['Proyecto', 'Estado', 'Progreso', 'Riesgo', 'SPI', 'Equipo', 'Acciones'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-medium text-[#8E8E93]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {projects.map(project => {
                      const progress = project.analytics?.kpis.progress ?? 0;
                      const risk = mapRisk(project.analytics?.kpis.risk ?? project.riskLevel);
                      const spi = project.analytics?.kpis.spi ?? 1;
                      const status = mapStatus(project.status);
                      return (
                        <tr key={project.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-white">{project.name}</p>
                            <p className="text-xs text-[#8E8E93]">{project.pm?.fullName ?? '—'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${status === 'Active' ? 'bg-blue-500/10 text-blue-500' : status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-[#8E8E93]/10 text-[#8E8E93]'}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-[#0F0F0F] rounded-full h-2 max-w-[100px]">
                                <div className="bg-[#FF3B30] h-2 rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-sm text-white font-medium">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${risk === 'High' || risk === 'Critical' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                              {risk}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${spi >= 1 ? 'text-green-500' : 'text-[#FF3B30]'}`}>{spi.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex -space-x-2">
                              {project.members.slice(0, 3).map((m, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF3B30] to-[#FF6B30] flex items-center justify-center text-xs font-bold text-white border-2 border-[#1C1C1E]">
                                  {m.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                </div>
                              ))}
                              {project.stats.membersCount > 3 && (
                                <div className="w-8 h-8 rounded-full bg-[#0F0F0F] border-2 border-[#1C1C1E] flex items-center justify-center text-xs text-[#8E8E93]">
                                  +{project.stats.membersCount - 3}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Link to={`/project/${project.id}`}>
                              <Button variant="outline" size="sm">Ver Detalle</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Text summary */}
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Resumen Ejecutivo</h3>
              </div>
              <div className="space-y-4 text-[#8E8E93] leading-relaxed">
                <p>
                  La organización cuenta con <span className="text-white font-medium">{kpis.total} proyectos activos</span> gestionados por{' '}
                  <span className="text-white font-medium">{kpis.totalMembers} miembros del equipo</span>. El progreso promedio es del{' '}
                  <span className="text-white font-medium">{kpis.avgProgress}%</span> con una tasa de completitud del{' '}
                  <span className="text-white font-medium">{kpis.completionRate}%</span>.
                </p>
                <p>
                  Se identifican <span className={`font-medium ${kpis.highRisk > 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>{kpis.highRisk} proyecto{kpis.highRisk !== 1 ? 's' : ''} con riesgo alto</span> y{' '}
                  <span className={`font-medium ${kpis.delayedProjects > 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>{kpis.delayedProjects} proyecto{kpis.delayedProjects !== 1 ? 's' : ''} retrasado{kpis.delayedProjects !== 1 ? 's' : ''}</span>.{' '}
                  El SPI promedio es <span className={`font-medium ${parseFloat(kpis.avgSPI) >= 1 ? 'text-green-500' : 'text-[#FF3B30]'}`}>{kpis.avgSPI}</span>.
                </p>
                <p>
                  Hay <span className="text-white font-medium">{kpis.blockedTotal} tickets bloqueados</span> y{' '}
                  <span className="text-white font-medium">{kpis.delayedTotal} hitos retrasados</span> que requieren atención inmediata.
                </p>
              </div>
            </div>
          </>
        )}

        {!kpis && (
          <div className="text-center py-12 text-[#8E8E93]">No hay proyectos disponibles</div>
        )}

        <div className="flex gap-4">
          <Link to="/projects" className="flex-1">
            <Button variant="outline" className="w-full">Ver Todos los Proyectos</Button>
          </Link>
          <Link to="/metrics" className="flex-1">
            <Button variant="secondary" className="w-full">Ver Métricas Detalladas</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
