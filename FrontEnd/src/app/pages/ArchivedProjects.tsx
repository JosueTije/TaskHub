import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Archive, CheckCircle, Users, Calendar, Eye, Search, Loader2, RotateCcw, Clock } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { authFetch } from '../../services/api';
import { mapRisk, riskBadgeClass, normalize, formatDate } from '../../utils/formatters';

interface ArchivedProject {
  id: string;
  name: string;
  status: string;
  riskLevel: string;
  startDate: string;
  targetEndDate: string;
  actualEndDate: string | null;
  archivedAt: string | null;
  pm: { id: string; fullName: string } | null;
  members: { id: string; fullName: string; role: string }[];
  stats: { membersCount: number; sprintsCount: number; ticketsCount: number };
}


function ClosureBadge({ actualEndDate, targetEndDate }: { actualEndDate: string; targetEndDate: string }) {
  const actual = new Date(actualEndDate);
  const target = new Date(targetEndDate);
  const diffDays = Math.round((actual.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full">
        <Clock className="w-3 h-3" />
        {diffDays}d tarde
      </span>
    );
  }
  if (diffDays < 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
        <CheckCircle className="w-3 h-3" />
        {Math.abs(diffDays)}d antes
      </span>
    );
  }
  return null;
}

function RestoreModal({
  projectName,
  onConfirm,
  onCancel,
  loading,
  theme,
}: {
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  theme: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <motion.div
        className={`${theme === 'dark' ? 'bg-[#1C1C1E] border-white/10' : 'bg-[#E5DFD3] border-[#4A453D]/10'} border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl`}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <RotateCcw className="w-5 h-5 text-green-500" />
          </div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#29251D]'}`}>
            Restaurar proyecto
          </h3>
        </div>
        <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]'}`}>
          ¿Restaurar <span className="font-semibold">{projectName}</span> como proyecto activo?
          El proyecto volverá a aparecer en la lista de proyectos activos.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className={`px-4 py-2 text-sm rounded-lg border ${theme === 'dark' ? 'border-white/10 text-[#8E8E93] hover:bg-white/5' : 'border-[#4A453D]/10 text-[#4A453D] hover:bg-[#4A453D]/5'} transition-colors`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            Restaurar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function ArchivedProjects() {
  const { theme } = useAuth();
  const [projects, setProjects] = useState<ArchivedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmProject, setConfirmProject] = useState<ArchivedProject | null>(null);

  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    card: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#E5DFD3]',
    cardDarker: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#D6CFC0]',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    textMuted: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
    input: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#D6CFC0]',
  };

  useEffect(() => {
    authFetch<{ projects: ArchivedProject[] }>('/projects/archived')
      .then(({ projects }) => setProjects(projects))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(searchQuery.trim());
    if (!q) return projects;
    return projects.filter(p =>
      normalize(p.name).includes(q) ||
      normalize(p.pm?.fullName ?? '').includes(q)
    );
  }, [projects, searchQuery]);

  async function handleRestore(project: ArchivedProject) {
    setRestoring(project.id);
    try {
      await authFetch(`/projects/${project.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      setProjects(prev => prev.filter(p => p.id !== project.id));
      toast.success(`"${project.name}" restaurado como proyecto activo`);
    } catch {
      toast.error('No se pudo restaurar el proyecto. Intenta de nuevo.');
    } finally {
      setRestoring(null);
      setConfirmProject(null);
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      <Header title="Archivo de Proyectos" subtitle="Proyectos cerrados y archivados · Solo Admin y PM" />

      <AnimatePresence>
        {confirmProject && (
          <RestoreModal
            projectName={confirmProject.name}
            loading={restoring === confirmProject.id}
            theme={theme}
            onConfirm={() => handleRestore(confirmProject)}
            onCancel={() => setConfirmProject(null)}
          />
        )}
      </AnimatePresence>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Info banner */}
        <motion.div className={`bg-gradient-to-br from-blue-500/10 to-transparent border ${theme === 'dark' ? 'border-blue-500/20' : 'border-blue-500/30'} rounded-xl p-6`}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-start gap-3">
            <Archive className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className={`text-base font-semibold ${colors.textPrimary} mb-1`}>Archivo de Proyectos</h3>
              <p className={`text-sm ${colors.textMuted}`}>
                Los proyectos archivados mantienen acceso completo a sus datos históricos.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${colors.textMuted}`} />
          <input type="text" placeholder="Buscar por nombre de proyecto o PM..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className={`w-full ${colors.input} border ${colors.border} rounded-xl pl-11 pr-4 py-3 text-sm ${colors.textPrimary} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`} />
        </div>

        {/* KPI cards — siempre sobre el total del archivo, no sobre el filtro */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Proyectos Archivados', value: projects.length, icon: Archive, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Miembros Totales', value: projects.reduce((s, p) => s + p.stats.membersCount, 0), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Sprints Totales', value: projects.reduce((s, p) => s + p.stats.sprintsCount, 0), icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Tickets Totales', value: projects.reduce((s, p) => s + p.stats.ticketsCount, 0), icon: Archive, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div key={label} className={`${colors.card} border ${colors.border} rounded-xl p-6`}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02, y: -4 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 ${bg} rounded-lg`}><Icon className={`w-5 h-5 ${color}`} /></div>
                <div>
                  <p className={`text-2xl font-bold ${colors.textPrimary}`}>{value}</p>
                  <p className={`text-xs ${colors.textMuted}`}>{label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project list */}
        {filtered.length === 0 ? (
          <motion.div className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Archive className={`w-12 h-12 ${colors.textMuted} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-2`}>
              {searchQuery.trim() ? 'Sin resultados' : 'No hay proyectos archivados'}
            </h3>
            <p className={`text-sm ${colors.textMuted}`}>
              {searchQuery.trim() ? 'Intenta con otro nombre o PM' : 'Los proyectos archivados aparecerán aquí'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((project, index) => {
              const risk = mapRisk(project.riskLevel);
              return (
                <motion.div key={project.id} className={`${colors.card} border ${colors.border} rounded-xl p-6`}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.01, y: -2 }}>
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl shrink-0">
                          <Archive className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className={`text-lg font-semibold ${colors.textPrimary} truncate max-w-xs`}>{project.name}</h3>
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-medium rounded-full shrink-0">Archivado</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${riskBadgeClass(project.riskLevel)}`}>
                              Riesgo {risk}
                            </span>
                          </div>
                          <div className={`flex items-center gap-4 text-sm ${colors.textMuted} flex-wrap`}>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>PM: {project.pm?.fullName ?? '—'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(project.startDate)} → {formatDate(project.targetEndDate)}</span>
                            </div>
                            {project.actualEndDate && (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Cerrado: {formatDate(project.actualEndDate)}</span>
                                </div>
                                <ClosureBadge actualEndDate={project.actualEndDate} targetEndDate={project.targetEndDate} />
                              </div>
                            )}
                            {project.archivedAt && (
                              <div className="flex items-center gap-1">
                                <Archive className="w-4 h-4" />
                                <span>Archivado: {formatDate(project.archivedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Sprints', value: project.stats.sprintsCount },
                          { label: 'Tickets', value: project.stats.ticketsCount },
                          { label: 'Equipo', value: project.stats.membersCount },
                        ].map(({ label, value }) => (
                          <div key={label} className={`${colors.cardDarker} rounded-lg p-3`}>
                            <p className={`text-xs ${colors.textMuted} mb-1`}>{label}</p>
                            <p className={`text-lg font-bold ${colors.textPrimary}`}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 shrink-0">
                      <Link to={`/archived/${project.id}`}>
                        <Button variant="primary" icon={Eye} className="w-full">Ver métricas</Button>
                      </Link>
                      <button
                        onClick={() => setConfirmProject(project)}
                        disabled={restoring === project.id}
                        className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors
                          ${theme === 'dark'
                            ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                            : 'border-green-600/30 text-green-700 hover:bg-green-500/10'}
                          disabled:opacity-50`}
                      >
                        {restoring === project.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <RotateCcw className="w-3 h-3" />}
                        Restaurar
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <Link to="/projects">
            <Button variant="outline">Volver a Proyectos Activos</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
