import { Header } from '../components/Header';
import { KPICard } from '../components/KPICard';
import { Button } from '../components/Button';
import { Plus, TrendingUp, Clock, AlertTriangle, Activity, CheckCircle2, ListTodo, Code, Trophy, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { projects, globalMetrics } from '../data/mockData';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { getThemeColors } from '../utils/themeColors';
import { Badge } from '../components/Badge';
export function Dashboard() {
  const {
    user,
    theme
  } = useAuth();
  const role = user?.role || 'DEVELOPER';
  const colors = getThemeColors(theme);
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  const cardHoverVariants = {
    rest: {
      scale: 1,
      y: 0
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  const userProjects = role === 'DEVELOPER' ? projects.filter(p => p.id === '1') : role === 'PM' ? projects.filter(p => user.assignedProjects?.includes(p.id)) : projects;
  if (role === 'DEVELOPER') {
    const myTickets = userProjects.flatMap(p => p.tickets.filter(t => t.assignee === user.name || t.assignee.includes(user.name)));
    const hasTickets = myTickets.length > 0;
    const completedTickets = hasTickets ? myTickets.filter(t => t.status === 'Done').length : 12;
    const inProgressTickets = hasTickets ? myTickets.filter(t => t.status === 'In Progress').length : 5;
    const blockedTickets = hasTickets ? myTickets.filter(t => t.status === 'Blocked').length : 2;
    const totalEstimation = hasTickets ? myTickets.reduce((sum, t) => sum + t.estimation, 0) : 45;
    const totalTickets = hasTickets ? myTickets.length : 19;
    const myPerformance = userProjects[0]?.team.find(m => m.id === user.id)?.performance || 87;
    const weeklyData = [{
      id: 'mon',
      day: 'Lun',
      completed: 3
    }, {
      id: 'tue',
      day: 'Mar',
      completed: 2
    }, {
      id: 'wed',
      day: 'Mié',
      completed: 5
    }, {
      id: 'thu',
      day: 'Jue',
      completed: 4
    }, {
      id: 'fri',
      day: 'Vie',
      completed: 3
    }];
    return <div className={`min-h-screen ${colors.bg}`}>
        <Header title="Mi Dashboard" subtitle={`Bienvenido, ${user.name} 👨‍💻`} />
        
        <motion.div className="p-8 space-y-8" initial="hidden" animate="show" variants={containerVariants}>
          {}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <KPICard title="Mis Tareas" value={totalTickets} icon={ListTodo} trend="up" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KPICard title="Completadas" value={completedTickets} icon={CheckCircle2} variant="default" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KPICard title="En Progreso" value={inProgressTickets} icon={Code} trend="up" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KPICard title="Mi Performance" value={`${myPerformance}%`} icon={Trophy} variant={myPerformance >= 85 ? 'default' : 'danger'} />
            </motion.div>
          </motion.div>

          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
            {}
            <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-6 hover:shadow-2xl transition-all duration-300`} variants={itemVariants} whileHover={{
            scale: 1.01,
            y: -4
          }} transition={{
            duration: 0.3
          }}>
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Actividad Semanal</h3>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>Tickets completados esta semana</p>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                  <XAxis dataKey="day" stroke={colors.chartAxis} />
                  <YAxis stroke={colors.chartAxis} />
                  <Tooltip contentStyle={{
                  backgroundColor: colors.chartTooltipBg,
                  border: `1px solid ${colors.chartTooltipBorder}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#FFFFFF' : '#29251D'
                }} />
                  <Bar dataKey="completed" fill={theme === 'dark' ? '#E31837' : '#5F0229'} radius={[8, 8, 0, 0]} animationDuration={1000} animationBegin={300} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {}
            <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-6 hover:shadow-2xl transition-all duration-300`} variants={itemVariants} whileHover={{
            scale: 1.01,
            y: -4
          }} transition={{
            duration: 0.3
          }}>
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Mis Estadísticas</h3>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>Resumen de tu desempeño</p>
              </div>
              
              <div className="space-y-4">
                <motion.div className={`flex items-center justify-between p-4 ${colors.bg} rounded-lg border ${colors.border} cursor-pointer`} whileHover={{
                scale: 1.02,
                x: 4
              }} transition={{
                duration: 0.2
              }}>
                  <div className="flex items-center gap-3">
                    <motion.div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center" whileHover={{
                    rotate: 360
                  }} transition={{
                    duration: 0.6
                  }}>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <div>
                      <p className={`text-sm ${colors.textSecondary}`}>Tasa de Completado</p>
                      <p className={`text-xl font-bold ${colors.textPrimary}`}>{Math.round(completedTickets / totalTickets * 100)}%</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div className={`flex items-center justify-between p-4 ${colors.bg} rounded-lg border ${colors.border} cursor-pointer`} whileHover={{
                scale: 1.02,
                x: 4
              }} transition={{
                duration: 0.2
              }}>
                  <div className="flex items-center gap-3">
                    <motion.div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center" whileHover={{
                    rotate: 360
                  }} transition={{
                    duration: 0.6
                  }}>
                      <Target className="w-5 h-5 text-blue-500" />
                    </motion.div>
                    <div>
                      <p className={`text-sm ${colors.textSecondary}`}>Story Points</p>
                      <p className={`text-xl font-bold ${colors.textPrimary}`}>{totalEstimation}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div className={`flex items-center justify-between p-4 ${colors.bg} rounded-lg border ${colors.border} cursor-pointer`} whileHover={{
                scale: 1.02,
                x: 4
              }} transition={{
                duration: 0.2
              }}>
                  <div className="flex items-center gap-3">
                    <motion.div className={`w-10 h-10 rounded-lg ${theme === 'dark' ? 'bg-[#E31837]/10' : 'bg-[#5F0229]/10'} flex items-center justify-center`} whileHover={{
                    rotate: 360
                  }} transition={{
                    duration: 0.6
                  }}>
                      <AlertTriangle className={`w-5 h-5 ${theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]'}`} />
                    </motion.div>
                    <div>
                      <p className={`text-sm ${colors.textSecondary}`}>Bloqueadas</p>
                      <p className={`text-xl font-bold ${colors.textPrimary}`}>{blockedTickets}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {}
          <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300`} variants={itemVariants}>
            <div className={`p-6 border-b ${colors.border}`}>
              <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Mis Tareas</h3>
              <p className={`text-sm ${colors.textSecondary} mt-1`}>Tickets asignados a mí</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${colors.border} ${theme === 'dark' ? 'bg-[#0F0F0F]/50' : 'bg-[#4A453D]/5'}`}>
                    <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                      Ticket
                    </th>
                    <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                      Proyecto
                    </th>
                    <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                      Estimación
                    </th>
                    <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                      Estado
                    </th>
                    <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                      Prioridad
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-[#4A453D]/10'}`}>
                  {userProjects.flatMap(project => project.tickets.filter(ticket => ticket.assignee === user.name || ticket.assignee.includes(user.name)).map((ticket, index) => <motion.tr key={ticket.id} className={`${colors.hover} transition-all duration-200 cursor-pointer group`} initial={{
                  opacity: 0,
                  x: -20
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  delay: index * 0.05
                }} whileHover={{
                  scale: 1.01,
                  backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(74, 69, 61, 0.05)'
                }}>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${colors.textPrimary} group-hover:${theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]'} transition-colors`}>
                              {ticket.title}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link to={`/project/${project.id}`} className={`text-sm ${colors.textSecondary} hover:${colors.textPrimary} transition-colors`}>
                              {project.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm ${colors.textPrimary}`}>{ticket.estimation} pts</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={ticket.status === 'Done' ? 'default' : ticket.status === 'Blocked' ? 'danger' : 'default'}>
                              {ticket.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <motion.span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ticket.priority === 'High' ? theme === 'dark' ? 'bg-[#E31837]/10 text-[#E31837]' : 'bg-[#5F0229]/10 text-[#5F0229]' : ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`} whileHover={{
                      scale: 1.1
                    }} transition={{
                      duration: 0.2
                    }}>
                              {ticket.priority}
                            </motion.span>
                          </td>
                        </motion.tr>))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>;
  }
  const chartData = [{
    id: 'jan',
    month: 'Ene',
    planned: 30,
    actual: 28
  }, {
    id: 'feb',
    month: 'Feb',
    planned: 50,
    actual: 45
  }, {
    id: 'mar',
    month: 'Mar',
    planned: 70,
    actual: 65
  }, {
    id: 'apr',
    month: 'Abr',
    planned: 85,
    actual: 78
  }, {
    id: 'may',
    month: 'May',
    planned: 95,
    actual: 88
  }];
  return <div className={`min-h-screen ${colors.bg}`}>
      <Header title="Dashboard" subtitle="Vista general de todos tus proyectos" />
      
      <motion.div className="p-8 space-y-8" initial="hidden" animate="show" variants={containerVariants}>
        {}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <KPICard title="Avance Global" value={`${globalMetrics.overallProgress}%`} icon={TrendingUp} trend="up" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard title="Schedule Variance Promedio" value={`${globalMetrics.avgScheduleVariance}%`} icon={Clock} trend="down" variant={globalMetrics.avgScheduleVariance < 0 ? 'danger' : 'default'} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard title="Hitos Retrasados" value={globalMetrics.delayedMilestones} icon={AlertTriangle} variant="danger" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard title="Nivel de Riesgo General" value={globalMetrics.overallRisk} icon={Activity} variant={globalMetrics.overallRisk === 'High' ? 'danger' : 'default'} />
          </motion.div>
        </motion.div>

        {}
        <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-6 hover:shadow-2xl transition-all duration-300`} variants={itemVariants} whileHover={{
        scale: 1.005,
        y: -2
      }} transition={{
        duration: 0.3
      }}>
          <div className="mb-6">
            <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Planned vs Actual</h3>
            <p className={`text-sm ${colors.textSecondary} mt-1`}>Comparativa de avance planificado y real</p>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
              <XAxis dataKey="month" stroke={colors.chartAxis} />
              <YAxis stroke={colors.chartAxis} />
              <Tooltip contentStyle={{
              backgroundColor: colors.chartTooltipBg,
              border: `1px solid ${colors.chartTooltipBorder}`,
              borderRadius: '8px',
              color: theme === 'dark' ? '#FFFFFF' : '#29251D'
            }} />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke={colors.chartAxis} strokeWidth={2} name="Planificado" animationDuration={1500} dot={{
              r: 4
            }} activeDot={{
              r: 6
            }} />
              <Line type="monotone" dataKey="actual" stroke={theme === 'dark' ? '#E31837' : '#5F0229'} strokeWidth={2} name="Real" animationDuration={1500} animationBegin={200} dot={{
              r: 4
            }} activeDot={{
              r: 6
            }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {}
        <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300`} variants={itemVariants}>
          <div className={`p-6 border-b ${colors.border}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Proyectos Activos</h3>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>Gestiona y monitorea tus proyectos</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${colors.border} ${theme === 'dark' ? 'bg-[#0F0F0F]/50' : 'bg-[#4A453D]/5'}`}>
                  <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                    Proyecto
                  </th>
                  <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                    % Avance
                  </th>
                  <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                    SV
                  </th>
                  <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                    Riesgo
                  </th>
                  <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                    Estado
                  </th>
                  <th className={`text-left px-6 py-3 text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-[#4A453D]/10'}`}>
                {userProjects.map((project, index) => <motion.tr key={project.id} className={`${colors.hover} transition-all duration-200 group cursor-pointer`} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: index * 0.08
              }} whileHover={{
                scale: 1.01,
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(74, 69, 61, 0.05)',
                transition: {
                  duration: 0.2
                }
              }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <motion.div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`} whileHover={{
                      rotate: 360,
                      scale: 1.1
                    }} transition={{
                      duration: 0.5
                    }}>
                          <Activity className={`w-5 h-5 ${theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]'}`} />
                        </motion.div>
                        <span className={`text-sm font-medium ${colors.textPrimary} group-hover:${theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]'} transition-colors`}>
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex-1 h-2 ${colors.bg} rounded-full overflow-hidden max-w-[100px]`}>
                          <motion.div className={`h-full ${theme === 'dark' ? 'bg-[#E31837]' : 'bg-[#5F0229]'} rounded-full`} initial={{
                        width: 0
                      }} animate={{
                        width: `${project.progress}%`
                      }} transition={{
                        duration: 1,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }} whileHover={{
                        boxShadow: theme === 'dark' ? '0 0 10px rgba(227, 24, 55, 0.5)' : '0 0 10px rgba(95, 2, 41, 0.5)',
                        transition: {
                          duration: 0.2
                        }
                      }} />
                        </div>
                        <span className={`text-sm ${colors.textPrimary} font-medium`}>{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <motion.span className={`text-sm font-medium ${project.scheduleVariance < 0 ? theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]' : 'text-green-500'}`} whileHover={{
                    scale: 1.15
                  }} transition={{
                    duration: 0.2
                  }}>
                        {project.scheduleVariance > 0 ? '+' : ''}{project.scheduleVariance}%
                      </motion.span>
                    </td>
                    <td className="px-6 py-4">
                      <motion.span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${project.risk === 'High' ? theme === 'dark' ? 'bg-[#E31837]/10 text-[#E31837]' : 'bg-[#5F0229]/10 text-[#5F0229]' : project.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`} whileHover={{
                    scale: 1.1
                  }} transition={{
                    duration: 0.2
                  }}>
                        {project.risk}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4">
                      <motion.span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${project.status === 'Delayed' ? theme === 'dark' ? 'bg-[#E31837]/10 text-[#E31837]' : 'bg-[#5F0229]/10 text-[#5F0229]' : project.status === 'On Track' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`} whileHover={{
                    scale: 1.1
                  }} transition={{
                    duration: 0.2
                  }}>
                        {project.status}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/project/${project.id}`}>
                        <motion.button className={`text-sm ${theme === 'dark' ? 'text-[#E31837] hover:text-[#C41530]' : 'text-[#5F0229] hover:text-[#4A0120]'} font-medium flex items-center gap-1`} whileHover={{
                      x: 4
                    }} transition={{
                      duration: 0.2
                    }}>
                          Ver detalles 
                          <motion.span animate={{
                        x: [0, 4, 0]
                      }} transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}>
                            →
                          </motion.span>
                        </motion.button>
                      </Link>
                    </td>
                  </motion.tr>)}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>;
}