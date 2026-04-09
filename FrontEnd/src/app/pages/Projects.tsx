import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Plus, Target, AlertTriangle, TrendingUp, TrendingDown, Clock, Grid3x3, List, ArrowRight, Users, BarChart3, Sparkles, FileText, Zap, CheckCircle2, XCircle, UserPlus, X, Calendar, Briefcase } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { projects } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
type ViewMode = 'grid' | 'table';
export function Projects() {
  const {
    user,
    theme
  } = useAuth();
  const role = user?.role || 'DEVELOPER';
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
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
    accentHover: theme === 'dark' ? '#C41530' : '#4A0120'
  };
  const userProjects = role === 'DEVELOPER' ? projects.filter(p => p.id === '1') : role === 'PM' ? projects.filter(p => user.assignedProjects?.includes(p.id)) : projects;
  const totalProjects = userProjects.length;
  const projectsAtRisk = userProjects.filter(p => p.risk === 'High' || p.risk === 'Medium').length;
  const avgProgress = userProjects.length > 0 ? Math.round(userProjects.reduce((acc, p) => acc + p.progress, 0) / userProjects.length) : 0;
  const avgScheduleVariance = userProjects.length > 0 ? (userProjects.reduce((acc, p) => acc + p.scheduleVariance, 0) / userProjects.length).toFixed(1) : '0.0';
  const filteredProjects = userProjects.filter(project => project.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const highRiskProjects = userProjects.filter(p => p.risk === 'High');
  const delayedMilestonesProjects = userProjects.filter(p => p.delayedMilestones >= 3);
  const negativeTrendProjects = userProjects.filter(p => p.scheduleVariance < -10);
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return theme === 'dark' ? 'bg-white/10 text-white border-white/20' : 'bg-[#4A453D]/10 text-[#4A453D] border-[#4A453D]/20';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Delayed':
        return 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20';
      case 'Completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return theme === 'dark' ? 'bg-white/10 text-white border-white/20' : 'bg-[#4A453D]/10 text-[#4A453D] border-[#4A453D]/20';
    }
  };
  return <div className={`min-h-screen ${colors.bg}`}>
      {}
      <motion.div className={`border-b ${colors.border} ${colors.bg} sticky top-0 z-20`} initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.5
    }}>
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <motion.div initial={{
            x: -20,
            opacity: 0
          }} animate={{
            x: 0,
            opacity: 1
          }} transition={{
            delay: 0.2,
            duration: 0.5
          }}>
              <h1 className={`text-3xl md:text-4xl font-bold ${colors.textPrimary} mb-2`}>Proyectos</h1>
              <p className={`text-sm ${colors.textSecondary}`}>Gestiona y monitorea todos tus proyectos asignados</p>
            </motion.div>

            {}
            {role === 'ADMIN' && <motion.div className="flex items-center gap-3" initial={{
            x: 20,
            opacity: 0
          }} animate={{
            x: 0,
            opacity: 1
          }} transition={{
            delay: 0.3,
            duration: 0.5
          }}>
                <motion.button onClick={() => setShowCreateUserModal(true)} className={`flex items-center gap-2 px-4 py-3 ${colors.bgSecondary} border ${colors.border} rounded-xl ${colors.textPrimary} transition-all text-sm font-medium`} style={{
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 69, 61, 0.1)'
            }} whileHover={{
              scale: 1.02,
              borderColor: colors.accent,
              backgroundColor: `${colors.accent}10`
            }} whileTap={{
              scale: 0.98
            }}>
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Usuario</span>
                </motion.button>
                <motion.button onClick={() => setShowCreateProjectModal(true)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-white transition-all text-sm font-medium" style={{
              backgroundColor: colors.accent
            }} whileHover={{
              scale: 1.02,
              backgroundColor: colors.accentHover
            }} whileTap={{
              scale: 0.98
            }}>
                  <Plus className="w-4 h-4" />
                  <span>Crear Proyecto</span>
                </motion.button>
              </motion.div>}
          </div>

          {}
          <motion.div className="flex flex-col lg:flex-row gap-3" initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.4,
          duration: 0.5
        }}>
            {}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textSecondary}`} />
              <input type="text" placeholder="Buscar proyectos por nombre..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-3 ${colors.bgSecondary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`} style={{
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 69, 61, 0.1)'
            }} onFocus={e => e.target.style.borderColor = colors.accent} onBlur={e => e.target.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 69, 61, 0.1)'} />
            </div>

            {}
            <div className={`flex items-center gap-1 ${colors.bgSecondary} border ${colors.border} rounded-xl p-1`}>
              <motion.button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'text-white' : `${colors.textSecondary}`}`} style={{
              backgroundColor: viewMode === 'grid' ? colors.accent : 'rgba(0,0,0,0)'
            }} whileHover={{
              scale: viewMode === 'grid' ? 1 : 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <Grid3x3 className="w-4 h-4" />
              </motion.button>
              <motion.button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'text-white' : `${colors.textSecondary}`}`} style={{
              backgroundColor: viewMode === 'table' ? colors.accent : 'rgba(0,0,0,0)'
            }} whileHover={{
              scale: viewMode === 'table' ? 1 : 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="p-6 md:p-8">
        <div className="w-full">
          {}
          <section className="mb-8">
            <motion.h2 className={`text-xl font-semibold ${colors.textPrimary} mb-6 flex items-center gap-2`} initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.5
          }}>
              <BarChart3 className="w-5 h-5" style={{
              color: colors.accent
            }} />
              Resumen del Portafolio
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {}
              <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5 backdrop-blur-xl ${colors.hoverBorder} transition-all group relative overflow-hidden`} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.6
            }} whileHover={{
              y: -8,
              boxShadow: theme === 'dark' ? '0 20px 40px rgba(227, 24, 55, 0.2)' : '0 20px 40px rgba(95, 2, 41, 0.15)'
            }}>
                {}
                <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: `radial-gradient(circle at 50% 0%, ${colors.accent}15, transparent 70%)`
              }} />
                
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <motion.div className="p-2 bg-blue-500/10 rounded-lg" whileHover={{
                  scale: 1.1,
                  rotate: 360
                }} transition={{
                  duration: 0.6
                }}>
                    <Target className="w-5 h-5 text-blue-500" />
                  </motion.div>
                  <motion.div initial={{
                  opacity: 0
                }} whileHover={{
                  opacity: 1
                }}>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </motion.div>
                </div>
                <p className={`text-3xl font-bold ${colors.textPrimary} mb-1 relative z-10`}>{totalProjects}</p>
                <p className={`text-sm ${colors.textSecondary} relative z-10`}>Total de Proyectos</p>
                <div className={`mt-3 pt-3 border-t ${colors.border} relative z-10`}>
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>+2 este mes</span>
                  </div>
                </div>
              </motion.div>

              {}
              <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5 backdrop-blur-xl ${colors.hoverBorder} transition-all group relative overflow-hidden`} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.7
            }} whileHover={{
              y: -8,
              boxShadow: theme === 'dark' ? '0 20px 40px rgba(255, 59, 48, 0.2)' : '0 20px 40px rgba(255, 59, 48, 0.15)'
            }}>
                {}
                <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(255, 59, 48, 0.15), transparent 70%)'
              }} />
                
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <motion.div className="p-2 bg-[#FF3B30]/10 rounded-lg" whileHover={{
                  scale: 1.1,
                  rotate: [0, -10, 10, -10, 0]
                }} transition={{
                  duration: 0.6
                }}>
                    <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
                  </motion.div>
                  <motion.div initial={{
                  opacity: 0
                }} whileHover={{
                  opacity: 1
                }} animate={{
                  rotate: [0, -5, 5, -5, 0]
                }} transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}>
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

              {}
              <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5 backdrop-blur-xl ${colors.hoverBorder} transition-all group relative overflow-hidden`} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.8
            }} whileHover={{
              y: -8,
              boxShadow: theme === 'dark' ? '0 20px 40px rgba(175, 82, 222, 0.2)' : '0 20px 40px rgba(175, 82, 222, 0.15)'
            }}>
                {}
                <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(175, 82, 222, 0.15), transparent 70%)'
              }} />
                
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <motion.div className="p-2 bg-purple-500/10 rounded-lg" whileHover={{
                  scale: 1.1,
                  rotate: 360
                }} transition={{
                  duration: 0.6
                }}>
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </motion.div>
                  <motion.div initial={{
                  opacity: 0
                }} whileHover={{
                  opacity: 1
                }}>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </motion.div>
                </div>
                <p className={`text-3xl font-bold ${colors.textPrimary} mb-1 relative z-10`}>{avgProgress}%</p>
                <p className={`text-sm ${colors.textSecondary} relative z-10`}>Promedio Avance</p>
                <div className={`mt-3 pt-3 border-t ${colors.border} relative z-10`}>
                  <div className={`w-full ${colors.bgTertiary} rounded-full h-1.5 overflow-hidden`}>
                    <motion.div className="bg-purple-500 h-1.5 rounded-full" initial={{
                    width: 0
                  }} animate={{
                    width: `${avgProgress}%`
                  }} transition={{
                    duration: 1,
                    delay: 1,
                    ease: "easeOut"
                  }} />
                  </div>
                </div>
              </motion.div>

              {}
              <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5 backdrop-blur-xl ${colors.hoverBorder} transition-all group relative overflow-hidden`} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.9
            }} whileHover={{
              y: -8,
              boxShadow: theme === 'dark' ? '0 20px 40px rgba(6, 182, 212, 0.2)' : '0 20px 40px rgba(6, 182, 212, 0.15)'
            }}>
                {}
                <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 70%)'
              }} />
                
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <motion.div className="p-2 bg-cyan-500/10 rounded-lg" whileHover={{
                  scale: 1.1,
                  rotate: 360
                }} transition={{
                  duration: 0.6
                }}>
                    <Clock className="w-5 h-5 text-cyan-500" />
                  </motion.div>
                  <motion.div initial={{
                  opacity: 0
                }} whileHover={{
                  opacity: 1
                }}>
                    <TrendingDown className="w-4 h-4 text-[#FF3B30]" />
                  </motion.div>
                </div>
                <p className={`text-3xl font-bold ${colors.textPrimary} mb-1 relative z-10`}>{avgScheduleVariance}%</p>
                <p className={`text-sm ${colors.textSecondary} relative z-10`}>Schedule Variance Prom.</p>
                <div className={`mt-3 pt-3 border-t ${colors.border} relative z-10`}>
                  <div className="flex items-center gap-1 text-xs text-[#FF3B30]">
                    <TrendingDown className="w-3 h-3" />
                    <span>Por debajo del plan</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <motion.h2 className={`text-xl font-semibold ${colors.textPrimary} flex items-center gap-2`} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              delay: 1
            }}>
                <Target className="w-5 h-5" style={{
                color: colors.accent
              }} />
                Proyectos ({filteredProjects.length})
              </motion.h2>
              
              {searchQuery && <motion.button onClick={() => setSearchQuery('')} className="text-xs font-medium hover:underline" style={{
              color: colors.accent
            }} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} whileHover={{
              scale: 1.05
            }}>
                  Limpiar filtros
                </motion.button>}
            </div>

            {}
            <AnimatePresence mode="wait">
              {viewMode === 'grid' && <motion.div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.3
            }}>
                  {filteredProjects.map((project, index) => <motion.div key={project.id} className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-6 backdrop-blur-xl transition-all group relative overflow-hidden`} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: index * 0.05
              }} whileHover={{
                y: -4,
                borderColor: colors.accent,
                boxShadow: theme === 'dark' ? '0 10px 30px rgba(227, 24, 55, 0.15)' : '0 10px 30px rgba(95, 2, 41, 0.1)'
              }}>
                      {}
                      <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                  background: `linear-gradient(135deg, ${colors.accent}10, transparent 70%)`
                }} />

                      {}
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-2`}>{project.name}</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant={project.status === 'Delayed' ? 'danger' : 'default'} className="text-xs">
                              {project.status}
                            </Badge>
                            <Badge className={`text-xs border ${getRiskColor(project.risk)}`}>
                              Riesgo {project.risk}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="mb-4 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs ${colors.textSecondary}`}>Avance del proyecto</span>
                          <span className={`text-sm font-semibold ${colors.textPrimary}`}>{project.progress}%</span>
                        </div>
                        <div className={`w-full ${colors.bgTertiary} rounded-full h-2 overflow-hidden`}>
                          <motion.div className="bg-[#007AFF] h-2 rounded-full" initial={{
                      width: 0
                    }} animate={{
                      width: `${project.progress}%`
                    }} transition={{
                      duration: 1,
                      delay: 0.5 + index * 0.05
                    }} />
                        </div>
                      </div>

                      {}
                      <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                        <motion.div className={`${colors.bgTertiary} border ${colors.border} rounded-lg p-3`} whileHover={{
                    scale: 1.05
                  }}>
                          <p className={`text-xs ${colors.textSecondary} mb-1`}>Schedule Var.</p>
                          <p className={`text-lg font-bold ${project.scheduleVariance >= 0 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
                            {project.scheduleVariance}%
                          </p>
                        </motion.div>
                        
                        <motion.div className={`${colors.bgTertiary} border ${colors.border} rounded-lg p-3`} whileHover={{
                    scale: 1.05
                  }}>
                          <p className={`text-xs ${colors.textSecondary} mb-1`}>SPI</p>
                          <p className={`text-lg font-bold ${project.spi >= 1 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
                            {project.spi.toFixed(2)}
                          </p>
                        </motion.div>
                        
                        <motion.div className={`${colors.bgTertiary} border ${colors.border} rounded-lg p-3`} whileHover={{
                    scale: 1.05
                  }}>
                          <p className={`text-xs ${colors.textSecondary} mb-1`}>Hitos ⏰</p>
                          <p className={`text-lg font-bold ${project.delayedMilestones > 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>
                            {project.delayedMilestones}
                          </p>
                        </motion.div>
                      </div>

                      {}
                      <div className={`flex items-center justify-between pt-4 border-t ${colors.border} relative z-10`}>
                        <div className="flex items-center gap-2">
                          <Users className={`w-4 h-4 ${colors.textSecondary}`} />
                          <span className={`text-xs ${colors.textSecondary}`}>{project.manager}</span>
                        </div>
                        <Link to={`/project/${project.id}`}>
                          <motion.div whileHover={{
                      x: 4
                    }} transition={{
                      duration: 0.2
                    }}>
                            <Button variant="outline" icon={ArrowRight} className="text-xs">
                              Ver Detalle
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                    </motion.div>)}
                </motion.div>}

              {}
              {viewMode === 'table' && <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl overflow-hidden`} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.3
            }}>
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
                        {filteredProjects.map((project, index) => <motion.tr key={project.id} className={`border-b ${colors.border} ${colors.hover} transition-colors cursor-pointer`} initial={{
                      opacity: 0,
                      x: -20
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: index * 0.05
                    }} whileHover={{
                      backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(74, 69, 61, 0.05)'
                    }}>
                            <td className="p-4">
                              <p className={`text-sm font-medium ${colors.textPrimary}`}>{project.name}</p>
                            </td>
                            <td className="p-4">
                              <p className={`text-sm ${colors.textSecondary}`}>{project.manager}</p>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className={`w-16 ${colors.bgTertiary} rounded-full h-1.5 overflow-hidden`}>
                                  <motion.div className="bg-[#007AFF] h-1.5 rounded-full" initial={{
                              width: 0
                            }} animate={{
                              width: `${project.progress}%`
                            }} transition={{
                              duration: 0.8,
                              delay: 0.3 + index * 0.05
                            }} />
                                </div>
                                <span className={`text-sm ${colors.textPrimary}`}>{project.progress}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-sm font-semibold ${project.spi >= 1 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
                                {project.spi.toFixed(2)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-sm font-semibold ${project.delayedMilestones > 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>
                                {project.delayedMilestones}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <Badge className={`text-xs border ${getRiskColor(project.risk)}`}>
                                {project.risk}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Badge variant={project.status === 'Delayed' ? 'danger' : 'default'} className="text-xs">
                                {project.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-sm ${colors.textSecondary}`}>{project.endDate}</span>
                            </td>
                            <td className="p-4 text-right">
                              <Link to={`/project/${project.id}`}>
                                <motion.button className="text-xs font-medium hover:underline" style={{
                            color: colors.accent
                          }} whileHover={{
                            x: 4
                          }}>
                                  Ver →
                                </motion.button>
                              </Link>
                            </td>
                          </motion.tr>)}
                      </tbody>
                    </table>
                  </div>
                </motion.div>}
            </AnimatePresence>

            {filteredProjects.length === 0 && <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-12 text-center`} initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.3
          }}>
                <Target className={`w-12 h-12 ${colors.textSecondary} mx-auto mb-4`} />
                <p className={`${colors.textPrimary} font-medium mb-2`}>No se encontraron proyectos</p>
                <p className={`text-sm ${colors.textSecondary}`}>Intenta ajustar los filtros de búsqueda</p>
              </motion.div>}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8">
            {}
            <div className="space-y-8">
              {}
              {role !== 'DEVELOPER' && null}
            </div>

            {}
            {role !== 'DEVELOPER' && <aside>
                <div className="space-y-4">
                  {}
                  {delayedMilestonesProjects.length > 0 && <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5`} initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 1.2
              }} whileHover={{
                scale: 1.02
              }}>
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div whileHover={{
                    rotate: 360
                  }} transition={{
                    duration: 0.6
                  }}>
                          <XCircle className="w-5 h-5 text-orange-500" />
                        </motion.div>
                        <h3 className={`text-sm font-semibold ${colors.textPrimary}`}>Hitos Críticos</h3>
                      </div>
                      <p className="text-2xl font-bold text-orange-500 mb-2">{delayedMilestonesProjects.length}</p>
                      <p className={`text-xs ${colors.textSecondary} mb-3`}>proyectos con +3 hitos retrasados</p>
                      <div className="space-y-2">
                        {delayedMilestonesProjects.slice(0, 2).map((project, i) => <Link key={project.id} to={`/project/${project.id}`}>
                            <motion.div className={`${colors.bgTertiary} border ${colors.border} rounded-lg p-2 transition-all`} initial={{
                      opacity: 0,
                      x: 20
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: 1.3 + i * 0.1
                    }} whileHover={{
                      borderColor: 'rgb(249, 115, 22)',
                      scale: 1.02
                    }}>
                              <p className={`text-xs font-medium ${colors.textPrimary}`}>{project.name}</p>
                              <p className={`text-xs ${colors.textSecondary} mt-0.5`}>{project.delayedMilestones} hitos retrasados</p>
                            </motion.div>
                          </Link>)}
                      </div>
                    </motion.div>}

                  {}
                  {negativeTrendProjects.length > 0 && <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-5`} initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 1.4
              }} whileHover={{
                scale: 1.02
              }}>
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div whileHover={{
                    rotate: 360
                  }} transition={{
                    duration: 0.6
                  }}>
                          <TrendingDown className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                        <h3 className={`text-sm font-semibold ${colors.textPrimary}`}>Tendencia Negativa</h3>
                      </div>
                      <p className="text-2xl font-bold text-yellow-500 mb-2">{negativeTrendProjects.length}</p>
                      <p className={`text-xs ${colors.textSecondary} mb-3`}>proyectos con desviación {'<'}-10%</p>
                      <div className="space-y-2">
                        {negativeTrendProjects.slice(0, 2).map((project, i) => <Link key={project.id} to={`/project/${project.id}`}>
                            <motion.div className={`${colors.bgTertiary} border ${colors.border} rounded-lg p-2 transition-all`} initial={{
                      opacity: 0,
                      x: 20
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: 1.5 + i * 0.1
                    }} whileHover={{
                      borderColor: 'rgb(234, 179, 8)',
                      scale: 1.02
                    }}>
                              <p className={`text-xs font-medium ${colors.textPrimary}`}>{project.name}</p>
                              <p className={`text-xs ${colors.textSecondary} mt-0.5`}>Var: {project.scheduleVariance}%</p>
                            </motion.div>
                          </Link>)}
                      </div>
                    </motion.div>}

                  {}
                  {highRiskProjects.length === 0 && delayedMilestonesProjects.length === 0 && negativeTrendProjects.length === 0 && <motion.div className={`${colors.bgSecondary} border border-green-500/20 rounded-xl p-6 text-center`} initial={{
                opacity: 0,
                scale: 0.9
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                delay: 1.2,
                type: "spring"
              }}>
                      <motion.div animate={{
                  scale: [1, 1.1, 1]
                }} transition={{
                  duration: 2,
                  repeat: Infinity
                }}>
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      </motion.div>
                      <p className={`text-sm font-semibold ${colors.textPrimary} mb-2`}>Todo en Orden</p>
                      <p className={`text-xs ${colors.textSecondary}`}>No hay alertas críticas en este momento</p>
                    </motion.div>}
                </div>
              </aside>}
          </div>
        </div>
      </div>

      {}
      <AnimatePresence>
        {showCreateProjectModal && <>
            <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setShowCreateProjectModal(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto`} initial={{
            opacity: 0,
            scale: 0.9,
            y: 20
          }} animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }} exit={{
            opacity: 0,
            scale: 0.9,
            y: 20
          }} transition={{
            type: "spring",
            duration: 0.5
          }}>
                <div className={`sticky top-0 ${colors.bgSecondary} border-b ${colors.border} p-6 flex items-center justify-between`}>
                  <div>
                    <h2 className={`text-2xl font-bold ${colors.textPrimary} flex items-center gap-2`}>
                      <Briefcase className="w-6 h-6" style={{
                    color: colors.accent
                  }} />
                      Crear Nuevo Proyecto
                    </h2>
                    <p className={`text-sm ${colors.textSecondary} mt-1`}>Completa los detalles del proyecto y asigna un PM</p>
                  </div>
                  <motion.button onClick={() => setShowCreateProjectModal(false)} className={`p-2 ${colors.hover} rounded-lg transition-all`} whileHover={{
                scale: 1.1,
                rotate: 90
              }} whileTap={{
                scale: 0.95
              }}>
                    <X className={`w-5 h-5 ${colors.textSecondary}`} />
                  </motion.button>
                </div>

                <form className="p-6 space-y-6">
                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Nombre del Proyecto *</label>
                    <input type="text" placeholder="Ej: Rediseño de plataforma móvil" className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`} />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Descripción</label>
                    <textarea rows={3} placeholder="Breve descripción del alcance y objetivos del proyecto..." className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm resize-none`} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Fecha de Inicio *</label>
                      <div className="relative">
                        <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textSecondary}`} />
                        <input type="date" className={`w-full pl-10 pr-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`} />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Fecha de Fin Estimada *</label>
                      <div className="relative">
                        <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textSecondary}`} />
                        <input type="date" className={`w-full pl-10 pr-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Asignar Project Manager *</label>
                    <select className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}>
                      <option value="">Seleccionar PM...</option>
                      <option value="maria">María García - PM Senior</option>
                      <option value="carlos">Carlos Rodríguez - PM</option>
                      <option value="ana">Ana Martínez - PM</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Presupuesto (USD)</label>
                    <input type="number" placeholder="150000" className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Prioridad *</label>
                      <select className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}>
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Nivel de Riesgo Inicial *</label>
                      <select className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}>
                        <option value="low">Bajo</option>
                        <option value="medium">Medio</option>
                        <option value="high">Alto</option>
                      </select>
                    </div>
                  </div>

                  <div className={`flex items-center justify-end gap-3 pt-4 border-t ${colors.border}`}>
                    <motion.button type="button" onClick={() => setShowCreateProjectModal(false)} className={`px-6 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} ${colors.hover} transition-all text-sm font-medium`} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }}>
                      Cancelar
                    </motion.button>
                    <motion.button type="submit" className="px-6 py-3 rounded-xl text-white transition-all text-sm font-medium" style={{
                  backgroundColor: colors.accent
                }} whileHover={{
                  scale: 1.02,
                  backgroundColor: colors.accentHover
                }} whileTap={{
                  scale: 0.98
                }}>
                      Crear Proyecto
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {showCreateUserModal && <>
            <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setShowCreateUserModal(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto`} initial={{
            opacity: 0,
            scale: 0.9,
            y: 20
          }} animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }} exit={{
            opacity: 0,
            scale: 0.9,
            y: 20
          }} transition={{
            type: "spring",
            duration: 0.5
          }}>
                <div className={`sticky top-0 ${colors.bgSecondary} border-b ${colors.border} p-6 flex items-center justify-between`}>
                  <div>
                    <h2 className={`text-2xl font-bold ${colors.textPrimary} flex items-center gap-2`}>
                      <UserPlus className="w-6 h-6" style={{
                    color: colors.accent
                  }} />
                      Crear Nuevo Usuario
                    </h2>
                    <p className={`text-sm ${colors.textSecondary} mt-1`}>Dar de alta un nuevo usuario en la plataforma</p>
                  </div>
                  <motion.button onClick={() => setShowCreateUserModal(false)} className={`p-2 ${colors.hover} rounded-lg transition-all`} whileHover={{
                scale: 1.1,
                rotate: 90
              }} whileTap={{
                scale: 0.95
              }}>
                    <X className={`w-5 h-5 ${colors.textSecondary}`} />
                  </motion.button>
                </div>

                <form className="p-6 space-y-6">
                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Nombre Completo *</label>
                    <input type="text" placeholder="Juan Pérez" className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`} />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Email Corporativo *</label>
                    <input type="email" placeholder="juan.perez@empresa.com" className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textSecondary} outline-none transition-all text-sm`} />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Rol en la Plataforma *</label>
                    <select className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}>
                      <option value="">Seleccionar rol...</option>
                      <option value="PM">Project Manager (PM)</option>
                      <option value="DEVELOPER">Developer</option>
                    </select>
                    <p className={`text-xs ${colors.textSecondary} mt-2`}>
                      PM: Acceso completo a proyectos asignados, métricas e IA<br />
                      Developer: Acceso limitado a sus proyectos, gamificación personal
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>Departamento</label>
                    <select className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} outline-none transition-all text-sm`}>
                      <option value="">Seleccionar departamento...</option>
                      <option value="engineering">Engineering</option>
                      <option value="product">Product</option>
                      <option value="design">Design</option>
                      <option value="qa">QA</option>
                      <option value="devops">DevOps</option>
                    </select>
                  </div>

                  <div className={`flex items-center justify-end gap-3 pt-4 border-t ${colors.border}`}>
                    <motion.button type="button" onClick={() => setShowCreateUserModal(false)} className={`px-6 py-3 ${colors.bgTertiary} border ${colors.border} rounded-xl ${colors.textPrimary} ${colors.hover} transition-all text-sm font-medium`} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }}>
                      Cancelar
                    </motion.button>
                    <motion.button type="submit" className="px-6 py-3 rounded-xl text-white transition-all text-sm font-medium" style={{
                  backgroundColor: colors.accent
                }} whileHover={{
                  scale: 1.02,
                  backgroundColor: colors.accentHover
                }} whileTap={{
                  scale: 0.98
                }}>
                      Crear Usuario
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>}
      </AnimatePresence>
    </div>;
}