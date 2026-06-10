import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Search, Plus, Target, AlertTriangle, TrendingUp, TrendingDown, Clock, Grid3x3, List, ArrowRight, Users, BarChart3, CheckCircle2, XCircle, UserPlus, X, Calendar, Briefcase, Eye, EyeOff } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authFetch } from '../../services/api';

type ViewMode = 'grid' | 'table';

interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'PM' | 'DEVELOPER' | 'VIEWER';
  avatarUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_SETUP';
}

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

interface ProjectAnalytics {
  kpis: {
    progress: number;
    plannedProgress: number;
    scheduleVariance: number;
    spi: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    blockedTickets: number;
    delayedMilestones: number;
  };
}

interface EnrichedProject extends BackendProject {
  analytics: ProjectAnalytics | null;
}

interface CreateProjectResponse {
  message: string;
  project: {
    id: string;
    name: string;
    code: string;
  };
}

export function Projects() {
  const { user, theme } = useAuth();
  const role = user?.role || 'DEVELOPER';

  const [backendUsers, setBackendUsers] = useState<BackendUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState('');
  const [backendProjects, setBackendProjects] = useState<EnrichedProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState('');

  const [projectForm, setProjectForm] = useState({
    name: '',
    code: '',
    description: '',
    pmId: '',
    startDate: '',
    targetEndDate: '',
    budget: '',
    riskLevel: 'LOW',
  });

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      setProjectsError('');

      const data = await authFetch<{ projects: BackendProject[] }>('/projects');

      const analyticsResults = await Promise.allSettled(
        data.projects.map((p) =>
          authFetch<ProjectAnalytics>(`/analytics/project/${p.id}/dashboard`)
        )
      );

      const enriched: EnrichedProject[] = data.projects.map((p, i) => ({
        ...p,
        analytics:
          analyticsResults[i].status === 'fulfilled'
            ? (analyticsResults[i] as PromiseFulfilledResult<ProjectAnalytics>).value
            : null,
      }));

      setBackendProjects(enriched);
    } catch (err: any) {
      setProjectsError(err.message || 'No se pudieron cargar los proyectos');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user?.id]);
  useEffect(() => {
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await authFetch<{ users: BackendUser[] }>('/users');
      setBackendUsers(data.users);
    } catch (err: any) {
      console.error('No se pudieron cargar los usuarios:', err.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  loadUsers();
}, []);

  const pmOptions = backendUsers.filter(
    (u) => u.role === 'PM' || u.role === 'ADMIN'
  );

  const generateProjectCode = (name: string) => {
    const words = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) return '';

    if (words.length === 1) {
      return words[0].slice(0, 6);
    }

    return words.map((word) => word[0]).join('').slice(0, 6);
  };

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', role: '', temporaryPassword: '' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userError, setUserError] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);

  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    bgSecondary: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#E5DFD3]',
    bgTertiary: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#D8D0C0]',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    borderStrong: theme === 'dark' ? 'border-white/20' : 'border-[#4A453D]/20',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    textSecondary: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
    hover: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-[#4A453D]/5',
    hoverBorder: theme === 'dark' ? 'hover:border-white/20' : 'hover:border-[#4A453D]/20',
    accent: theme === 'dark' ? '#E31837' : '#5F0229',
    accentHover: theme === 'dark' ? '#C41530' : '#4A0120',
  };

  const userProjects = backendProjects;
  const totalProjects = userProjects.length;
  const thisMonthCount = userProjects.filter((p) => {
    const created = new Date(p.createdAt);
    return Date.now() - created.getTime() < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const projectsWithAnalytics = userProjects.filter((p) => p.analytics);

  const projectsAtRisk = userProjects.filter((p) => {
    const risk = p.analytics?.kpis.risk ?? p.riskLevel;
    return risk === 'HIGH' || risk === 'CRITICAL';
  }).length;

  const avgProgress =
    projectsWithAnalytics.length > 0
      ? Math.round(
          projectsWithAnalytics.reduce((s, p) => s + p.analytics!.kpis.progress, 0) /
            projectsWithAnalytics.length
        )
      : null;

  const avgScheduleVariance =
    projectsWithAnalytics.length > 0
      ? Math.round(
          projectsWithAnalytics.reduce((s, p) => s + p.analytics!.kpis.scheduleVariance, 0) /
            projectsWithAnalytics.length
        )
      : null;

  const filteredProjects = userProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highRiskProjects = userProjects.filter((p) => {
    const risk = p.analytics?.kpis.risk ?? p.riskLevel;
    return risk === 'HIGH' || risk === 'CRITICAL';
  });

  const delayedMilestonesProjects = userProjects.filter(
    (p) => p.analytics && p.analytics.kpis.delayedMilestones >= 1
  );
  const negativeTrendProjects = userProjects.filter(
    (p) => p.analytics && p.analytics.kpis.scheduleVariance < -10
  );

  const navigate = useNavigate();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'LOW':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return theme === 'dark'
          ? 'bg-white/10 text-white border-white/20'
          : 'bg-[#4A453D]/10 text-[#4A453D] border-[#4A453D]/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ON_HOLD':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ARCHIVED':
        return 'bg-white/10 text-white border-white/20';
      default:
        return theme === 'dark'
          ? 'bg-white/10 text-white border-white/20'
          : 'bg-[#4A453D]/10 text-[#4A453D] border-[#4A453D]/20';
    }
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setProjectError('');

      if (!projectForm.name.trim()) {
        setProjectError('El nombre del proyecto es obligatorio');
        return;
      }

      if (!projectForm.code.trim()) {
        setProjectError('El código del proyecto es obligatorio');
        return;
      }

      if (!projectForm.startDate || !projectForm.targetEndDate) {
        setProjectError('Debes seleccionar fecha de inicio y fin');
        return;
      }

      if (new Date(projectForm.targetEndDate) < new Date(projectForm.startDate)) {
        setProjectError('La fecha de fin no puede ser anterior a la fecha de inicio');
        return;
      }

      setIsCreatingProject(true);

      const data = await authFetch<CreateProjectResponse>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: projectForm.name.trim(),
          code: projectForm.code.trim(),
          description: projectForm.description.trim() || null,
          pmId: projectForm.pmId || null,
          riskLevel: projectForm.riskLevel,
          startDate: projectForm.startDate,
          targetEndDate: projectForm.targetEndDate,
          budget: projectForm.budget ? Number(projectForm.budget) : null,
          memberIds: [],
        }),
      });

      toast.success('Proyecto creado correctamente');

      setShowCreateProjectModal(false);
      setProjectForm({
        name: '',
        code: '',
        description: '',
        pmId: '',
        startDate: '',
        targetEndDate: '',
        budget: '',
        riskLevel: 'LOW',
      });
      await loadProjects();
      navigate(`/project/${data.project.id}`);
    } catch (err: any) {
      setProjectError(err.message || 'No se pudo crear el proyecto');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');

    if (!userForm.fullName.trim()) { setUserError('El nombre es obligatorio'); return; }
    if (!userForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      setUserError('Introduce un email válido'); return;
    }
    if (!userForm.role) { setUserError('Selecciona un rol'); return; }
    if (!userForm.temporaryPassword.trim()) { setUserError('La contraseña temporal es obligatoria'); return; }

    try {
      setIsCreatingUser(true);
      await authFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: userForm.fullName.trim(),
          email: userForm.email.trim(),
          role: userForm.role,
          temporaryPassword: userForm.temporaryPassword.trim(),
        }),
      });
      toast.success(`Usuario ${userForm.fullName.trim()} creado. Se le enviará un OTP al correo.`);
      setShowCreateUserModal(false);
      setUserForm({ fullName: '', email: '', role: '', temporaryPassword: '' });
    } catch (err: any) {
      setUserError(err.message || 'No se pudo crear el usuario');
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* Header */}
      <motion.div
        className={`border-b ${colors.border} ${colors.bg} sticky top-0 z-20`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className={`text-3xl md:text-4xl font-bold ${colors.textPrimary} mb-2`}>Proyectos</h1>
              <p className={`text-sm ${colors.textSecondary}`}>Gestiona y monitorea todos tus proyectos asignados</p>
            </motion.div>

            {(role === 'ADMIN' || role === 'PM') && (
              <motion.div
                className="flex items-center gap-3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.button
                  onClick={() => setShowCreateUserModal(true)}
                  className={`flex items-center gap-2 px-4 py-3 ${colors.bgSecondary} border ${colors.border} rounded-xl ${colors.textPrimary} transition-all text-sm font-medium`}
                  style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 69, 61, 0.1)' }}
                  whileHover={{ scale: 1.02, borderColor: colors.accent, backgroundColor: `${colors.accent}10` }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Usuario</span>
                </motion.button>
                <motion.button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-white transition-all text-sm font-medium"
                  style={{ backgroundColor: colors.accent }}
                  whileHover={{ scale: 1.02, backgroundColor: colors.accentHover }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Proyecto</span>
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Search & View Toggle */}
          <motion.div
            className="flex flex-col lg:flex-row gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textSecondary}`} />
              <input
                type="text"
                placeholder="Buscar proyectos por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 ${colors.bgSecondary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`}
                style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 69, 61, 0.1)' }}
                onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                onBlur={(e) => (e.target.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 69, 61, 0.1)')}
              />
            </div>

            <div className={`flex items-center gap-1 ${colors.bgSecondary} border ${colors.border} rounded-xl p-1`}>
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'text-white' : `${colors.textSecondary}`}`}
                style={{ backgroundColor: viewMode === 'grid' ? colors.accent : 'rgba(0,0,0,0)' }}
                whileHover={{ scale: viewMode === 'grid' ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid3x3 className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'text-white' : `${colors.textSecondary}`}`}
                style={{ backgroundColor: viewMode === 'table' ? colors.accent : 'rgba(0,0,0,0)' }}
                whileHover={{ scale: viewMode === 'table' ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="p-6 md:p-8">
        <div className="w-full">
          {/* Error & Loading */}
          {projectsError && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-[#E31837]/10 border border-[#E31837]/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-[#E31837] flex-shrink-0" />
              <p className="text-sm text-[#E31837]">{projectsError}</p>
            </div>
          )}

          {isLoadingProjects && (
            <div className="mb-6 p-4 border border-white/10 rounded-xl">
              <p className={`text-sm ${colors.textSecondary}`}>Cargando proyectos...</p>
            </div>
          )}

          {/* Resumen del Portafolio */}
          <section className="mb-8">
            <motion.h2
              className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <BarChart3 className="w-5 h-5" style={{ color: colors.accent }} />
              Resumen del Portafolio
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 - Total Proyectos */}
              <motion.div
                className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5 backdrop-blur-xl ${colors.hoverBorder} transition-all group relative overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: -8, boxShadow: theme === 'dark' ? '0 20px 40px rgba(227, 24, 55, 0.2)' : '0 20px 40px rgba(95, 2, 41, 0.15)' }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${colors.accent}15, transparent 70%)` }}
                />
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <motion.div
                    className="p-2 bg-blue-500/10 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Target className="w-5 h-5 text-blue-500" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </motion.div>
                </div>
                <p className={`text-3xl font-bold ${colors.textPrimary} mb-1 relative z-10`}>{totalProjects}</p>
                <p className={`text-sm ${colors.textSecondary} relative z-10`}>Total de Proyectos</p>
                <div className={`mt-3 pt-3 border-t ${colors.border} relative z-10`}>
                  <div className={`flex items-center gap-1 text-xs ${thisMonthCount > 0 ? 'text-green-500' : 'text-[#8E8E93]'}`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>{thisMonthCount > 0 ? `+${thisMonthCount} este mes` : 'Sin nuevos este mes'}</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 - Proyectos en Riesgo */}
              <motion.div
                className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5 backdrop-blur-xl ${colors.hoverBorder} transition-all group relative overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ y: -8, boxShadow: theme === 'dark' ? '0 20px 40px rgba(255, 59, 48, 0.2)' : '0 20px 40px rgba(255, 59, 48, 0.15)' }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255, 59, 48, 0.15), transparent 70%)' }}
                />
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <motion.div
                    className="p-2 bg-[#FF3B30]/10 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.6 }}
                  >
                    <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />
                  </motion.div>
                </div>
                <p className={`text-3xl font-bold ${colors.textPrimary} mb-1 relative z-10`}>{projectsAtRisk}</p>
                <p className={`text-sm ${colors.textSecondary} relative z-10`}>Proyectos en Riesgo</p>
                <div className={`mt-3 pt-3 border-t ${colors.border} relative z-10`}>
                  <div className="flex items-center gap-1 text-xs text-[#FF3B30]">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Requieren atención</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 - Avance Promedio */}
              <motion.div
                className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5 backdrop-blur-xl ${colors.hoverBorder} transition-all group relative overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ y: -8, boxShadow: theme === 'dark' ? '0 20px 40px rgba(175, 82, 222, 0.2)' : '0 20px 40px rgba(175, 82, 222, 0.15)' }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(175, 82, 222, 0.15), transparent 70%)' }}
                />
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <motion.div
                    className="p-2 bg-purple-500/10 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </motion.div>
                </div>
                <p className={`text-3xl font-bold ${colors.textPrimary} mb-1 relative z-10`}>
                  {avgProgress !== null ? `${avgProgress}%` : '—'}
                </p>
                <p className={`text-sm ${colors.textSecondary} relative z-10`}>Avance Promedio</p>
                <div className={`mt-3 pt-3 border-t ${colors.border} relative z-10`}>
                  {avgProgress !== null ? (
                    <div className={`flex items-center gap-1 text-xs ${avgProgress >= 50 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {avgProgress >= 50 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{avgProgress >= 50 ? 'Buen avance global' : 'Avance lento'}</span>
                    </div>
                  ) : (
                    <p className={`text-xs ${colors.textSecondary}`}>Sin datos aún</p>
                  )}
                </div>
              </motion.div>

              {/* Card 4 - Schedule Variance */}
              <motion.div
                className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5 backdrop-blur-xl ${colors.hoverBorder} transition-all group relative overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ y: -8, boxShadow: theme === 'dark' ? '0 20px 40px rgba(6, 182, 212, 0.2)' : '0 20px 40px rgba(6, 182, 212, 0.15)' }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 70%)' }}
                />
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <motion.div
                    className="p-2 bg-cyan-500/10 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Clock className="w-5 h-5 text-cyan-500" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}>
                    <TrendingDown className="w-4 h-4 text-[#FF3B30]" />
                  </motion.div>
                </div>
                <p className={`text-3xl font-bold mb-1 relative z-10 ${avgScheduleVariance !== null ? (avgScheduleVariance >= 0 ? 'text-green-500' : 'text-[#FF3B30]') : colors.textPrimary}`}>
                  {avgScheduleVariance !== null ? `${avgScheduleVariance > 0 ? '+' : ''}${avgScheduleVariance}%` : '—'}
                </p>
                <p className={`text-sm ${colors.textSecondary} relative z-10`}>Schedule Variance Prom.</p>
                <div className={`mt-3 pt-3 border-t ${colors.border} relative z-10`}>
                  {avgScheduleVariance !== null ? (
                    <div className={`flex items-center gap-1 text-xs ${avgScheduleVariance >= 0 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
                      {avgScheduleVariance >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{avgScheduleVariance >= 0 ? 'Adelantado en promedio' : 'Retrasado en promedio'}</span>
                    </div>
                  ) : (
                    <p className={`text-xs ${colors.textSecondary}`}>Sin datos aún</p>
                  )}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Proyectos */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <motion.h2
                className={`text-xl font-semibold ${colors.textPrimary} flex items-center gap-2`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Target className="w-5 h-5" style={{ color: colors.accent }} />
                Proyectos ({filteredProjects.length})
              </motion.h2>

              {searchQuery && (
                <motion.button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-medium hover:underline"
                  style={{ color: colors.accent }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  Limpiar filtros
                </motion.button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {/* Grid View */}
              {viewMode === 'grid' && (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-6 backdrop-blur-xl transition-all group relative overflow-hidden`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        y: -4,
                        borderColor: colors.accent,
                        boxShadow: theme === 'dark' ? '0 10px 30px rgba(227, 24, 55, 0.15)' : '0 10px 30px rgba(95, 2, 41, 0.1)',
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `linear-gradient(135deg, ${colors.accent}10, transparent 70%)` }}
                      />

                      {/* Header */}
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-2`}>{project.name}</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={`text-xs border ${getStatusColor(project.status)}`}>
                              {project.status}
                            </Badge>
                            <Badge className={`text-xs border ${getRiskColor(project.riskLevel)}`}>
                              Riesgo {project.riskLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Avance */}
                      {(() => {
                        const progress = project.analytics?.kpis.progress ?? null;
                        const sv = project.analytics?.kpis.scheduleVariance;
                        const spi = project.analytics?.kpis.spi;
                        const milestones = project.analytics?.kpis.delayedMilestones;
                        return (
                          <>
                            <div className="mb-4 relative z-10">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs ${colors.textSecondary}`}>Avance del proyecto</span>
                                <span className={`text-sm font-semibold ${colors.textPrimary}`}>
                                  {progress !== null ? `${progress}%` : '—'}
                                </span>
                              </div>
                              <div className={`w-full ${colors.bgTertiary} rounded-full h-2 overflow-hidden`}>
                                <div
                                  className="h-2 rounded-full transition-all duration-700"
                                  style={{ width: `${progress ?? 0}%`, backgroundColor: colors.accent }}
                                />
                              </div>
                            </div>

                            {/* Mini métricas */}
                            <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                              <motion.div className={`${colors.bgTertiary} border ${colors.border} rounded-lg p-3`} whileHover={{ scale: 1.05 }}>
                                <p className={`text-xs ${colors.textSecondary} mb-1`}>Schedule Var.</p>
                                <p className={`text-lg font-bold ${sv !== undefined ? (sv >= 0 ? 'text-green-500' : 'text-[#FF3B30]') : colors.textPrimary}`}>
                                  {sv !== undefined ? `${sv > 0 ? '+' : ''}${sv}%` : '—'}
                                </p>
                              </motion.div>

                              <motion.div className={`${colors.bgTertiary} border ${colors.border} rounded-lg p-3`} whileHover={{ scale: 1.05 }}>
                                <p className={`text-xs ${colors.textSecondary} mb-1`}>SPI</p>
                                <p className={`text-lg font-bold ${spi !== undefined ? (spi >= 1 ? 'text-green-500' : spi >= 0.8 ? 'text-yellow-500' : 'text-[#FF3B30]') : colors.textPrimary}`}>
                                  {spi !== undefined ? spi : '—'}
                                </p>
                              </motion.div>

                              <motion.div className={`${colors.bgTertiary} border ${colors.border} rounded-lg p-3`} whileHover={{ scale: 1.05 }}>
                                <p className={`text-xs ${colors.textSecondary} mb-1`}>Hitos ⏰</p>
                                <p className={`text-lg font-bold ${milestones !== undefined ? (milestones === 0 ? 'text-green-500' : 'text-[#FF3B30]') : colors.textPrimary}`}>
                                  {milestones !== undefined ? milestones : '—'}
                                </p>
                              </motion.div>
                            </div>
                          </>
                        );
                      })()}

                      {/* Footer */}
                      <div className={`flex items-center justify-between pt-4 border-t ${colors.border} relative z-10`}>
                        <div className="flex items-center gap-2">
                          <Users className={`w-4 h-4 ${colors.textSecondary}`} />
                          <span className={`text-xs ${colors.textSecondary}`}>{project.pm?.fullName || 'Sin PM'}</span>
                        </div>
                        <Link to={`/project/${project.id}`}>
                          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                            <Button variant="outline" icon={ArrowRight} className="text-xs">
                              Ver Detalle
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
                <motion.div
                  className={`${colors.bgSecondary} border ${colors.border} rounded-xl overflow-hidden`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${colors.border}`}>
                          <th className={`text-left p-4 text-xs font-semibold ${colors.textSecondary} uppercase`}>Proyecto</th>
                          <th className={`text-left p-4 text-xs font-semibold ${colors.textSecondary} uppercase`}>PM</th>
                          <th className={`text-center p-4 text-xs font-semibold ${colors.textSecondary} uppercase`}>% Avance</th>
                          <th className={`text-center p-4 text-xs font-semibold ${colors.textSecondary} uppercase`}>SPI</th>
                          <th className={`text-center p-4 text-xs font-semibold ${colors.textSecondary} uppercase`}>Hitos ⏰</th>
                          <th className={`text-center p-4 text-xs font-semibold ${colors.textSecondary} uppercase`}>Riesgo</th>
                          <th className={`text-center p-4 text-xs font-semibold ${colors.textSecondary} uppercase`}>Estado</th>
                          <th className={`text-center p-4 text-xs font-semibold ${colors.textSecondary} uppercase`}>Est. Fin</th>
                          <th className={`text-right p-4 text-xs font-semibold ${colors.textSecondary} uppercase`}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((project, index) => (
                          <motion.tr
                            key={project.id}
                            className={`border-b ${colors.border} ${colors.hover} transition-colors cursor-pointer`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{
                              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(74, 69, 61, 0.05)',
                            }}
                          >
                            <td className="p-4">
                              <p className={`text-sm font-medium ${colors.textPrimary}`}>{project.name}</p>
                            </td>
                            <td className="p-4">
                              <p className={`text-sm ${colors.textSecondary}`}>{project.pm?.fullName || 'Sin PM'}</p>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className={`w-16 h-1.5 ${colors.bgTertiary} rounded-full overflow-hidden`}>
                                  <div className="h-full rounded-full" style={{ width: `${project.analytics?.kpis.progress ?? 0}%`, backgroundColor: colors.accent }} />
                                </div>
                                <span className={`text-sm font-medium ${colors.textPrimary}`}>
                                  {project.analytics ? `${project.analytics.kpis.progress}%` : '—'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-sm font-medium ${project.analytics ? (project.analytics.kpis.spi >= 1 ? 'text-green-500' : project.analytics.kpis.spi >= 0.8 ? 'text-yellow-500' : 'text-[#FF3B30]') : colors.textSecondary}`}>
                                {project.analytics ? project.analytics.kpis.spi : '—'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-sm font-medium ${project.analytics ? (project.analytics.kpis.delayedMilestones === 0 ? 'text-green-500' : 'text-[#FF3B30]') : colors.textSecondary}`}>
                                {project.analytics ? project.analytics.kpis.delayedMilestones : '—'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {(() => {
                                const effectiveRisk = project.analytics?.kpis.risk ?? project.riskLevel;
                                return (
                                  <Badge className={`text-xs border ${getRiskColor(effectiveRisk)}`}>
                                    {effectiveRisk}
                                  </Badge>
                                );
                              })()}
                            </td>
                            <td className="p-4 text-center">
                              <Badge className={`text-xs border ${getStatusColor(project.status)}`}>
                                {project.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-sm ${colors.textSecondary}`}>
                                {new Date(project.targetEndDate).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <Link to={`/project/${project.id}`}>
                                <motion.button
                                  className="text-xs font-medium hover:underline"
                                  style={{ color: colors.accent }}
                                  whileHover={{ x: 4 }}
                                >
                                  Ver →
                                </motion.button>
                              </Link>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredProjects.length === 0 && (
              <motion.div
                className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-12 text-center`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Target className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-4`} />
                <p className={`${colors.textPrimary} font-medium mb-2`}>No se encontraron proyectos</p>
                <p className={`text-sm ${colors.textSecondary}`}>Intenta ajustar los filtros de búsqueda</p>
              </motion.div>
            )}
          </section>


        </div>
      </div>

      {/* Modal Crear Proyecto */}
      <AnimatePresence>
        {showCreateProjectModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateProjectModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className={`${colors.bgSecondary} border ${colors.border} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <div className={`sticky top-0 ${colors.bgSecondary} border-b ${colors.border} p-6 flex items-center justify-between`}>
                  <div>
                    <h2 className={`text-2xl font-bold ${colors.textPrimary} flex items-center gap-2`}>
                      <Briefcase className="w-6 h-6" style={{ color: colors.accent }} />
                      Crear Nuevo Proyecto
                    </h2>
                    <p className={`text-sm ${colors.textSecondary} mt-1`}>Completa los detalles del proyecto y asigna un PM</p>
                  </div>
                  <motion.button
                    onClick={() => setShowCreateProjectModal(false)}
                    className={`p-2 ${colors.hover} rounded-lg transition-all`}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className={`w-5 h-5 ${colors.textSecondary}`} />
                  </motion.button>
                </div>

                <form className="p-6 space-y-6" onSubmit={handleCreateProjectSubmit}>
                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Nombre del Proyecto *</label>
                    <input
                      type="text"
                      value={projectForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setProjectForm({ ...projectForm, name, code: generateProjectCode(name) });
                      }}
                      placeholder="Ej: Rediseño de plataforma móvil"
                      className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Descripción</label>
                    <textarea
                      rows={3}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Breve descripción del alcance y objetivos del proyecto..."
                      className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm resize-none`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Fecha de Inicio *</label>
                      <div className="relative">
                        <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textSecondary}`} />
                        <input
                          type="date"
                          value={projectForm.startDate}
                          onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Fecha de Fin Estimada *</label>
                      <div className="relative">
                        <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textSecondary}`} />
                        <input
                          type="date"
                          value={projectForm.targetEndDate}
                          onChange={(e) => setProjectForm({ ...projectForm, targetEndDate: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Asignar Project Manager *</label>
                    <select
                      value={projectForm.pmId}
                      onChange={(e) => setProjectForm({ ...projectForm, pmId: e.target.value })}
                      className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}
                    >
                      <option value="">Seleccionar PM...</option>
                      {pmOptions.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                          {pm.fullName} - {pm.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Presupuesto (USD)</label>
                    <input
                      type="number"
                      value={projectForm.budget}
                      onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                      placeholder="150000"
                      className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Prioridad *</label>
                      <select
                        value={projectForm.riskLevel}
                        onChange={(e) => setProjectForm({ ...projectForm, riskLevel: e.target.value })}
                        className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}
                      >
                        <option value="LOW">Bajo</option>
                        <option value="MEDIUM">Medio</option>
                        <option value="HIGH">Alto</option>
                        <option value="CRITICAL">Crítico</option>
                      </select>
                    </div>
                  </div>

                  {projectError && (
                    <div className="flex items-center gap-2 p-3 bg-[#E31837]/10 border border-[#E31837]/20 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-[#E31837] flex-shrink-0" />
                      <p className="text-sm text-[#E31837]">{projectError}</p>
                    </div>
                  )}

                  <div className={`flex items-center justify-end gap-3 pt-4 border-t ${colors.border}`}>
                    <motion.button
                      type="button"
                      onClick={() => setShowCreateProjectModal(false)}
                      className={`px-6 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} ${colors.hover} transition-all text-sm font-medium`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isCreatingProject}
                      className="px-6 py-3 rounded-xl text-white transition-all text-sm font-medium disabled:opacity-60"
                      style={{ backgroundColor: colors.accent }}
                      whileHover={{ scale: isCreatingProject ? 1 : 1.02, backgroundColor: colors.accentHover }}
                      whileTap={{ scale: isCreatingProject ? 1 : 0.98 }}
                    >
                      {isCreatingProject ? 'Creando...' : 'Crear Proyecto'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Crear Usuario */}
      <AnimatePresence>
        {showCreateUserModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateUserModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className={`${colors.bgSecondary} border ${colors.border} rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <div className={`sticky top-0 ${colors.bgSecondary} border-b ${colors.border} p-6 flex items-center justify-between`}>
                  <div>
                    <h2 className={`text-2xl font-bold ${colors.textPrimary} flex items-center gap-2`}>
                      <UserPlus className="w-6 h-6" style={{ color: colors.accent }} />
                      Crear Nuevo Usuario
                    </h2>
                    <p className={`text-sm ${colors.textSecondary} mt-1`}>Dar de alta un nuevo usuario en la plataforma</p>
                  </div>
                  <motion.button
                    onClick={() => setShowCreateUserModal(false)}
                    className={`p-2 ${colors.hover} rounded-lg transition-all`}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className={`w-5 h-5 ${colors.textSecondary}`} />
                  </motion.button>
                </div>

                <form className="p-6 space-y-5" onSubmit={handleCreateUserSubmit}>
                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Nombre Completo *</label>
                    <input
                      type="text"
                      value={userForm.fullName}
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                      placeholder="Juan Pérez"
                      className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Email Corporativo *</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="juan.perez@empresa.com"
                      className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Rol en la Plataforma *</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}
                    >
                      <option value="">Seleccionar rol...</option>
                      <option value="PM">Project Manager (PM)</option>
                      <option value="DEVELOPER">Developer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <p className={`text-xs ${colors.textSecondary} mt-1.5`}>
                      El usuario recibirá un OTP en su correo para configurar su contraseña.
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Contraseña Temporal *</label>
                    <div className="relative">
                      <input
                        type={showTempPassword ? 'text' : 'password'}
                        value={userForm.temporaryPassword}
                        onChange={(e) => setUserForm({ ...userForm, temporaryPassword: e.target.value })}
                        placeholder="Mín. 8 caracteres"
                        className={`w-full px-4 py-3 pr-11 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`}
                      />
                      <button type="button" onClick={() => setShowTempPassword(!showTempPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSecondary} hover:${colors.textPrimary}`}>
                        {showTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {userError && (
                    <div className="flex items-center gap-2 p-3 bg-[#E31837]/10 border border-[#E31837]/20 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-[#E31837] flex-shrink-0" />
                      <p className="text-sm text-[#E31837]">{userError}</p>
                    </div>
                  )}

                  <div className={`flex items-center justify-end gap-3 pt-4 border-t ${colors.border}`}>
                    <motion.button
                      type="button"
                      onClick={() => { setShowCreateUserModal(false); setUserError(''); }}
                      className={`px-6 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} ${colors.hover} transition-all text-sm font-medium`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isCreatingUser}
                      className="px-6 py-3 rounded-xl text-white transition-all text-sm font-medium disabled:opacity-60"
                      style={{ backgroundColor: colors.accent }}
                      whileHover={{ scale: isCreatingUser ? 1 : 1.02, backgroundColor: colors.accentHover }}
                      whileTap={{ scale: isCreatingUser ? 1 : 0.98 }}
                    >
                      {isCreatingUser ? 'Creando...' : 'Crear Usuario'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
