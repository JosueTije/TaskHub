import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, FileText, BarChart3, TrendingUp, Users, Sparkles, Send, Loader, MessageSquare, Download, Zap, CheckCircle2, ArrowRight, Paperclip } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
const miniChartData = [{
  value: 65
}, {
  value: 70
}, {
  value: 68
}, {
  value: 75
}, {
  value: 72
}, {
  value: 68
}];
const quickSuggestions = [{
  id: 1,
  icon: AlertTriangle,
  color: '#FF3B30',
  question: '¿Cuál es el proyecto con mayor riesgo?'
}, {
  id: 2,
  icon: FileText,
  color: '#007AFF',
  question: 'Dame un resumen ejecutivo del portafolio.'
}, {
  id: 3,
  icon: BarChart3,
  color: '#FF9500',
  question: '¿Qué sprint tiene más retrasos?'
}, {
  id: 4,
  icon: TrendingUp,
  color: '#34C759',
  question: 'Simula mover el milestone 3 tres días.'
}, {
  id: 5,
  icon: Users,
  color: '#AF52DE',
  question: '¿Qué developer tiene mejor rendimiento este mes?'
}];
const ragContext = {
  activeProject: 'E-commerce Platform',
  lastUpdate: '17 Feb 2026, 14:32',
  dataSources: [{
    name: 'Milestones',
    status: 'active',
    records: 12
  }, {
    name: 'Sprints',
    status: 'active',
    records: 8
  }, {
    name: 'KPIs',
    status: 'active',
    records: 45
  }, {
    name: 'Riesgo IA',
    status: 'active',
    records: 3
  }, {
    name: 'Team Performance',
    status: 'active',
    records: 24
  }]
};
type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  metadata?: {
    kpis?: Array<{
      label: string;
      value: string;
      color: string;
    }>;
    chart?: boolean;
    recommendations?: string[];
    actions?: Array<{
      label: string;
      icon: any;
    }>;
  };
};
const initialMessages: Message[] = [{
  id: '1',
  type: 'ai',
  content: '¡Hola! Soy tu Asistente Inteligente de TaskHub. Tengo acceso en tiempo real a todos los datos de tus proyectos, sprints, métricas y equipo. ¿En qué puedo ayudarte hoy?',
  timestamp: '14:28'
}, {
  id: '2',
  type: 'user',
  content: '¿Cuál es el proyecto con mayor riesgo?',
  timestamp: '14:29'
}, {
  id: '3',
  type: 'ai',
  content: 'Basándome en el análisis de datos actuales, el proyecto **E-commerce Platform** presenta el mayor nivel de riesgo:',
  timestamp: '14:29',
  metadata: {
    kpis: [{
      label: 'SPI',
      value: '0.92',
      color: '#FF3B30'
    }, {
      label: 'Hitos retrasados',
      value: '3',
      color: '#FF3B30'
    }, {
      label: 'Schedule Variance',
      value: '-8%',
      color: '#FF3B30'
    }, {
      label: 'Nivel de Riesgo',
      value: 'Alto',
      color: '#FF3B30'
    }],
    chart: true,
    recommendations: ['Aumentar recursos en un 20% para recuperar el cronograma', 'Replantear el alcance del sprint actual', 'Realizar reunión de emergencia con stakeholders', 'Considerar replanificación de milestones críticos'],
    actions: [{
      label: 'Ver proyecto',
      icon: ArrowRight
    }, {
      label: 'Generar plan de recuperación',
      icon: FileText
    }]
  }
}];
export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    theme
  } = useAuth();
  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    card: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#E5DFD3]',
    cardDarker: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#D6CFC0]',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    borderHover: theme === 'dark' ? 'border-white/20' : 'border-[#4A453D]/20',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    textMuted: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
    redPrimary: theme === 'dark' ? '#FF3B30' : '#5F0229',
    redBg: theme === 'dark' ? 'bg-[#FF3B30]' : 'bg-[#5F0229]',
    redBgSubtle: theme === 'dark' ? 'bg-[#FF3B30]/10' : 'bg-[#5F0229]/10',
    redBorder: theme === 'dark' ? 'border-[#FF3B30]/20' : 'border-[#5F0229]/20',
    redText: theme === 'dark' ? 'text-[#FF3B30]' : 'text-[#5F0229]'
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setMessages(prev => [...prev, newUserMessage]);
    const currentMessage = inputValue;
    setInputValue('');
    setShowSuggestions(false);
    setIsTyping(true);
    try {
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          history: messages,
        }),
      });

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error(error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Hubo un error conectando con la IA.',
        timestamp: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };


  const handleSuggestionClick = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return <div className={`min-h-screen ${colors.bg}`}>
    { }
    <div className="flex flex-col h-screen max-w-6xl mx-auto">
      { }
      <motion.div className={`border-b ${colors.border} ${colors.bg} p-6 md:p-8 flex-shrink-0`} initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
        <div className="flex items-start justify-between">
          <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.2,
            duration: 0.5
          }}>
            <div className="flex items-center gap-3 mb-2">
              <motion.div className={`p-2 ${colors.redBgSubtle} rounded-lg`} whileHover={{
                scale: 1.1,
                rotate: [0, -10, 10, -10, 0]
              }} transition={{
                duration: 0.5
              }}>
                <Sparkles className={`w-6 h-6 ${colors.redText}`} />
              </motion.div>
              <h1 className={`text-2xl md:text-3xl font-bold ${colors.textPrimary}`}>Asistente Inteligente</h1>
            </div>
            <p className={`text-sm ${colors.textMuted}`}>Análisis avanzado basado en datos del sistema</p>
          </motion.div>

          { }
          <motion.div className="hidden md:flex items-center gap-2" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.3,
            duration: 0.5
          }}>
            <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
              <Button variant="secondary" icon={Download} className="text-xs">
                Exportar PDF
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      { }
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        { }
        <AnimatePresence>
          {showSuggestions && messages.length <= 3 && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            duration: 0.4
          }}>
            <p className={`text-sm font-medium ${colors.textMuted} mb-4`}>Sugerencias rápidas</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return <motion.button key={suggestion.id} onClick={() => handleSuggestionClick(suggestion.question)} className={`${colors.card} border ${colors.border} rounded-xl p-4 hover:${colors.borderHover} transition-all text-left group relative overflow-hidden`} initial={{
                  opacity: 0,
                  scale: 0.9
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} transition={{
                  delay: index * 0.1,
                  duration: 0.3
                }} whileHover={{
                  scale: 1.02,
                  y: -4
                }} whileTap={{
                  scale: 0.98
                }}>
                  <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                    background: `linear-gradient(135deg, ${suggestion.color}15 0%, rgba(0,0,0,0) 100%)`
                  }} />
                  <div className="flex items-start gap-3 relative z-10">
                    <motion.div className="p-2 rounded-lg" style={{
                      backgroundColor: `${suggestion.color}20`
                    }} whileHover={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.1
                    }} transition={{
                      duration: 0.5
                    }}>
                      <Icon className="w-4 h-4" style={{
                        color: suggestion.color
                      }} />
                    </motion.div>
                    <p className={`text-sm ${colors.textPrimary} flex-1`}>{suggestion.question}</p>
                  </div>
                </motion.button>;
              })}
            </div>
          </motion.div>}
        </AnimatePresence>

        { }
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => <motion.div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`} initial={{
              opacity: 0,
              y: 20,
              scale: 0.95
            }} animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }} exit={{
              opacity: 0,
              scale: 0.95
            }} transition={{
              delay: index * 0.05,
              duration: 0.3
            }}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'w-auto' : 'w-full'}`}>
                <div className="flex items-start gap-3">
                  {message.type === 'ai' && <motion.div className={`w-8 h-8 rounded-lg ${colors.redBgSubtle} border ${colors.redBorder} flex items-center justify-center flex-shrink-0`} whileHover={{
                    scale: 1.1,
                    rotate: 360
                  }} transition={{
                    duration: 0.5
                  }}>
                    <Sparkles className={`w-4 h-4 ${colors.redText}`} />
                  </motion.div>}

                  <div className="flex-1">
                    <motion.div className={`rounded-xl p-4 ${message.type === 'user' ? `${colors.redBg} text-white ml-auto` : `${colors.card} border ${colors.border} ${colors.textPrimary}`}`} whileHover={message.type === 'ai' ? {
                      borderColor: colors.redPrimary + '40'
                    } : {
                      scale: 1.01
                    }}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                      { }
                      {message.metadata?.kpis && <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4" initial={{
                        opacity: 0,
                        y: 10
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} transition={{
                        delay: 0.2
                      }}>
                        {message.metadata.kpis.map((kpi, index) => <motion.div key={index} className={`${colors.cardDarker} rounded-lg p-3 border ${colors.border} group cursor-pointer relative overflow-hidden`} whileHover={{
                          scale: 1.05,
                          y: -2,
                          borderColor: kpi.color + '40'
                        }} transition={{
                          duration: 0.2
                        }}>
                          <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                            background: `linear-gradient(135deg, ${kpi.color}10 0%, rgba(0,0,0,0) 100%)`
                          }} />
                          <p className={`text-xs ${colors.textMuted} mb-1 relative z-10`}>{kpi.label}</p>
                          <motion.p className="text-xl font-bold relative z-10" style={{
                            color: kpi.color
                          }} whileHover={{
                            scale: 1.1
                          }}>
                            {kpi.value}
                          </motion.p>
                        </motion.div>)}
                      </motion.div>}

                      { }
                      {message.metadata?.chart && <motion.div className={`mt-4 ${colors.cardDarker} rounded-lg p-4 border ${colors.border}`} initial={{
                        opacity: 0,
                        scale: 0.95
                      }} animate={{
                        opacity: 1,
                        scale: 1
                      }} transition={{
                        delay: 0.3
                      }} whileHover={{
                        borderColor: colors.redPrimary + '40'
                      }}>
                        <p className={`text-xs ${colors.textMuted} mb-3`}>Tendencia de avance (últimas 6 semanas)</p>
                        <ResponsiveContainer width="100%" height={80}>
                          <LineChart data={miniChartData}>
                            <XAxis hide />
                            <YAxis hide domain={[0, 100]} />
                            <Line type="monotone" dataKey="value" stroke={colors.redPrimary} strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </motion.div>}

                      { }
                      {message.metadata?.recommendations && <motion.div className={`mt-4 ${colors.cardDarker} rounded-lg p-4 border ${colors.border}`} initial={{
                        opacity: 0,
                        y: 10
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} transition={{
                        delay: 0.4
                      }}>
                        <div className="flex items-center gap-2 mb-3">
                          <motion.div whileHover={{
                            rotate: 360,
                            scale: 1.2
                          }} transition={{
                            duration: 0.5
                          }}>
                            <Zap className="w-4 h-4 text-yellow-500" />
                          </motion.div>
                          <p className={`text-xs font-semibold ${colors.textPrimary}`}>Recomendaciones</p>
                        </div>
                        <ul className="space-y-2">
                          {message.metadata.recommendations.map((rec, index) => <motion.li key={index} className={`flex items-start gap-2 text-xs ${colors.textMuted}`} initial={{
                            opacity: 0,
                            x: -10
                          }} animate={{
                            opacity: 1,
                            x: 0
                          }} transition={{
                            delay: 0.5 + index * 0.1
                          }} whileHover={{
                            x: 4
                          }}>
                            <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </motion.li>)}
                        </ul>
                      </motion.div>}

                      { }
                      {message.metadata?.actions && <motion.div className="flex flex-wrap gap-2 mt-4" initial={{
                        opacity: 0,
                        y: 10
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} transition={{
                        delay: 0.5
                      }}>
                        {message.metadata.actions.map((action, index) => {
                          const Icon = action.icon;
                          return <motion.button key={index} className={`flex items-center gap-2 px-3 py-2 ${colors.redBg} text-white text-xs font-medium rounded-lg transition-all relative overflow-hidden group`} whileHover={{
                            scale: 1.05,
                            backgroundColor: theme === 'dark' ? '#E31837' : '#4A0020'
                          }} whileTap={{
                            scale: 0.95
                          }}>
                            <motion.div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                            <span className="relative z-10">{action.label}</span>
                            <motion.div whileHover={{
                              x: 3
                            }} transition={{
                              duration: 0.2
                            }}>
                              <Icon className="w-3 h-3 relative z-10" />
                            </motion.div>
                          </motion.button>;
                        })}
                      </motion.div>}
                    </motion.div>

                    <p className={`text-xs ${colors.textMuted} mt-2 ml-1`}>{message.timestamp}</p>
                  </div>

                  {message.type === 'user' && <motion.div className={`w-8 h-8 rounded-lg ${colors.card} border ${colors.border} flex items-center justify-center flex-shrink-0`} whileHover={{
                    scale: 1.1,
                    rotate: 5
                  }}>
                    <span className="text-sm">👤</span>
                  </motion.div>}
                </div>
              </div>
            </motion.div>)}
          </AnimatePresence>

          { }
          <AnimatePresence>
            {isTyping && <motion.div className="flex justify-start" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -20
            }} transition={{
              duration: 0.3
            }}>
              <div className="max-w-3xl">
                <div className="flex items-start gap-3">
                  <motion.div className={`w-8 h-8 rounded-lg ${colors.redBgSubtle} border ${colors.redBorder} flex items-center justify-center flex-shrink-0`} animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }} transition={{
                    repeat: Infinity,
                    duration: 1.5
                  }}>
                    <Sparkles className={`w-4 h-4 ${colors.redText}`} />
                  </motion.div>
                  <div className={`${colors.card} border ${colors.border} rounded-xl p-4`}>
                    <div className="flex items-center gap-2">
                      <motion.div className={`w-2 h-2 rounded-full ${colors.textMuted.replace('text-', 'bg-')}`} animate={{
                        y: [0, -8, 0]
                      }} transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0
                      }} />
                      <motion.div className={`w-2 h-2 rounded-full ${colors.textMuted.replace('text-', 'bg-')}`} animate={{
                        y: [0, -8, 0]
                      }} transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.2
                      }} />
                      <motion.div className={`w-2 h-2 rounded-full ${colors.textMuted.replace('text-', 'bg-')}`} animate={{
                        y: [0, -8, 0]
                      }} transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.4
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>}
          </AnimatePresence>
        </div>

        <div ref={messagesEndRef} />
      </div>

      { }
      <motion.div className={`border-t ${colors.border} ${colors.bg} p-4 md:p-6 flex-shrink-0`} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4,
        duration: 0.5
      }}>
        <div className="max-w-4xl mx-auto">
          { }
          <div className="flex flex-wrap items-center gap-2 mb-4">


            <div className="ml-auto flex items-center gap-2">

            </div>
          </div>

          { }
          <div className="flex items-end gap-3">
            <div className="flex-1 relative group">
              <motion.input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Pregunta sobre proyectos, sprints, métricas o desempeño…" className={`w-full px-4 py-3 pr-12 ${colors.card} border ${colors.border} rounded-xl ${colors.textPrimary} placeholder:${colors.textMuted} outline-none transition-all text-sm`} style={{
                focusBorderColor: colors.redPrimary,
                focusRingColor: colors.redPrimary + '33'
              }} whileFocus={{
                scale: 1.01
              }} />
              <motion.button className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:${colors.bg} rounded-lg transition-all`} whileHover={{
                scale: 1.1,
                rotate: 15
              }} whileTap={{
                scale: 0.9
              }}>
                <Paperclip className={`w-4 h-4 ${colors.textMuted}`} />
              </motion.button>
            </div>
            <motion.button onClick={handleSendMessage} disabled={!inputValue.trim()} className={`px-5 py-3 ${colors.redBg} text-white rounded-xl transition-all flex items-center gap-2 text-sm font-medium relative overflow-hidden group disabled:opacity-30 disabled:cursor-not-allowed`} whileHover={inputValue.trim() ? {
              scale: 1.05,
              backgroundColor: theme === 'dark' ? '#E31837' : '#4A0020'
            } : {}} whileTap={inputValue.trim() ? {
              scale: 0.95
            } : {}}>
              <motion.div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              <span className="hidden sm:inline relative z-10">Enviar</span>
              <motion.div whileHover={{
                x: 3
              }} transition={{
                duration: 0.2
              }} className="relative z-10">
                <Send className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>

          <p className={`text-xs ${colors.textMuted} text-center mt-3`}>
            El asistente puede cometer errores. Verifica información crítica con los reportes oficiales.
          </p>
        </div>
      </motion.div>
    </div>
  </div>;
}