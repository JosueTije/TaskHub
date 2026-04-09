import { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Activity, Clock, AlertTriangle, Zap, Users, CheckCircle2, ArrowRight, BarChart3, Calendar, Filter, Shield, Sparkles, Award, GitBranch, User, ListTodo, Timer, TrendingDown as TrendDown, Package, FileText } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
const strategicKPIs = {
  progress: {
    value: 68,
    trend: 'up',
    change: '+5%'
  },
  scheduleVariance: {
    value: -8,
    trend: 'down',
    change: '-3%'
  },
  spi: {
    value: 0.92,
    trend: 'down',
    change: '-0.05'
  },
  delayedMilestones: {
    value: 3,
    trend: 'up',
    change: '+1'
  },
  riskLevel: {
    value: 'High',
    trend: 'up',
    color: '#FF3B30'
  }
};
const plannedVsActual = [{
  date: 'Ene 15',
  planned: 20,
  actual: 18
}, {
  date: 'Ene 22',
  planned: 35,
  actual: 32
}, {
  date: 'Ene 29',
  planned: 50,
  actual: 45
}, {
  date: 'Feb 5',
  planned: 65,
  actual: 58
}, {
  date: 'Feb 12',
  planned: 80,
  actual: 68
}, {
  date: 'Feb 19',
  planned: 95,
  actual: 82
}];
const sprintMetrics = {
  velocity: {
    value: 42,
    target: 45,
    unit: 'points'
  },
  capacityUsed: {
    value: 38,
    total: 40,
    percentage: 95
  },
  sprintCompletion: {
    value: 89,
    target: 100
  },
  ticketsCompleted: {
    completed: 18,
    planned: 20
  },
  ticketsDragged: {
    value: 3
  },
  leadTime: {
    value: 2.5,
    unit: 'días'
  }
};
const burndownData = [{
  day: 'D1',
  remaining: 45,
  ideal: 45
}, {
  day: 'D3',
  remaining: 40,
  ideal: 38
}, {
  day: 'D5',
  remaining: 34,
  ideal: 31
}, {
  day: 'D7',
  remaining: 28,
  ideal: 24
}, {
  day: 'D9',
  remaining: 20,
  ideal: 17
}, {
  day: 'D11',
  remaining: 12,
  ideal: 10
}, {
  day: 'D13',
  remaining: 5,
  ideal: 3
}];
const developerMetrics = [{
  id: '1',
  name: 'Carlos Mendoza',
  avatar: '👨‍💻',
  ticketsCompleted: 24,
  avgTime: 2.1,
  estimationAccuracy: 94,
  activeBlockers: 0,
  points: 1850
}, {
  id: '2',
  name: 'María González',
  avatar: '👩‍💼',
  ticketsCompleted: 20,
  avgTime: 2.5,
  estimationAccuracy: 91,
  activeBlockers: 1,
  points: 1620
}, {
  id: '3',
  name: 'Sofia Torres',
  avatar: '👩‍🎨',
  ticketsCompleted: 18,
  avgTime: 2.8,
  estimationAccuracy: 89,
  activeBlockers: 0,
  points: 1480
}, {
  id: '4',
  name: 'Diego Morales',
  avatar: '🧑‍💻',
  ticketsCompleted: 16,
  avgTime: 3.2,
  estimationAccuracy: 86,
  activeBlockers: 2,
  points: 1320
}, {
  id: '5',
  name: 'Andrea López',
  avatar: '👩‍🔧',
  ticketsCompleted: 14,
  avgTime: 3.5,
  estimationAccuracy: 84,
  activeBlockers: 1,
  points: 1180
}];
const performanceComparison = developerMetrics.map(dev => ({
  name: dev.name.split(' ')[0],
  value: dev.ticketsCompleted
}));
const predictiveMetrics = {
  failureProbability: 72,
  estimatedImpact: 12,
  riskFactors: [{
    factor: 'Hitos retrasados',
    impact: 'Alto',
    value: 35
  }, {
    factor: 'Bloqueadores activos',
    impact: 'Medio',
    value: 25
  }, {
    factor: 'Baja velocidad sprint',
    impact: 'Medio',
    value: 20
  }, {
    factor: 'Rotación de equipo',
    impact: 'Bajo',
    value: 15
  }],
  aiInsight: 'El proyecto muestra señales críticas de retraso. Los 3 hitos retrasados y el SPI de 0.92 indican que el proyecto avanza 8% más lento de lo planeado. Se recomienda aumentar recursos en un 20% o replantear el alcance del sprint actual para recuperar el cronograma.'
};
const projectScore = {
  value: 68,
  maxValue: 100,
  classification: 'En Riesgo',
  color: '#FF3B30'
};
const sprintDetailedMetrics = {
  name: 'Sprint 12',
  duration: '2 semanas',
  status: 'Active',
  daysRemaining: 3,
  totalDays: 14,
  velocity: {
    current: 42,
    previous: 38,
    target: 45
  },
  capacity: {
    total: 40,
    used: 38,
    remaining: 2
  },
  tickets: {
    total: 20,
    completed: 18,
    inProgress: 2,
    blocked: 0,
    dragged: 3
  },
  cycleTime: {
    avg: 2.5,
    min: 1.2,
    max: 4.8
  },
  throughput: {
    value: 1.8,
    unit: 'tickets/día'
  },
  wip: {
    current: 2,
    limit: 5
  }
};
const sprintBurndown = [{
  day: 'D1',
  remaining: 45,
  ideal: 45,
  completed: 0
}, {
  day: 'D2',
  remaining: 43,
  ideal: 42,
  completed: 2
}, {
  day: 'D3',
  remaining: 40,
  ideal: 38,
  completed: 5
}, {
  day: 'D5',
  remaining: 34,
  ideal: 31,
  completed: 11
}, {
  day: 'D7',
  remaining: 28,
  ideal: 24,
  completed: 17
}, {
  day: 'D9',
  remaining: 20,
  ideal: 17,
  completed: 25
}, {
  day: 'D11',
  remaining: 12,
  ideal: 10,
  completed: 33
}, {
  day: 'D13',
  remaining: 5,
  ideal: 3,
  completed: 40
}];
const sprintTeamPerformance = [{
  name: 'Carlos',
  completed: 6,
  inProgress: 1,
  avgTime: 2.1
}, {
  name: 'María',
  completed: 5,
  inProgress: 0,
  avgTime: 2.5
}, {
  name: 'Sofia',
  completed: 4,
  inProgress: 1,
  avgTime: 2.8
}, {
  name: 'Diego',
  completed: 3,
  inProgress: 0,
  avgTime: 3.2
}];
const sprintVelocityHistory = [{
  sprint: 'S8',
  velocity: 35,
  commitment: 40
}, {
  sprint: 'S9',
  velocity: 38,
  commitment: 42
}, {
  sprint: 'S10',
  velocity: 36,
  commitment: 40
}, {
  sprint: 'S11',
  velocity: 38,
  commitment: 43
}, {
  sprint: 'S12',
  velocity: 42,
  commitment: 45
}];
const sprintTicketsByPriority = [{
  priority: 'High',
  completed: 8,
  total: 9
}, {
  priority: 'Medium',
  completed: 7,
  total: 8
}, {
  priority: 'Low',
  completed: 3,
  total: 3
}];
const developerDetail = {
  id: '1',
  name: 'Carlos Mendoza',
  avatar: '👨‍💻',
  role: 'Senior Frontend Developer',
  level: 'Legend',
  activeProject: 'E-commerce Platform'
};
const developerKPIs = {
  ticketsCompleted: {
    value: 24,
    change: '+3',
    trend: 'up'
  },
  avgCycleTime: {
    value: 2.1,
    change: '-0.3',
    trend: 'up'
  },
  estimationAccuracy: {
    value: 94,
    change: '+2%',
    trend: 'up'
  },
  codeReviews: {
    value: 18,
    change: '+5',
    trend: 'up'
  },
  activeBlockers: {
    value: 0,
    change: '0',
    trend: 'neutral'
  },
  points: {
    value: 1850,
    change: '+240',
    trend: 'up'
  }
};
const developerWeeklyActivity = [{
  week: 'Sem 1',
  tickets: 4,
  points: 95,
  reviews: 3
}, {
  week: 'Sem 2',
  tickets: 5,
  points: 120,
  reviews: 4
}, {
  week: 'Sem 3',
  tickets: 6,
  points: 140,
  reviews: 5
}, {
  week: 'Sem 4',
  tickets: 5,
  points: 115,
  reviews: 4
}, {
  week: 'Sem 5',
  tickets: 7,
  points: 165,
  reviews: 6
}];
const developerTicketDistribution = [{
  name: 'High Priority',
  value: 12,
  color: '#FF3B30'
}, {
  name: 'Medium Priority',
  value: 8,
  color: '#FF9500'
}, {
  name: 'Low Priority',
  value: 4,
  color: '#34C759'
}];
const developerCycleTimeBreakdown = [{
  stage: 'To Do',
  time: 0.5
}, {
  stage: 'In Progress',
  time: 1.2
}, {
  stage: 'Code Review',
  time: 0.8
}, {
  stage: 'Testing',
  time: 0.4
}, {
  stage: 'Done',
  time: 0
}];
const developerSprintContribution = [{
  sprint: 'S8',
  completion: 85,
  velocity: 32
}, {
  sprint: 'S9',
  completion: 90,
  velocity: 36
}, {
  sprint: 'S10',
  completion: 87,
  velocity: 33
}, {
  sprint: 'S11',
  completion: 92,
  velocity: 38
}, {
  sprint: 'S12',
  completion: 96,
  velocity: 42
}];
const developerRecentTickets = [{
  id: 'TH-145',
  title: 'Implement payment gateway',
  priority: 'High',
  status: 'Done',
  time: 2.5,
  estimate: 3
}, {
  id: 'TH-142',
  title: 'Fix checkout bug',
  priority: 'High',
  status: 'Done',
  time: 1.8,
  estimate: 2
}, {
  id: 'TH-138',
  title: 'Refactor product catalog',
  priority: 'Medium',
  status: 'Done',
  time: 2.2,
  estimate: 2
}, {
  id: 'TH-134',
  title: 'Add loading states',
  priority: 'Low',
  status: 'Done',
  time: 1.5,
  estimate: 1
}, {
  id: 'TH-148',
  title: 'Optimize performance',
  priority: 'High',
  status: 'In Progress',
  time: 1.2,
  estimate: 3
}];
export function Metrics() {
  const [filterType, setFilterType] = useState<'project' | 'developer'>('developer');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSprint, setSelectedSprint] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const {
    theme
  } = useAuth();
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
    tooltipText: theme === 'dark' ? '#FFFFFF' : '#29251D'
  };
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#FF9500';
    return '#FF3B30';
  };
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Estable';
    return 'En Riesgo';
  };
  return <div className={`min-h-screen ${colors.bg}`}>
      {}
      <motion.div className={`border-b ${colors.border} ${colors.card} sticky top-0 z-50`} initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4
    }}>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.4,
            delay: 0.1
          }}>
              <h1 className={`text-2xl md:text-3xl font-bold ${colors.textPrimary} mb-2`}>Centro de Métricas</h1>
              <p className={`text-sm ${colors.textSecondary}`}>
                {filterType === 'project' && selectedSprint ? 'Métricas detalladas del sprint seleccionado' : filterType === 'project' && selectedProject ? 'Análisis estratégico y operativo del proyecto' : ''}
                {filterType === 'developer' && 'Análisis de desempeño individual'}
              </p>
            </motion.div>
          </div>

          {}
          <motion.div className="flex flex-col md:flex-row gap-3" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.4,
          delay: 0.2
        }}>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{
              rotate: 180
            }} transition={{
              duration: 0.3
            }}>
                <Filter className={`w-4 h-4 ${colors.textSecondary}`} />
              </motion.div>
              <select value={filterType} onChange={e => {
              setFilterType(e.target.value as any);
              setSelectedProject('');
              setSelectedSprint('');
            }} className={`px-4 py-2 ${colors.inputBg} border ${colors.border} rounded-lg ${colors.textPrimary} text-sm focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all`}>
                <option value="developer">Ver por Developer</option>
                <option value="project">Ver por Proyecto</option>
              </select>
            </div>

            {filterType === 'developer' && <select value={selectedDeveloper} onChange={e => setSelectedDeveloper(e.target.value)} className={`px-4 py-2 ${colors.inputBg} border ${colors.border} rounded-lg ${colors.textPrimary} text-sm focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all`}>
                <option value="">Seleccionar Developer</option>
                <option value="Carlos Mendoza">Carlos Mendoza</option>
                <option value="María González">María González</option>
                <option value="Sofia Torres">Sofia Torres</option>
                <option value="Diego Morales">Diego Morales</option>
                <option value="Andrea López">Andrea López</option>
              </select>}

            {filterType === 'project' && <>
                <select value={selectedProject} onChange={e => {
              setSelectedProject(e.target.value);
              setSelectedSprint('');
            }} className={`px-4 py-2 ${colors.inputBg} border ${colors.border} rounded-lg ${colors.textPrimary} text-sm focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all`}>
                  <option value="">Seleccionar Proyecto</option>
                  <option value="E-commerce Platform">E-commerce Platform</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="API Integration">API Integration</option>
                </select>

                {selectedProject && <select value={selectedSprint} onChange={e => setSelectedSprint(e.target.value)} className={`px-4 py-2 ${colors.inputBg} border ${colors.border} rounded-lg ${colors.textPrimary} text-sm focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all`}>
                    <option value="">Seleccionar Sprint</option>
                    <option value="Sprint 12">Sprint 12 (Actual)</option>
                    <option value="Sprint 11">Sprint 11</option>
                    <option value="Sprint 10">Sprint 10</option>
                    <option value="Sprint 9">Sprint 9</option>
                    <option value="Sprint 8">Sprint 8</option>
                  </select>}
              </>}
          </motion.div>
        </div>
      </motion.div>

      {}
      {filterType === 'developer' && selectedDeveloper && <DeveloperMetricsView developer={developerDetail} colors={colors} />}
      {filterType === 'project' && selectedProject && !selectedSprint && <ProjectMetricsView colors={colors} />}
      {filterType === 'project' && selectedProject && selectedSprint && <SprintMetricsView sprint={sprintDetailedMetrics} colors={colors} />}
      
      {}
      {filterType === 'developer' && !selectedDeveloper && <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <User className={`w-16 h-16 ${colors.textSecondary} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-2`}>Selecciona un Developer</h3>
            <p className={`text-sm ${colors.textSecondary}`}>Elige un developer del filtro para ver sus métricas de desempeño</p>
          </div>
        </div>}
      {filterType === 'project' && !selectedProject && <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className={`w-16 h-16 ${colors.textSecondary} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-2`}>Selecciona un Proyecto</h3>
            <p className={`text-sm ${colors.textSecondary}`}>Elige un proyecto del filtro para ver sus métricas estratégicas</p>
          </div>
        </div>}
    </div>;
}
function ProjectMetricsView({
  colors
}: {
  colors: any;
}) {
  return <div className="p-6 md:p-8 space-y-8">
      {}
      <section>
        <motion.h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`} initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4
      }}>
          <motion.div whileHover={{
          rotate: 360,
          scale: 1.2
        }} transition={{
          duration: 0.5
        }}>
            <Target className="w-5 h-5 text-[#FF3B30]" />
          </motion.div>
          Métricas Estratégicas del Proyecto
        </motion.h2>
        
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden group cursor-pointer" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.05
        }} whileHover={{
          scale: 1.02,
          borderColor: 'rgba(59, 130, 246, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-start justify-between mb-3 relative z-10">
              <motion.div className="p-2 bg-blue-500/10 rounded-lg" whileHover={{
              rotate: [0, -10, 10, -10, 0],
              scale: 1.1
            }} transition={{
              duration: 0.5
            }}>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </motion.div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-500 font-semibold">{strategicKPIs.progress.change}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 relative z-10">{strategicKPIs.progress.value}%</p>
            <p className="text-xs text-[#8E8E93] relative z-10">Avance Actual</p>
          </motion.div>

          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden group cursor-pointer" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.1
        }} whileHover={{
          scale: 1.02,
          borderColor: 'rgba(168, 85, 247, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-start justify-between mb-3 relative z-10">
              <motion.div className="p-2 bg-purple-500/10 rounded-lg" whileHover={{
              rotate: [0, 10, -10, 0],
              scale: 1.1
            }} transition={{
              duration: 0.5
            }}>
                <Clock className="w-5 h-5 text-purple-500" />
              </motion.div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingDown className="w-3 h-3 text-[#FF3B30]" />
                <span className="text-[#FF3B30] font-semibold">{strategicKPIs.scheduleVariance.change}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 relative z-10">{strategicKPIs.scheduleVariance.value}%</p>
            <p className="text-xs text-[#8E8E93] relative z-10">Schedule Variance</p>
          </motion.div>

          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden group cursor-pointer" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.15
        }} whileHover={{
          scale: 1.02,
          borderColor: 'rgba(34, 211, 238, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-start justify-between mb-3 relative z-10">
              <motion.div className="p-2 bg-cyan-500/10 rounded-lg" whileHover={{
              scale: 1.2
            }} transition={{
              duration: 0.2
            }}>
                <Activity className="w-5 h-5 text-cyan-500" />
              </motion.div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingDown className="w-3 h-3 text-[#FF3B30]" />
                <span className="text-[#FF3B30] font-semibold">{strategicKPIs.spi.change}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 relative z-10">{strategicKPIs.spi.value}</p>
            <p className="text-xs text-[#8E8E93] relative z-10">SPI</p>
          </motion.div>

          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden group cursor-pointer" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.2
        }} whileHover={{
          scale: 1.02,
          borderColor: 'rgba(227, 24, 55, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-[#FF3B30]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-start justify-between mb-3 relative z-10">
              <motion.div className="p-2 bg-[#FF3B30]/10 rounded-lg" whileHover={{
              rotate: [0, -15, 15, -15, 0],
              scale: 1.1
            }} transition={{
              duration: 0.6
            }}>
                <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
              </motion.div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-[#FF3B30]" />
                <span className="text-[#FF3B30] font-semibold">{strategicKPIs.delayedMilestones.change}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 relative z-10">{strategicKPIs.delayedMilestones.value}</p>
            <p className="text-xs text-[#8E8E93] relative z-10">Hitos Retrasados</p>
          </motion.div>

          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden group cursor-pointer" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.25
        }} whileHover={{
          scale: 1.02,
          borderColor: 'rgba(227, 24, 55, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-[#FF3B30]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-start justify-between mb-3 relative z-10">
              <motion.div className="p-2 bg-[#FF3B30]/10 rounded-lg" whileHover={{
              rotate: [0, 20, -20, 0],
              scale: 1.15
            }} transition={{
              duration: 0.5
            }}>
                <Shield className="w-5 h-5 text-[#FF3B30]" />
              </motion.div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-[#FF3B30]" />
                <span className="text-[#FF3B30] font-semibold">Alza</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#FF3B30] mb-1 relative z-10">{strategicKPIs.riskLevel.value}</p>
            <p className="text-xs text-[#8E8E93] relative z-10">Nivel de Riesgo</p>
          </motion.div>
        </div>

        {}
        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden group" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        delay: 0.3
      }} whileHover={{
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}>
          <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 pointer-events-none" initial={{
          x: '-100%'
        }} whileHover={{
          x: '100%'
        }} transition={{
          duration: 0.8
        }} />
          <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Planned vs Actual - Evolución Histórica</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={plannedVsActual}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 12
            }} />
              <YAxis stroke="#8E8E93" tick={{
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
              <Line type="monotone" dataKey="planned" stroke="#8E8E93" strokeWidth={3} name="Planificado" dot={{
              fill: '#8E8E93',
              r: 5
            }} activeDot={{
              r: 7
            }} />
              <Line type="monotone" dataKey="actual" stroke="#007AFF" strokeWidth={3} name="Real" dot={{
              fill: '#007AFF',
              r: 5
            }} activeDot={{
              r: 7
            }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8E8E93]"></div>
              <span className="text-xs text-[#8E8E93]">Planificado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#007AFF]"></div>
              <span className="text-xs text-[#8E8E93]">Real</span>
            </div>
          </div>
        </motion.div>
      </section>

      {}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.4,
      delay: 0.4
    }}>
        <motion.h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.45
      }}>
          <motion.div whileHover={{
          rotate: 360,
          scale: 1.2
        }} transition={{
          duration: 0.4
        }}>
            <Zap className="w-5 h-5 text-[#FF3B30]" />
          </motion.div>
          Métricas de Sprint
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          <div className="space-y-4">
            {}
            <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden group" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.3,
            delay: 0.5
          }} whileHover={{
            scale: 1.02,
            borderColor: 'rgba(234, 179, 8, 0.4)'
          }}>
              <motion.div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <p className="text-sm font-medium text-[#8E8E93]">Velocidad del Sprint</p>
                <motion.div whileHover={{
                rotate: 360,
                scale: 1.2
              }} transition={{
                duration: 0.4
              }}>
                  <Zap className="w-4 h-4 text-yellow-500" />
                </motion.div>
              </div>
              <div className="flex items-baseline gap-2 mb-2 relative z-10">
                <p className="text-3xl font-bold text-white">{sprintMetrics.velocity.value}</p>
                <span className="text-sm text-[#8E8E93]">/ {sprintMetrics.velocity.target} {sprintMetrics.velocity.unit}</span>
              </div>
              <div className="w-full bg-[#0F0F0F] rounded-full h-2 relative z-10">
                <motion.div className={`h-2 rounded-full ${sprintMetrics.velocity.value >= sprintMetrics.velocity.target ? 'bg-green-500' : 'bg-yellow-500'}`} initial={{
                width: 0
              }} animate={{
                width: `${sprintMetrics.velocity.value / sprintMetrics.velocity.target * 100}%`
              }} transition={{
                duration: 0.6,
                delay: 0.6
              }}></motion.div>
              </div>
            </motion.div>

            {}
            <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden group" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.3,
            delay: 0.55
          }} whileHover={{
            scale: 1.02,
            borderColor: 'rgba(168, 85, 247, 0.4)'
          }}>
              <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <p className="text-sm font-medium text-[#8E8E93]">Capacidad vs Horas Utilizadas</p>
                <motion.div whileHover={{
                rotate: 360,
                scale: 1.2
              }} transition={{
                duration: 0.4
              }}>
                  <Clock className="w-4 h-4 text-purple-500" />
                </motion.div>
              </div>
              <div className="flex items-baseline gap-2 mb-2 relative z-10">
                <p className="text-3xl font-bold text-white">{sprintMetrics.capacityUsed.value}h</p>
                <span className="text-sm text-[#8E8E93]">/ {sprintMetrics.capacityUsed.total}h ({sprintMetrics.capacityUsed.percentage}%)</span>
              </div>
              <div className="w-full bg-[#0F0F0F] rounded-full h-2 relative z-10">
                <motion.div className="bg-purple-500 h-2 rounded-full" initial={{
                width: 0
              }} animate={{
                width: `${sprintMetrics.capacityUsed.percentage}%`
              }} transition={{
                duration: 0.6,
                delay: 0.65
              }}></motion.div>
              </div>
            </motion.div>

            {}
            <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden group" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.3,
            delay: 0.6
          }} whileHover={{
            scale: 1.02,
            borderColor: 'rgba(59, 130, 246, 0.4)'
          }}>
              <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <p className="text-sm font-medium text-[#8E8E93]">% Cumplimiento del Sprint</p>
                <motion.div whileHover={{
                scale: 1.3,
                rotate: 360
              }} transition={{
                duration: 0.4
              }}>
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </motion.div>
              </div>
              <div className="flex items-baseline gap-2 mb-2 relative z-10">
                <p className="text-3xl font-bold text-white">{sprintMetrics.sprintCompletion.value}%</p>
                <span className="text-sm text-[#8E8E93]">Target: {sprintMetrics.sprintCompletion.target}%</span>
              </div>
              <div className="w-full bg-[#0F0F0F] rounded-full h-2 relative z-10">
                <motion.div className="bg-blue-500 h-2 rounded-full" initial={{
                width: 0
              }} animate={{
                width: `${sprintMetrics.sprintCompletion.value}%`
              }} transition={{
                duration: 0.6,
                delay: 0.7
              }}></motion.div>
              </div>
            </motion.div>

            {}
            <motion.div className="grid grid-cols-3 gap-3" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3,
            delay: 0.65
          }}>
              <motion.div key="tickets-completed" className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl" whileHover={{
              scale: 1.05,
              borderColor: 'rgba(34, 197, 94, 0.4)'
            }} transition={{
              duration: 0.2
            }}>
                <p className="text-xs text-[#8E8E93] mb-2">Completados</p>
                <p className="text-2xl font-bold text-green-500">{sprintMetrics.ticketsCompleted.completed}</p>
              </motion.div>
              <motion.div key="tickets-planned" className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl" whileHover={{
              scale: 1.05,
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }} transition={{
              duration: 0.2
            }}>
                <p className="text-xs text-[#8E8E93] mb-2">Planeados</p>
                <p className="text-2xl font-bold text-white">{sprintMetrics.ticketsCompleted.planned}</p>
              </motion.div>
              <motion.div key="tickets-dragged" className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 backdrop-blur-xl" whileHover={{
              scale: 1.05,
              borderColor: 'rgba(227, 24, 55, 0.4)'
            }} transition={{
              duration: 0.2
            }}>
                <p className="text-xs text-[#8E8E93] mb-2">Arrastrados</p>
                <p className="text-2xl font-bold text-[#FF3B30]">{sprintMetrics.ticketsDragged.value}</p>
              </motion.div>
            </motion.div>

            {}
            <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden group" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.3,
            delay: 0.7
          }} whileHover={{
            scale: 1.02,
            borderColor: 'rgba(34, 211, 238, 0.4)'
          }}>
              <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <p className="text-sm font-medium text-[#8E8E93]">Lead Time Promedio</p>
                <motion.div whileHover={{
                rotate: 180,
                scale: 1.2
              }} transition={{
                duration: 0.3
              }}>
                  <Activity className="w-4 h-4 text-cyan-500" />
                </motion.div>
              </div>
              <div className="flex items-baseline gap-2 relative z-10">
                <p className="text-3xl font-bold text-white">{sprintMetrics.leadTime.value}</p>
                <span className="text-sm text-[#8E8E93]">{sprintMetrics.leadTime.unit}</span>
              </div>
            </motion.div>
          </div>

          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden group" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.4,
          delay: 0.75
        }} whileHover={{
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 pointer-events-none" initial={{
            x: '-100%'
          }} whileHover={{
            x: '100%'
          }} transition={{
            duration: 0.8
          }} />
            <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Burn Down Chart</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#8E8E93" tick={{
                fill: '#8E8E93',
                fontSize: 12
              }} />
                <YAxis stroke="#8E8E93" tick={{
                fill: '#8E8E93',
                fontSize: 12
              }} />
                <Tooltip contentStyle={{
                backgroundColor: '#0F0F0F',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px'
              }} />
                <Area type="monotone" dataKey="ideal" stroke="#8E8E93" fill="rgba(142,142,147,0.1)" strokeWidth={2} strokeDasharray="5 5" name="Ideal" />
                <Area type="monotone" dataKey="remaining" stroke="#007AFF" fill="rgba(0,122,255,0.2)" strokeWidth={3} name="Real" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#8E8E93]"></div>
                <span className="text-xs text-[#8E8E93]">Ideal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#007AFF]"></div>
                <span className="text-xs text-[#8E8E93]">Real</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.4,
      delay: 0.8
    }}>
        <motion.h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.85
      }}>
          <motion.div whileHover={{
          scale: 1.2,
          rotate: 15
        }} transition={{
          duration: 0.3
        }}>
            <Users className="w-5 h-5 text-[#FF3B30]" />
          </motion.div>
          Métricas por Developer
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <motion.div className="lg:col-span-2 bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl" initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.4,
          delay: 0.9
        }} whileHover={{
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }}>
            {}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 bg-[#0F0F0F]/50">
              <div className="col-span-3 text-xs font-semibold text-[#8E8E93]">Developer</div>
              <div className="col-span-2 text-xs font-semibold text-[#8E8E93] text-right">Tickets</div>
              <div className="col-span-2 text-xs font-semibold text-[#8E8E93] text-right">Avg Time</div>
              <div className="col-span-2 text-xs font-semibold text-[#8E8E93] text-right">% Estimación</div>
              <div className="col-span-2 text-xs font-semibold text-[#8E8E93] text-right">Bloqueadores</div>
              <div className="col-span-1 text-xs font-semibold text-[#8E8E93] text-right">Puntos</div>
            </div>

            {}
            <div className="divide-y divide-white/5">
              {developerMetrics.map((dev, index) => <motion.div key={dev.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#0F0F0F]/50 transition-all" initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3,
              delay: 0.95 + index * 0.05
            }} whileHover={{
              x: 4,
              backgroundColor: 'rgba(15, 15, 15, 0.8)'
            }}>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F0F0F] border border-white/10 flex items-center justify-center text-xl">
                      {dev.avatar}
                    </div>
                    <p className="text-sm font-medium text-white">{dev.name}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Badge variant="default">{dev.ticketsCompleted}</Badge>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-sm text-white">{dev.avgTime}d</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${dev.estimationAccuracy >= 90 ? 'text-green-500' : dev.estimationAccuracy >= 80 ? 'text-yellow-500' : 'text-[#FF3B30]'}`}>
                        {dev.estimationAccuracy}%
                      </span>
                      {dev.estimationAccuracy >= 90 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    {dev.activeBlockers > 0 ? <Badge variant="danger">{dev.activeBlockers}</Badge> : <Badge variant="default">0</Badge>}
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <span className="text-sm text-white font-semibold">{dev.points}</span>
                  </div>
                </motion.div>)}
            </div>
          </motion.div>

          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden group" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.4,
          delay: 0.95
        }} whileHover={{
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none" transition={{
            duration: 0.3
          }} />
            <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Desempeño Comparativo</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={performanceComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#8E8E93" tick={{
                fill: '#8E8E93',
                fontSize: 10
              }} />
                <YAxis dataKey="name" type="category" stroke="#8E8E93" tick={{
                fill: '#8E8E93',
                fontSize: 10
              }} width={60} />
                <Tooltip contentStyle={{
                backgroundColor: '#0F0F0F',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '11px'
              }} />
                <Bar dataKey="value" fill="#007AFF" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.section>

      {}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.4,
      delay: 1.0
    }}>
        <motion.h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 1.05
      }}>
          <motion.div whileHover={{
          rotate: 360,
          scale: 1.2
        }} animate={{
          rotate: [0, 5, -5, 0]
        }} transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}>
            <Sparkles className="w-5 h-5 text-[#FF3B30]" />
          </motion.div>
          Métricas Predictivas (IA)
        </motion.h2>

        <motion.div className="bg-gradient-to-br from-[#FF3B30]/10 to-[#1C1C1E] border border-[#FF3B30]/20 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden group" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        delay: 1.1
      }} whileHover={{
        borderColor: 'rgba(227, 24, 55, 0.4)'
      }}>
          <motion.div className="absolute inset-0 bg-gradient-to-r from-[#FF3B30]/5 via-transparent to-[#FF3B30]/5 opacity-0 group-hover:opacity-100 pointer-events-none" initial={{
          x: '-100%'
        }} whileHover={{
          x: '100%'
        }} transition={{
          duration: 1
        }} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 relative z-10">
            {}
            <motion.div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-5" initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.3,
            delay: 1.15
          }} whileHover={{
            scale: 1.02,
            borderColor: 'rgba(227, 24, 55, 0.3)'
          }}>
              <div className="flex items-center gap-2 mb-3">
                <motion.div whileHover={{
                rotate: [0, -15, 15, -15, 0],
                scale: 1.2
              }} transition={{
                duration: 0.6
              }}>
                  <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
                </motion.div>
                <p className="text-sm font-medium text-[#8E8E93]">Probabilidad de Incumplimiento</p>
              </div>
              <p className="text-4xl font-bold text-[#FF3B30] mb-1">{predictiveMetrics.failureProbability}%</p>
              <p className="text-xs text-[#8E8E93]">Alto riesgo de retraso</p>
            </motion.div>

            {}
            <motion.div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-5" initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.3,
            delay: 1.2
          }} whileHover={{
            scale: 1.02,
            borderColor: 'rgba(249, 115, 22, 0.3)'
          }}>
              <div className="flex items-center gap-2 mb-3">
                <motion.div whileHover={{
                rotate: 360,
                scale: 1.2
              }} transition={{
                duration: 0.4
              }}>
                  <Clock className="w-5 h-5 text-orange-500" />
                </motion.div>
                <p className="text-sm font-medium text-[#8E8E93]">Impacto Estimado</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-white">{predictiveMetrics.estimatedImpact}</p>
                <span className="text-lg text-[#8E8E93]">días</span>
              </div>
              <p className="text-xs text-[#8E8E93] mt-1">De retraso adicional proyectado</p>
            </motion.div>

            {}
            <motion.div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-5" initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.3,
            delay: 1.25
          }} whileHover={{
            scale: 1.02,
            borderColor: 'rgba(234, 179, 8, 0.3)'
          }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-yellow-500" />
                <p className="text-sm font-medium text-[#8E8E93]">Factores Principales</p>
              </div>
              <div className="space-y-2">
                {predictiveMetrics.riskFactors.slice(0, 3).map((factor, index) => <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-white">{factor.factor}</span>
                    <Badge variant={factor.impact === 'Alto' ? 'danger' : factor.impact === 'Medio' ? 'warning' : 'default'} className="text-[10px]">
                      {factor.value}%
                    </Badge>
                  </div>)}
              </div>
            </motion.div>
          </div>

          {}
          <motion.div className="bg-[#0F0F0F]/50 border border-[#FF3B30]/20 rounded-lg p-5 relative overflow-hidden group" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.4,
          delay: 1.3
        }} whileHover={{
          borderColor: 'rgba(227, 24, 55, 0.4)'
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-[#FF3B30]/5 via-transparent to-[#FF3B30]/5 opacity-0 group-hover:opacity-100 pointer-events-none" initial={{
            x: '-100%'
          }} whileHover={{
            x: '100%'
          }} transition={{
            duration: 0.8
          }} />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <motion.div animate={{
              rotate: [0, 5, -5, 0]
            }} transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}>
                <Sparkles className="w-5 h-5 text-[#FF3B30]" />
              </motion.div>
              <p className="text-sm font-semibold text-white">Análisis Automático IA</p>
            </div>
            <p className="text-sm text-white/90 leading-relaxed mb-4 relative z-10">
              {predictiveMetrics.aiInsight}
            </p>
            <motion.div whileHover={{
            scale: 1.05,
            x: 4
          }} whileTap={{
            scale: 0.95
          }} transition={{
            duration: 0.2
          }}>
              <Button variant="primary" icon={ArrowRight}>
                Ver Simulación Completa
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.4,
      delay: 1.35
    }}>
        <motion.h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 1.4
      }}>
          <motion.div whileHover={{
          rotate: 360,
          scale: 1.2
        }} animate={{
          rotate: [0, -5, 5, -5, 0]
        }} transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 4
        }}>
            <Award className="w-5 h-5 text-[#FF3B30]" />
          </motion.div>
          Score General del Proyecto
        </motion.h2>

        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-8 backdrop-blur-xl relative overflow-hidden group" initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.4,
        delay: 1.45
      }} whileHover={{
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}>
          <motion.div className="absolute inset-0 bg-gradient-to-br from-[#FF3B30]/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 pointer-events-none" transition={{
          duration: 0.4
        }} />
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
            {}
            <div className="relative w-[280px] h-[280px]">
              <RadialBarChart width={280} height={280} innerRadius="70%" outerRadius="100%" data={[{
              value: projectScore.value,
              fill: projectScore.color
            }]} startAngle={90} endAngle={-270}>
                <RadialBar background={{
                fill: '#0F0F0F'
              }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-white">{projectScore.value}</p>
                <p className="text-sm text-[#8E8E93]">/ {projectScore.maxValue}</p>
              </div>
            </div>

            {}
            <div className="text-center lg:text-left">
              <div className="inline-block px-4 py-2 rounded-lg mb-4 bg-[#FF3B30]/20 border border-[#FF3B30]/30">
                <p className="text-lg font-bold text-[#FF3B30]">
                  {projectScore.classification}
                </p>
              </div>
              <p className="text-3xl font-bold text-white mb-2">Score Compuesto</p>
              <p className="text-sm text-[#8E8E93] max-w-md mb-6">
                Evaluación integral basada en avance, cumplimiento de plazos, calidad de entregables, 
                desempeño del equipo y factores de riesgo identificados.
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">4</p>
                  <p className="text-xs text-[#8E8E93]">Fortalezas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">2</p>
                  <p className="text-xs text-[#8E8E93]">A Mejorar</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#FF3B30]">3</p>
                  <p className="text-xs text-[#8E8E93]">Críticos</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>;
}
function SprintMetricsView({
  sprint
}: {
  sprint: typeof sprintDetailedMetrics;
}) {
  return <div className="p-6 md:p-8 space-y-8">
      {}
      <motion.div className="bg-gradient-to-br from-blue-500/10 to-[#1C1C1E] border border-blue-500/20 rounded-xl p-6 relative overflow-hidden group" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4
    }} whileHover={{
      borderColor: 'rgba(59, 130, 246, 0.4)'
    }}>
        <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 pointer-events-none" initial={{
        x: '-100%'
      }} whileHover={{
        x: '100%'
      }} transition={{
        duration: 0.8
      }} />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div className="p-2 bg-blue-500/20 rounded-lg" whileHover={{
              rotate: 360,
              scale: 1.1
            }} transition={{
              duration: 0.5
            }}>
                <GitBranch className="w-6 h-6 text-blue-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white">{sprint.name}</h2>
              <Badge variant="default">{sprint.status}</Badge>
            </div>
            <p className="text-sm text-[#8E8E93]">{sprint.duration} • {sprint.daysRemaining} días restantes de {sprint.totalDays}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{sprint.velocity.current}</p>
              <p className="text-xs text-[#8E8E93]">Velocidad Actual</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{sprint.tickets.completed}/{sprint.tickets.total}</p>
              <p className="text-xs text-[#8E8E93]">Tickets</p>
            </div>
          </div>
        </div>
      </motion.div>

      {}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.4,
      delay: 0.2
    }}>
        <motion.h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.25
      }}>
          <motion.div whileHover={{
          rotate: 360,
          scale: 1.2
        }} transition={{
          duration: 0.4
        }}>
            <Zap className="w-5 h-5 text-[#FF3B30]" />
          </motion.div>
          KPIs del Sprint
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 relative overflow-hidden group" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.3
        }} whileHover={{
          scale: 1.03,
          borderColor: 'rgba(34, 197, 94, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <p className="text-sm font-medium text-[#8E8E93]">Velocidad</p>
              <motion.div whileHover={{
              rotate: [0, -15, 15, -15, 0],
              scale: 1.2
            }} transition={{
              duration: 0.6
            }}>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </motion.div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 relative z-10">{sprint.velocity.current}</p>
            <div className="flex items-center gap-2 text-xs relative z-10">
              <span className="text-green-500">+{sprint.velocity.current - sprint.velocity.previous}</span>
              <span className="text-[#8E8E93]">vs Sprint anterior</span>
            </div>
          </motion.div>

          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 relative overflow-hidden group" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.35
        }} whileHover={{
          scale: 1.03,
          borderColor: 'rgba(168, 85, 247, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <p className="text-sm font-medium text-[#8E8E93]">Capacidad Usada</p>
              <motion.div whileHover={{
              rotate: 360,
              scale: 1.2
            }} transition={{
              duration: 0.4
            }}>
                <Clock className="w-4 h-4 text-purple-500" />
              </motion.div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 relative z-10">{sprint.capacity.used}h</p>
            <div className="flex items-center gap-2 text-xs relative z-10">
              <span className="text-[#8E8E93]">{sprint.capacity.remaining}h restantes de {sprint.capacity.total}h</span>
            </div>
          </motion.div>

          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 relative overflow-hidden group" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.4
        }} whileHover={{
          scale: 1.03,
          borderColor: 'rgba(34, 211, 238, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <p className="text-sm font-medium text-[#8E8E93]">Cycle Time Avg</p>
              <motion.div whileHover={{
              rotate: 180,
              scale: 1.2
            }} transition={{
              duration: 0.3
            }}>
                <Timer className="w-4 h-4 text-cyan-500" />
              </motion.div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 relative z-10">{sprint.cycleTime.avg}d</p>
            <div className="flex items-center gap-2 text-xs relative z-10">
              <span className="text-[#8E8E93]">Min: {sprint.cycleTime.min}d | Max: {sprint.cycleTime.max}d</span>
            </div>
          </motion.div>

          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 relative overflow-hidden group" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.45
        }} whileHover={{
          scale: 1.03,
          borderColor: 'rgba(249, 115, 22, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <p className="text-sm font-medium text-[#8E8E93]">Throughput</p>
              <motion.div whileHover={{
              scale: 1.2
            }} transition={{
              duration: 0.2
            }}>
                <Activity className="w-4 h-4 text-orange-500" />
              </motion.div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 relative z-10">{sprint.throughput.value}</p>
            <div className="flex items-center gap-2 text-xs relative z-10">
              <span className="text-[#8E8E93]">{sprint.throughput.unit}</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 relative overflow-hidden group" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.5
      }} whileHover={{
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}>
          <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 pointer-events-none" initial={{
          x: '-100%'
        }} whileHover={{
          x: '100%'
        }} transition={{
          duration: 0.8
        }} />
          <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Burn Down Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={sprintBurndown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <YAxis stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <Tooltip contentStyle={{
              backgroundColor: '#0F0F0F',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '11px'
            }} />
              <Line type="monotone" dataKey="ideal" stroke="#8E8E93" strokeWidth={2} strokeDasharray="5 5" name="Ideal" dot={false} />
              <Line type="monotone" dataKey="remaining" stroke="#007AFF" strokeWidth={3} name="Restante" dot={{
              fill: '#007AFF',
              r: 4
            }} />
              <Line type="monotone" dataKey="completed" stroke="#34C759" strokeWidth={2} name="Completado" dot={{
              fill: '#34C759',
              r: 3
            }} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {}
        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 relative overflow-hidden group" initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.55
      }} whileHover={{
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}>
          <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 pointer-events-none" initial={{
          x: '-100%'
        }} whileHover={{
          x: '100%'
        }} transition={{
          duration: 0.8
        }} />
          <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Historial de Velocidad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sprintVelocityHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="sprint" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <YAxis stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <Tooltip contentStyle={{
              backgroundColor: '#0F0F0F',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '11px'
            }} />
              <Bar dataKey="commitment" fill="rgba(142,142,147,0.3)" name="Commitment" radius={[8, 8, 0, 0]} />
              <Bar dataKey="velocity" fill="#007AFF" name="Velocidad Real" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 relative overflow-hidden group" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.6
      }} whileHover={{
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}>
          <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none" transition={{
          duration: 0.3
        }} />
          <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Desempeño del Equipo</h3>
          <div className="space-y-3 relative z-10">
            {sprintTeamPerformance.map((member, index) => <motion.div key={index} className="bg-[#0F0F0F]/50 rounded-lg p-4" initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3,
            delay: 0.65 + index * 0.05
          }} whileHover={{
            x: 4,
            backgroundColor: 'rgba(15, 15, 15, 0.8)'
          }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{member.name}</p>
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{member.completed} completados</Badge>
                    {member.inProgress > 0 && <Badge variant="warning">{member.inProgress} en progreso</Badge>}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#8E8E93]">
                  <span>Tiempo promedio: {member.avgTime}d</span>
                </div>
              </motion.div>)}
          </div>
        </motion.div>

        {}
        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 relative overflow-hidden group" initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.65
      }} whileHover={{
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}>
          <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none" transition={{
          duration: 0.3
        }} />
          <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Tickets por Prioridad</h3>
          <div className="space-y-4 relative z-10">
            {sprintTicketsByPriority.map((item, index) => <motion.div key={index} initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.3,
            delay: 0.7 + index * 0.05
          }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{item.priority}</span>
                  <span className="text-sm text-[#8E8E93]">{item.completed}/{item.total}</span>
                </div>
                <div className="w-full bg-[#0F0F0F] rounded-full h-2">
                  <motion.div className={`h-2 rounded-full ${item.priority === 'High' ? 'bg-[#FF3B30]' : item.priority === 'Medium' ? 'bg-[#FF9500]' : 'bg-[#34C759]'}`} initial={{
                width: 0
              }} animate={{
                width: `${item.completed / item.total * 100}%`
              }} transition={{
                duration: 0.6,
                delay: 0.75 + index * 0.05
              }}></motion.div>
                </div>
              </motion.div>)}
          </div>
        </motion.div>
      </div>

      {}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.4,
      delay: 0.8
    }}>
        <motion.h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.85
      }}>
          <motion.div whileHover={{
          rotate: 360,
          scale: 1.2
        }} transition={{
          duration: 0.5
        }}>
            <Package className="w-5 h-5 text-[#FF3B30]" />
          </motion.div>
          Resumen del Sprint
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.9
        }} whileHover={{
          scale: 1.05,
          borderColor: 'rgba(59, 130, 246, 0.4)'
        }}>
            <p className="text-xs text-[#8E8E93] mb-2">En Progreso</p>
            <p className="text-3xl font-bold text-blue-500">{sprint.tickets.inProgress}</p>
          </motion.div>
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.95
        }} whileHover={{
          scale: 1.05,
          borderColor: 'rgba(227, 24, 55, 0.4)'
        }}>
            <p className="text-xs text-[#8E8E93] mb-2">Bloqueados</p>
            <p className="text-3xl font-bold text-[#FF3B30]">{sprint.tickets.blocked}</p>
          </motion.div>
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 1.0
        }} whileHover={{
          scale: 1.05,
          borderColor: 'rgba(249, 115, 22, 0.4)'
        }}>
            <p className="text-xs text-[#8E8E93] mb-2">Arrastrados</p>
            <p className="text-3xl font-bold text-orange-500">{sprint.tickets.dragged}</p>
          </motion.div>
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 1.05
        }} whileHover={{
          scale: 1.05,
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }}>
            <p className="text-xs text-[#8E8E93] mb-2">WIP Actual / Límite</p>
            <p className="text-3xl font-bold text-white">{sprint.wip.current}/{sprint.wip.limit}</p>
          </motion.div>
        </div>
      </motion.section>
    </div>;
}
function DeveloperMetricsView({
  developer
}: {
  developer: typeof developerDetail;
}) {
  return <div className="p-6 md:p-8 space-y-8">
      {}
      <motion.div className="bg-gradient-to-br from-purple-500/10 to-[#1C1C1E] border border-purple-500/20 rounded-xl p-6 relative overflow-hidden group" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4
    }} whileHover={{
      borderColor: 'rgba(168, 85, 247, 0.4)'
    }}>
        <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 pointer-events-none" initial={{
        x: '-100%'
      }} whileHover={{
        x: '100%'
      }} transition={{
        duration: 0.8
      }} />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <motion.div className="w-20 h-20 rounded-full bg-[#0F0F0F] border-2 border-purple-500 flex items-center justify-center text-4xl" whileHover={{
          scale: 1.1,
          rotate: 5
        }} transition={{
          duration: 0.3
        }}>
            {developer.avatar}
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{developer.name}</h2>
              <Badge variant="default">{developer.level}</Badge>
            </div>
            <p className="text-sm text-[#8E8E93] mb-1">{developer.role}</p>
            <p className="text-sm text-white">Proyecto: <span className="text-[#FF3B30]">{developer.activeProject}</span></p>
          </div>
        </div>
      </motion.div>

      {}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.4,
      delay: 0.2
    }}>
        <motion.h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.25
      }}>
          <motion.div whileHover={{
          rotate: 360,
          scale: 1.2
        }} transition={{
          duration: 0.4
        }}>
            <User className="w-5 h-5 text-[#FF3B30]" />
          </motion.div>
          KPIs Individuales
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {}
          <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 relative overflow-hidden group" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.3
        }} whileHover={{
          scale: 1.05,
          borderColor: 'rgba(59, 130, 246, 0.4)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <motion.div whileHover={{
              scale: 1.2
            }} transition={{
              duration: 0.2
            }}>
                <ListTodo className="w-4 h-4 text-blue-500" />
              </motion.div>
              <TrendingUp className="w-3 h-3 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1 relative z-10">{developerKPIs.ticketsCompleted.value}</p>
            <p className="text-xs text-[#8E8E93] mb-1 relative z-10">Tickets Completados</p>
            <span className="text-xs text-green-500 relative z-10">{developerKPIs.ticketsCompleted.change}</span>
          </motion.div>

          {}
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Timer className="w-4 h-4 text-cyan-500" />
              <TrendingUp className="w-3 h-3 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{developerKPIs.avgCycleTime.value}d</p>
            <p className="text-xs text-[#8E8E93] mb-1">Cycle Time Avg</p>
            <span className="text-xs text-green-500">{developerKPIs.avgCycleTime.change}d</span>
          </div>

          {}
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-4 h-4 text-green-500" />
              <TrendingUp className="w-3 h-3 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{developerKPIs.estimationAccuracy.value}%</p>
            <p className="text-xs text-[#8E8E93] mb-1">Precisión Estimación</p>
            <span className="text-xs text-green-500">{developerKPIs.estimationAccuracy.change}</span>
          </div>

          {}
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-4 h-4 text-purple-500" />
              <TrendingUp className="w-3 h-3 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{developerKPIs.codeReviews.value}</p>
            <p className="text-xs text-[#8E8E93] mb-1">Code Reviews</p>
            <span className="text-xs text-green-500">{developerKPIs.codeReviews.change}</span>
          </div>

          {}
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{developerKPIs.activeBlockers.value}</p>
            <p className="text-xs text-[#8E8E93] mb-1">Bloqueadores Activos</p>
            <span className="text-xs text-[#8E8E93]">{developerKPIs.activeBlockers.change}</span>
          </div>

          {}
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-4 h-4 text-yellow-500" />
              <TrendingUp className="w-3 h-3 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{developerKPIs.points.value}</p>
            <p className="text-xs text-[#8E8E93] mb-1">Puntos Totales</p>
            <span className="text-xs text-green-500">{developerKPIs.points.change}</span>
          </div>
        </div>
      </motion.section>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Actividad Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={developerWeeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <YAxis yAxisId="left" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <YAxis yAxisId="right" orientation="right" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <Tooltip contentStyle={{
              backgroundColor: '#0F0F0F',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '11px'
            }} />
              <Bar yAxisId="left" dataKey="tickets" fill="#007AFF" name="Tickets" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="points" stroke="#34C759" strokeWidth={3} name="Puntos" dot={{
              fill: '#34C759',
              r: 4
            }} />
              <Line yAxisId="left" type="monotone" dataKey="reviews" stroke="#FF9500" strokeWidth={2} name="Reviews" dot={{
              fill: '#FF9500',
              r: 3
            }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Distribución de Tickets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={developerTicketDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {developerTicketDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{
              backgroundColor: '#0F0F0F',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '11px'
            }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {developerTicketDistribution.map((item, index) => <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{
                backgroundColor: item.color
              }}></div>
                  <span className="text-white">{item.name}</span>
                </div>
                <span className="text-[#8E8E93]">{item.value}</span>
              </div>)}
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Desglose de Cycle Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={developerCycleTimeBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="stage" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 10
            }} />
              <YAxis stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} label={{
              value: 'Días',
              angle: -90,
              position: 'insideLeft',
              fill: '#8E8E93'
            }} />
              <Tooltip contentStyle={{
              backgroundColor: '#0F0F0F',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '11px'
            }} />
              <Bar dataKey="time" fill="#007AFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Contribución por Sprint</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={developerSprintContribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="sprint" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <YAxis yAxisId="left" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <YAxis yAxisId="right" orientation="right" stroke="#8E8E93" tick={{
              fill: '#8E8E93',
              fontSize: 11
            }} />
              <Tooltip contentStyle={{
              backgroundColor: '#0F0F0F',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '11px'
            }} />
              <Bar yAxisId="left" dataKey="velocity" fill="#007AFF" name="Velocity" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="completion" stroke="#34C759" strokeWidth={3} name="% Completion" dot={{
              fill: '#34C759',
              r: 4
            }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <section>
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-[#FF3B30]" />
          Tickets Recientes
        </h2>
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden">
          {}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 bg-[#0F0F0F]/50">
            <div className="col-span-2 text-xs font-semibold text-[#8E8E93]">ID</div>
            <div className="col-span-4 text-xs font-semibold text-[#8E8E93]">Título</div>
            <div className="col-span-2 text-xs font-semibold text-[#8E8E93]">Prioridad</div>
            <div className="col-span-2 text-xs font-semibold text-[#8E8E93] text-right">Tiempo Real</div>
            <div className="col-span-1 text-xs font-semibold text-[#8E8E93] text-right">Estimado</div>
            <div className="col-span-1 text-xs font-semibold text-[#8E8E93] text-right">Estado</div>
          </div>

          {}
          <div className="divide-y divide-white/5">
            {developerRecentTickets.map(ticket => <div key={ticket.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#0F0F0F]/50 transition-all">
                <div className="col-span-2 flex items-center">
                  <Badge variant="default">{ticket.id}</Badge>
                </div>
                <div className="col-span-4 flex items-center">
                  <p className="text-sm text-white">{ticket.title}</p>
                </div>
                <div className="col-span-2 flex items-center">
                  <Badge variant={ticket.priority === 'High' ? 'danger' : ticket.priority === 'Medium' ? 'warning' : 'default'}>
                    {ticket.priority}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <span className={`text-sm font-semibold ${ticket.time <= ticket.estimate ? 'text-green-500' : 'text-[#FF3B30]'}`}>
                    {ticket.time}d
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <span className="text-sm text-[#8E8E93]">{ticket.estimate}d</span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  {ticket.status === 'Done' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-blue-500" />}
                </div>
              </div>)}
          </div>
        </div>
      </section>
    </div>;
}