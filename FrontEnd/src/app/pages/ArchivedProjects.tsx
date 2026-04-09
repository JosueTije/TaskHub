import { projects } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useMemo, useState } from 'react';
import { Archive, CheckCircle, Users, Calendar, Eye, FileText, Search } from 'lucide-react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
export function ArchivedProjects() {
  const {
    theme
  } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    card: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#E5DFD3]',
    cardDarker: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#D6CFC0]',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    textMuted: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
    input: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#D6CFC0]'
  };
  const archivedProjects = useMemo(() => {
    let filtered = projects.filter(p => p.status === 'Archived');
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.manager.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [searchQuery]);
  return <div className={`min-h-screen ${colors.bg}`}>
      <Header title="Archivo de Proyectos" subtitle="Proyectos cerrados y archivados - Solo ADMIN" />
      
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {}
        <motion.div className={`bg-gradient-to-br from-blue-500/10 to-transparent border ${theme === 'dark' ? 'border-blue-500/20' : 'border-blue-500/30'} rounded-xl p-6 relative overflow-hidden group`} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4
      }} whileHover={{
        borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.5)'
      }}>
          {}
          <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{
          background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.15), transparent 50%)'
        }} transition={{
          duration: 0.2
        }} />
          
          <div className="flex items-start gap-3 relative z-10">
            <motion.div whileHover={{
            rotate: [0, -10, 10, -10, 0],
            scale: 1.1
          }} transition={{
            duration: 0.5
          }}>
              <Archive className="w-5 h-5 text-blue-500 mt-0.5" />
            </motion.div>
            <div>
              <h3 className={`text-base font-semibold ${colors.textPrimary} mb-1`}>Archivo de Proyectos</h3>
              <p className={`text-sm ${colors.textMuted}`}>
                Los proyectos archivados mantienen acceso completo a todos sus datos: sprints, tickets, métricas, 
                Gantt, burndown, equipo y actividades. Esta sección solo es visible para administradores.
              </p>
            </div>
          </div>
        </motion.div>

        {}
        <motion.div className="flex flex-col sm:flex-row gap-4" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        delay: 0.1
      }}>
          <div className="flex-1 relative group">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${colors.textMuted} group-focus-within:text-purple-500 transition-colors`} />
            <input type="text" placeholder="Buscar por nombre de proyecto o PM..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`w-full ${colors.input} border ${colors.border} rounded-xl pl-11 pr-4 py-3 text-sm ${colors.textPrimary} placeholder:${colors.textMuted} focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`} />
          </div>
        </motion.div>

        {}
        <div className="grid grid-cols-4 gap-6">
          <motion.div className={`${colors.card} border ${colors.border} rounded-xl p-6 relative overflow-hidden group cursor-pointer`} initial={{
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
          borderColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.5)',
          y: -4
        }}>
            {}
            <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <motion.div className="p-2 bg-purple-500/10 rounded-lg" whileHover={{
              rotate: [0, -10, 10, -10, 0],
              scale: 1.1
            }} transition={{
              duration: 0.5
            }}>
                <Archive className="w-5 h-5 text-purple-500" />
              </motion.div>
              <div>
                <motion.p className={`text-2xl font-bold ${colors.textPrimary}`} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.2
              }}>
                  {archivedProjects.length}
                </motion.p>
                <p className={`text-xs ${colors.textMuted}`}>Proyectos Archivados</p>
              </div>
            </div>
          </motion.div>

          <motion.div className={`${colors.card} border ${colors.border} rounded-xl p-6 relative overflow-hidden group cursor-pointer`} initial={{
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
          borderColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.5)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <motion.div className="p-2 bg-green-500/10 rounded-lg" whileHover={{
              rotate: 360,
              scale: 1.1
            }} transition={{
              duration: 0.5
            }}>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
              <div>
                <motion.p className={`text-2xl font-bold ${colors.textPrimary}`} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.25
              }}>
                  {archivedProjects.filter(p => p.progress === 100).length}
                </motion.p>
                <p className={`text-xs ${colors.textMuted}`}>Completados 100%</p>
              </div>
            </div>
          </motion.div>

          <motion.div className={`${colors.card} border ${colors.border} rounded-xl p-6 relative overflow-hidden group cursor-pointer`} initial={{
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
          borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.5)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <motion.div className="p-2 bg-blue-500/10 rounded-lg" whileHover={{
              scale: 1.2
            }} transition={{
              duration: 0.2
            }}>
                <Users className="w-5 h-5 text-blue-500" />
              </motion.div>
              <div>
                <motion.p className={`text-2xl font-bold ${colors.textPrimary}`} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.3
              }}>
                  {archivedProjects.reduce((sum, p) => sum + p.team.length, 0)}
                </motion.p>
                <p className={`text-xs ${colors.textMuted}`}>Miembros Totales</p>
              </div>
            </div>
          </motion.div>

          <motion.div className={`${colors.card} border ${colors.border} rounded-xl p-6 relative overflow-hidden group cursor-pointer`} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.3,
          delay: 0.3
        }} whileHover={{
          scale: 1.02,
          borderColor: theme === 'dark' ? 'rgba(249, 115, 22, 0.4)' : 'rgba(249, 115, 22, 0.5)',
          y: -4
        }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <motion.div className="p-2 bg-orange-500/10 rounded-lg" whileHover={{
              rotate: [0, 10, -10, 0],
              scale: 1.1
            }} transition={{
              duration: 0.5
            }}>
                <FileText className="w-5 h-5 text-orange-500" />
              </motion.div>
              <div>
                <motion.p className={`text-2xl font-bold ${colors.textPrimary}`} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.35
              }}>
                  {archivedProjects.reduce((sum, p) => sum + p.tickets.length, 0)}
                </motion.p>
                <p className={`text-xs ${colors.textMuted}`}>Tickets Totales</p>
              </div>
            </div>
          </motion.div>
        </div>

        {}
        {archivedProjects.length === 0 ? <motion.div className={`${colors.card} border ${colors.border} rounded-xl p-12 text-center`} initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.4,
        delay: 0.4
      }}>
            <motion.div animate={{
          y: [0, -10, 0]
        }} transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}>
              <Archive className={`w-12 h-12 ${colors.textMuted} mx-auto mb-4`} />
            </motion.div>
            <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-2`}>No hay proyectos archivados</h3>
            <p className={`text-sm ${colors.textMuted}`}>
              Los proyectos cerrados aparecerán aquí automáticamente
            </p>
          </motion.div> : <div className="space-y-4">
            {archivedProjects.map((project, index) => <motion.div key={project.id} className={`${colors.card} border ${colors.border} rounded-xl p-6 relative overflow-hidden group cursor-pointer`} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.4 + index * 0.05
        }} whileHover={{
          scale: 1.01,
          borderColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.5)',
          y: -2
        }}>
                {}
                <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 pointer-events-none" initial={{
            x: '-100%'
          }} whileHover={{
            x: '100%'
          }} transition={{
            duration: 0.6
          }} />

                <div className="flex items-start justify-between gap-6 relative z-10">
                  {}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <motion.div className="p-3 bg-purple-500/10 rounded-xl" whileHover={{
                  rotate: [0, -5, 5, -5, 0],
                  scale: 1.1
                }} transition={{
                  duration: 0.5
                }}>
                        <Archive className="w-6 h-6 text-purple-500" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <motion.h3 className={`text-lg font-semibold ${colors.textPrimary}`} whileHover={{
                      x: 4
                    }} transition={{
                      duration: 0.2
                    }}>
                            {project.name}
                          </motion.h3>
                          <motion.span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-medium rounded-full" whileHover={{
                      scale: 1.05
                    }}>
                            Archivado
                          </motion.span>
                          <motion.span className={`px-3 py-1 rounded-full text-xs font-medium ${project.progress === 100 ? 'bg-green-500/10 text-green-500' : 'bg-[#FF3B30]/10 text-[#FF3B30]'}`} whileHover={{
                      scale: 1.05
                    }}>
                            {project.progress}% Completado
                          </motion.span>
                        </div>
                        <div className={`flex items-center gap-4 text-sm ${colors.textMuted}`}>
                          <motion.div className="flex items-center gap-1" whileHover={{
                      x: 2
                    }} transition={{
                      duration: 0.2
                    }}>
                            <Users className="w-4 h-4" />
                            <span>PM: {project.manager}</span>
                          </motion.div>
                          <motion.div className="flex items-center gap-1" whileHover={{
                      x: 2
                    }} transition={{
                      duration: 0.2
                    }}>
                            <Calendar className="w-4 h-4" />
                            <span>{project.startDate} - {project.endDate}</span>
                          </motion.div>
                          {project.closedDate && <motion.div className="flex items-center gap-1" whileHover={{
                      x: 2
                    }} transition={{
                      duration: 0.2
                    }}>
                              <CheckCircle className="w-4 h-4" />
                              <span>Cerrado: {project.closedDate}</span>
                            </motion.div>}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-5 gap-4">
                      <motion.div className={`${colors.cardDarker} rounded-lg p-3`} whileHover={{
                  scale: 1.05,
                  backgroundColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.05)' : 'rgba(168, 85, 247, 0.1)'
                }} transition={{
                  duration: 0.2
                }}>
                        <p className={`text-xs ${colors.textMuted} mb-1`}>Sprints</p>
                        <p className={`text-lg font-bold ${colors.textPrimary}`}>{project.sprints.length}</p>
                      </motion.div>
                      <motion.div className={`${colors.cardDarker} rounded-lg p-3`} whileHover={{
                  scale: 1.05,
                  backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.1)'
                }} transition={{
                  duration: 0.2
                }}>
                        <p className={`text-xs ${colors.textMuted} mb-1`}>Tickets</p>
                        <div className="flex items-baseline gap-1">
                          <p className={`text-lg font-bold ${colors.textPrimary}`}>
                            {project.tickets.filter(t => t.status === 'Done').length}
                          </p>
                          <p className={`text-xs ${colors.textMuted}`}>/{project.tickets.length}</p>
                        </div>
                      </motion.div>
                      <motion.div className={`${colors.cardDarker} rounded-lg p-3`} whileHover={{
                  scale: 1.05,
                  backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)'
                }} transition={{
                  duration: 0.2
                }}>
                        <p className={`text-xs ${colors.textMuted} mb-1`}>Equipo</p>
                        <p className={`text-lg font-bold ${colors.textPrimary}`}>{project.team.length}</p>
                      </motion.div>
                      <motion.div className={`${colors.cardDarker} rounded-lg p-3`} whileHover={{
                  scale: 1.05,
                  backgroundColor: project.spi >= 1 ? theme === 'dark' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.1)' : theme === 'dark' ? 'rgba(255, 59, 48, 0.05)' : 'rgba(255, 59, 48, 0.1)'
                }} transition={{
                  duration: 0.2
                }}>
                        <p className={`text-xs ${colors.textMuted} mb-1`}>SPI</p>
                        <p className={`text-lg font-bold ${project.spi >= 1 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
                          {project.spi.toFixed(2)}
                        </p>
                      </motion.div>
                      <motion.div className={`${colors.cardDarker} rounded-lg p-3`} whileHover={{
                  scale: 1.05
                }} transition={{
                  duration: 0.2
                }}>
                        <p className={`text-xs ${colors.textMuted} mb-1`}>Riesgo</p>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${project.risk === 'High' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : project.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                          {project.risk}
                        </span>
                      </motion.div>
                    </div>

                    {}
                    <div className="mt-4 flex items-center gap-3">
                      <p className={`text-xs ${colors.textMuted}`}>Equipo:</p>
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 5).map((member, idx) => <motion.div key={idx} className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#FF3B30] to-[#FF6B30] flex items-center justify-center text-xs font-bold text-white border-2 ${theme === 'dark' ? 'border-[#1C1C1E]' : 'border-[#E5DFD3]'}`} title={member.name} whileHover={{
                    scale: 1.2,
                    zIndex: 10,
                    y: -4
                  }} transition={{
                    duration: 0.2
                  }}>
                            {member.avatar}
                          </motion.div>)}
                        {project.team.length > 5 && <motion.div className={`w-8 h-8 rounded-full ${colors.cardDarker} border-2 ${theme === 'dark' ? 'border-[#1C1C1E]' : 'border-[#E5DFD3]'} flex items-center justify-center text-xs ${colors.textMuted}`} whileHover={{
                    scale: 1.2,
                    zIndex: 10,
                    y: -4
                  }} transition={{
                    duration: 0.2
                  }}>
                            +{project.team.length - 5}
                          </motion.div>}
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="flex flex-col gap-3">
                    <Link to={`/project/${project.id}`}>
                      <motion.div whileHover={{
                  scale: 1.05,
                  x: 4
                }} whileTap={{
                  scale: 0.95
                }} transition={{
                  duration: 0.2
                }}>
                        <Button variant="primary" icon={Eye} className="w-full">
                          Ver Todo
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to={`/project/${project.id}/summary`}>
                      <motion.div whileHover={{
                  scale: 1.05,
                  x: 4
                }} whileTap={{
                  scale: 0.95
                }} transition={{
                  duration: 0.2
                }}>
                        <Button variant="outline" icon={FileText} size="sm" className="w-full">
                          Resumen
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>

                {}
                {project.closedBy && <motion.div className={`mt-4 pt-4 border-t ${colors.border}`} initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.2
          }}>
                    <p className={`text-xs ${colors.textMuted}`}>
                      Cerrado por <span className={`${colors.textPrimary} font-medium`}>{project.closedBy}</span> el{' '}
                      <span className={`${colors.textPrimary} font-medium`}>{project.closedDate}</span>
                    </p>
                  </motion.div>}
              </motion.div>)}
          </div>}

        {}
        <motion.div className="flex justify-center" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        delay: 0.5
      }}>
          <Link to="/projects">
            <motion.div whileHover={{
            scale: 1.05,
            x: -4
          }} whileTap={{
            scale: 0.95
          }} transition={{
            duration: 0.2
          }}>
              <Button variant="outline">
                Volver a Proyectos Activos
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>;
}