import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Trophy, Medal, Flame, Crown, Star, BarChart3, TrendingUp, ChevronRight, CheckCircle2, Target } from 'lucide-react';
import { Link } from 'react-router';
const globalDevelopers = [{
  id: '1',
  name: 'Carlos Mendoza',
  avatar: '👨‍💻',
  totalPoints: 2850,
  mainProject: 'E-commerce Platform',
  highPriorityTickets: 42,
  estimationAccuracy: 94,
  position: 1,
  badge: 'Legend',
  streak: 15
}, {
  id: '2',
  name: 'Ana Rodríguez',
  avatar: '👩‍💻',
  totalPoints: 2720,
  mainProject: 'Mobile App Development',
  highPriorityTickets: 38,
  estimationAccuracy: 91,
  position: 2,
  badge: 'Master',
  streak: 12
}, {
  id: '3',
  name: 'Luis Fernández',
  avatar: '🧑‍💻',
  totalPoints: 2580,
  mainProject: 'API Integration',
  highPriorityTickets: 35,
  estimationAccuracy: 89,
  position: 3,
  badge: 'Expert',
  streak: 10
}, {
  id: '4',
  name: 'María González',
  avatar: '👩‍💼',
  totalPoints: 2340,
  mainProject: 'E-commerce Platform',
  highPriorityTickets: 31,
  estimationAccuracy: 87,
  position: 4,
  badge: 'Pro',
  streak: 8
}, {
  id: '5',
  name: 'Pedro Ramírez',
  avatar: '👨‍💼',
  totalPoints: 2150,
  mainProject: 'Mobile App Development',
  highPriorityTickets: 28,
  estimationAccuracy: 85,
  position: 5,
  badge: 'Pro',
  streak: 7
}, {
  id: '6',
  name: 'Laura Martínez',
  avatar: '👩‍🔬',
  totalPoints: 1980,
  mainProject: 'Data Migration',
  highPriorityTickets: 25,
  estimationAccuracy: 83,
  position: 6,
  badge: 'Advanced',
  streak: 5
}, {
  id: '7',
  name: 'Jorge Silva',
  avatar: '🧑‍🚀',
  totalPoints: 1820,
  mainProject: 'API Integration',
  highPriorityTickets: 22,
  estimationAccuracy: 81,
  position: 7,
  badge: 'Advanced',
  streak: 4
}, {
  id: '8',
  name: 'Sofia Torres',
  avatar: '👩‍🎨',
  totalPoints: 1650,
  mainProject: 'E-commerce Platform',
  highPriorityTickets: 19,
  estimationAccuracy: 78,
  position: 8,
  badge: 'Intermediate',
  streak: 3
}];
const topProjects = [{
  id: '1',
  name: 'E-commerce Platform',
  score: 8950,
  completion: 94,
  efficiency: 92,
  developers: 12
}, {
  id: '2',
  name: 'Mobile App Development',
  score: 7850,
  completion: 89,
  efficiency: 88,
  developers: 8
}, {
  id: '3',
  name: 'API Integration',
  score: 6720,
  completion: 85,
  efficiency: 86,
  developers: 6
}];
const weeklyTrend = [{
  week: 'Sem 1',
  ecommerce: 1850,
  mobile: 1620,
  api: 1280
}, {
  week: 'Sem 2',
  ecommerce: 2100,
  mobile: 1780,
  api: 1450
}, {
  week: 'Sem 3',
  ecommerce: 2420,
  mobile: 1950,
  api: 1680
}, {
  week: 'Sem 4',
  ecommerce: 2850,
  mobile: 2150,
  api: 1890
}];
export function Gamification() {
  const [dateFilter, setDateFilter] = useState('last-30-days');
  const {
    user,
    theme
  } = useAuth();
  const role = user?.role || 'DEVELOPER';
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
    tooltipBg: theme === 'dark' ? '#0F0F0F' : '#FFFFFF'
  };
  const top3 = globalDevelopers.slice(0, 3);
  const visibleProjects = role === 'DEVELOPER' ? topProjects.filter(p => p.id === '1') : topProjects;
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Legend':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'Master':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Expert':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'Pro':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'Advanced':
        return 'bg-gradient-to-r from-indigo-500 to-violet-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-500" />;
      default:
        return null;
    }
  };
  return <div className={`min-h-screen ${colors.bg}`}>
      {}
      <div className={`border-b ${colors.border} ${colors.card} sticky top-0 z-10`}>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${colors.textPrimary} mb-2`}>Gamificación Global</h1>
              <p className={`text-sm ${colors.textSecondary}`}>Desempeño general en todos los proyectos</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={`px-4 py-2 ${colors.inputBg} border ${colors.border} rounded-lg ${colors.textPrimary} text-sm focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all`}>
                <option value="last-7-days">Últimos 7 días</option>
                <option value="last-30-days">Últimos 30 días</option>
                <option value="last-90-days">Últimos 90 días</option>
                <option value="all-time">Todo el tiempo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <motion.h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.2,
          duration: 0.4
        }}>
            <motion.div whileHover={{
            rotate: 360,
            scale: 1.2
          }} transition={{
            duration: 0.5
          }}>
              <Trophy className="w-5 h-5 text-[#FF3B30]" />
            </motion.div>
            Top 3 Developers Globales
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {top3.map((dev, index) => <motion.div key={dev.id} className={`relative overflow-hidden ${colors.card} border rounded-xl p-6 backdrop-blur-xl transition-all cursor-pointer group ${index === 0 ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' : index === 1 ? 'border-gray-400/50 shadow-lg shadow-gray-400/20' : 'border-orange-500/50 shadow-lg shadow-orange-500/20'}`} initial={{
            opacity: 0,
            scale: 0.9,
            y: 20
          }} animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }} transition={{
            delay: index * 0.15,
            duration: 0.4
          }} whileHover={{
            scale: 1.05,
            y: -8,
            borderColor: index === 0 ? 'rgba(234, 179, 8, 0.8)' : index === 1 ? 'rgba(156, 163, 175, 0.8)' : 'rgba(249, 115, 22, 0.8)',
            boxShadow: index === 0 ? '0 20px 40px rgba(234, 179, 8, 0.3)' : index === 1 ? '0 20px 40px rgba(156, 163, 175, 0.3)' : '0 20px 40px rgba(249, 115, 22, 0.3)'
          }}>
                <div className="absolute -top-2 -right-2">
                  <motion.div className={`w-16 h-16 flex items-center justify-center ${index === 0 ? 'bg-yellow-500/20' : index === 1 ? 'bg-gray-400/20' : 'bg-orange-500/20'} rounded-full`} animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }} transition={{
                repeat: Infinity,
                duration: 8,
                ease: "linear"
              }}>
                    {getPositionIcon(dev.position)}
                  </motion.div>
                </div>

                <div className="text-center relative z-10">
                  <motion.div className={`w-20 h-20 mx-auto mb-4 text-5xl flex items-center justify-center ${colors.cardSecondary} rounded-full border-2 ${colors.border}`} whileHover={{
                scale: 1.15,
                rotate: [0, -5, 5, -5, 0]
              }} transition={{
                duration: 0.5
              }}>
                    {dev.avatar}
                  </motion.div>
                  <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-1`}>{dev.name}</h3>
                  <motion.div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4 ${getBadgeColor(dev.badge)}`} whileHover={{
                scale: 1.1
              }} transition={{
                duration: 0.2
              }}>
                    {dev.badge}
                  </motion.div>
                  
                  <motion.div className={`${colors.cardSecondary} rounded-lg p-4 mb-4 group/points cursor-pointer`} whileHover={{
                scale: 1.05
              }}>
                    <motion.p className={`text-3xl font-bold ${colors.textPrimary} mb-1`} whileHover={{
                  scale: 1.1,
                  color: '#FF3B30'
                }}>
                      {dev.totalPoints.toLocaleString()}
                    </motion.p>
                    <p className={`text-xs ${colors.textSecondary}`}>Puntos Totales</p>
                  </motion.div>

                  <div className={`flex items-center justify-center gap-2 text-sm ${colors.textSecondary}`}>
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className={`${colors.textPrimary} font-semibold`}>{dev.streak}</span>
                    <span>días streak</span>
                  </div>
                </div>
              </motion.div>)}
          </div>
        </motion.section>

        {}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3,
        duration: 0.5
      }}>
          <motion.h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.5,
          duration: 0.4
        }}>
            <Star className="w-5 h-5 text-[#FF3B30]" />
            {role === 'DEVELOPER' ? 'Mis Proyectos' : 'Proyecto con Mejor Desempeño'}
          </motion.h2>
          <motion.div className={`${colors.card} border border-[#FF3B30]/20 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden cursor-pointer`} whileHover={{
          scale: 1.02,
          borderColor: 'rgba(255, 59, 48, 0.5)'
        }} transition={{
          duration: 0.3
        }}>
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
                  {[{
                  label: 'Score General',
                  value: topProjects[0].score.toLocaleString()
                }, {
                  label: '% Cumplimiento',
                  value: topProjects[0].completion + '%'
                }, {
                  label: 'Eficiencia',
                  value: topProjects[0].efficiency + '%'
                }].map((stat, idx) => <motion.div key={idx} className={`${colors.cardSecondary} border ${colors.border} rounded-lg p-4 cursor-pointer`} whileHover={{
                  scale: 1.05,
                  y: -4
                }} transition={{
                  duration: 0.2
                }}>
                      <motion.p className={`text-2xl font-bold ${colors.textPrimary} mb-1`} whileHover={{
                    scale: 1.1,
                    color: '#FF3B30'
                  }}>
                        {stat.value}
                      </motion.p>
                      <p className={`text-xs ${colors.textSecondary}`}>{stat.label}</p>
                    </motion.div>)}
                </div>
              </div>

              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <Link to={`/gamification/project/${topProjects[0].id}`} className="flex items-center gap-2 px-6 py-3 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white rounded-lg transition-all font-medium">
                  <span>Ver Detalle</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5,
        duration: 0.5
      }}>
          <motion.h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.7,
          duration: 0.4
        }}>
            <BarChart3 className="w-5 h-5 text-[#FF3B30]" />
            Ranking Global
          </motion.h2>
          <motion.div className={`${colors.card} border ${colors.border} rounded-xl overflow-hidden`} initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.8,
          duration: 0.4
        }}>
            {}
            <div className={`grid grid-cols-12 gap-4 px-6 py-4 border-b ${colors.border} ${colors.cardSecondary}`}>
              <div className={`col-span-1 text-xs font-semibold ${colors.textSecondary}`}>#</div>
              <div className={`col-span-3 text-xs font-semibold ${colors.textSecondary}`}>Developer</div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary}`}>Proyecto Principal</div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right`}>Puntos</div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right`}>Alta Prioridad</div>
              <div className={`col-span-2 text-xs font-semibold ${colors.textSecondary} text-right`}>% Estimación</div>
            </div>

            {}
            <div className={`divide-y ${colors.border}`}>
              {globalDevelopers.map((dev, index) => {
              const isCurrentUser = role === 'DEVELOPER' && dev.id === '8';
              return <motion.div key={dev.id} className={`grid grid-cols-12 gap-4 px-6 py-4 ${colors.hover} transition-all cursor-pointer group relative ${isCurrentUser ? 'bg-[#FF3B30]/5 border-l-4 border-[#FF3B30]' : ''}`} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.9 + index * 0.05,
                duration: 0.3
              }}>
                    <div className="col-span-1 flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${dev.position === 1 ? 'bg-yellow-500/20 text-yellow-500' : dev.position === 2 ? 'bg-gray-400/20 text-gray-400' : dev.position === 3 ? 'bg-orange-500/20 text-orange-500' : `${theme === 'dark' ? 'bg-white/5' : 'bg-[#4A453D]/10'} ${colors.textSecondary}`}`}>
                        {dev.position}
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${colors.cardSecondary} flex items-center justify-center text-xl border ${colors.border} ${isCurrentUser ? 'border-2 border-[#FF3B30] ring-2 ring-[#FF3B30]/20' : ''}`}>
                        {dev.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium transition-colors ${isCurrentUser ? 'text-[#FF3B30]' : `${colors.textPrimary} group-hover:text-[#FF3B30]`}`}>
                            {isCurrentUser ? user.name : dev.name}
                          </p>
                          {isCurrentUser && <Badge variant="danger" className="text-[10px] px-2 py-0.5">Tú</Badge>}
                        </div>
                        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white mt-1 ${getBadgeColor(dev.badge)}`}>
                          {dev.badge}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <p className={`text-sm ${colors.textSecondary}`}>{dev.mainProject}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <p className={`text-sm font-semibold ${colors.textPrimary}`}>
                        {dev.totalPoints.toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <Badge variant="default">{dev.highPriorityTickets}</Badge>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${dev.estimationAccuracy >= 90 ? 'text-green-500' : dev.estimationAccuracy >= 80 ? 'text-yellow-500' : 'text-[#FF3B30]'}`}>
                          {dev.estimationAccuracy}%
                        </span>
                        {dev.estimationAccuracy >= 90 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                  </motion.div>;
            })}
            </div>
          </motion.div>
        </motion.section>

        {}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.7,
        duration: 0.5
      }}>
          <motion.h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.9,
          duration: 0.4
        }}>
            <TrendingUp className="w-5 h-5 text-[#FF3B30]" />
            Tendencia Global
          </motion.h2>
          <motion.div className={`${colors.card} border ${colors.border} rounded-xl p-6`} initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 1.0,
          duration: 0.4
        }}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                <XAxis dataKey="week" stroke={colors.chartText} tick={{
                fill: colors.chartText,
                fontSize: 12
              }} />
                <YAxis stroke={colors.chartText} tick={{
                fill: colors.chartText,
                fontSize: 12
              }} />
                <Tooltip contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '12px',
                color: theme === 'dark' ? '#FFFFFF' : '#29251D',
                padding: '12px'
              }} labelStyle={{
                color: colors.chartText,
                marginBottom: '8px'
              }} />
                <Line type="monotone" dataKey="ecommerce" stroke="#FF3B30" strokeWidth={3} name="E-commerce Platform" dot={{
                fill: '#FF3B30',
                r: 5
              }} activeDot={{
                r: 7
              }} />
                <Line type="monotone" dataKey="mobile" stroke="#007AFF" strokeWidth={3} name="Mobile App" dot={{
                fill: '#007AFF',
                r: 5
              }} activeDot={{
                r: 7
              }} />
                <Line type="monotone" dataKey="api" stroke="#34C759" strokeWidth={3} name="API Integration" dot={{
                fill: '#34C759',
                r: 5
              }} activeDot={{
                r: 7
              }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              {[{
              color: '#FF3B30',
              label: 'E-commerce Platform'
            }, {
              color: '#007AFF',
              label: 'Mobile App'
            }, {
              color: '#34C759',
              label: 'API Integration'
            }].map((legend, idx) => <div key={idx} className="flex items-center gap-2 cursor-pointer">
                  <div className="w-3 h-3 rounded-full" style={{
                backgroundColor: legend.color
              }} />
                  <span className={`text-xs ${colors.textSecondary}`}>{legend.label}</span>
                </div>)}
            </div>
          </motion.div>
        </motion.section>

        {}
        {role !== 'DEVELOPER' && <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.9,
        duration: 0.5
      }}>
            <motion.h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 1.1,
          duration: 0.4
        }}>
              <Target className="w-5 h-5 text-[#FF3B30]" />
              Ver Detalle por Proyecto
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleProjects.map((project, index) => <motion.div key={project.id} initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 1.2 + index * 0.1,
            duration: 0.3
          }} whileHover={{
            scale: 1.03,
            y: -4
          }}>
                  <Link to={`/gamification/project/${project.id}`} className={`${colors.card} border ${colors.border} rounded-xl p-6 hover:border-[#FF3B30] transition-all group block`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${colors.textPrimary} group-hover:text-[#FF3B30] transition-colors`}>
                        {project.name}
                      </h3>
                      <ChevronRight className={`w-5 h-5 ${colors.textSecondary} group-hover:text-[#FF3B30] transition-colors`} />
                    </div>
                    <div className="space-y-2">
                      {[{
                  label: 'Score',
                  value: project.score.toLocaleString()
                }, {
                  label: 'Cumplimiento',
                  value: project.completion + '%'
                }, {
                  label: 'Developers',
                  value: project.developers
                }].map((stat, idx) => <div key={idx} className="flex items-center justify-between text-sm">
                          <span className={colors.textSecondary}>{stat.label}:</span>
                          <span className={`${colors.textPrimary} font-semibold`}>
                            {stat.value}
                          </span>
                        </div>)}
                    </div>
                  </Link>
                </motion.div>)}
            </div>
          </motion.section>}
      </div>
    </div>;
}