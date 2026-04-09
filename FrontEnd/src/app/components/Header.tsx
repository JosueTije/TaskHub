import { Bell, User, CheckCircle2, AlertTriangle, Trophy, Sparkles, Clock, X, ChevronDown, Moon, Sun } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { getThemeColors } from '../utils/themeColors';
import { globalNotifications, type GlobalNotification } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
interface HeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
}
export function Header({
  title,
  subtitle,
  userName = 'María González'
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    user,
    theme,
    toggleTheme
  } = useAuth();
  const role = user?.role || 'DEVELOPER';
  const themeColors = getThemeColors(theme);
  const filteredNotifications = role === 'DEVELOPER' ? globalNotifications.filter(n => n.isPersonal && n.assignedTo === user?.name) : globalNotifications;
  const [notifications, setNotifications] = useState<GlobalNotification[]>(filteredNotifications);
  useEffect(() => {
    const filtered = role === 'DEVELOPER' ? globalNotifications.filter(n => n.isPersonal && n.assignedTo === user?.name) : globalNotifications;
    setNotifications(filtered);
  }, [role, user?.name]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? {
      ...n,
      read: true
    } : n));
  };
  const getNotificationIcon = (type: GlobalNotification['type']) => {
    switch (type) {
      case 'ticket_completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'blocker_added':
        return <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'ai_alert':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'ticket_assigned':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'weekly_performance':
        return <Trophy className="w-4 h-4 text-green-500" />;
      case 'project_assigned':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'sprint_started':
        return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };
  const getNotificationBgColor = (type: GlobalNotification['type']) => {
    switch (type) {
      case 'ticket_completed':
        return 'bg-green-500/10';
      case 'blocker_added':
        return 'bg-[#FF3B30]/10';
      case 'achievement':
        return 'bg-yellow-500/10';
      case 'ai_alert':
        return 'bg-purple-500/10';
      case 'deadline':
        return 'bg-orange-500/10';
      case 'ticket_assigned':
        return 'bg-blue-500/10';
      case 'weekly_performance':
        return 'bg-green-500/10';
      case 'project_assigned':
        return 'bg-purple-500/10';
      case 'sprint_started':
        return 'bg-orange-500/10';
    }
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);
  return <motion.div className={`h-16 border-b ${themeColors.border} ${themeColors.bgSecondary} flex items-center justify-between px-8`} initial={{
    y: -64,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} transition={{
    duration: 0.5,
    ease: "easeOut"
  }}>
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
        <h1 className={`text-xl font-semibold ${themeColors.textPrimary}`}>{title}</h1>
        {subtitle && <p className={`text-sm ${themeColors.textSecondary} mt-0.5`}>{subtitle}</p>}
      </motion.div>
      
      <motion.div className="flex items-center gap-4" initial={{
      x: 20,
      opacity: 0
    }} animate={{
      x: 0,
      opacity: 1
    }} transition={{
      delay: 0.3,
      duration: 0.5
    }}>
        {}
        <motion.button onClick={toggleTheme} className={`p-2 rounded-lg ${themeColors.hover} transition-colors`} title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'} whileHover={{
        scale: 1.1,
        rotate: 180
      }} whileTap={{
        scale: 0.95
      }}>
          <AnimatePresence mode="wait">
            <motion.div key={theme} initial={{
            rotate: -180,
            opacity: 0
          }} animate={{
            rotate: 0,
            opacity: 1
          }} exit={{
            rotate: 180,
            opacity: 0
          }} transition={{
            duration: 0.3
          }}>
              {theme === 'dark' ? <Moon className={`w-5 h-5 ${themeColors.textSecondary}`} /> : <Sun className={`w-5 h-5 ${themeColors.textSecondary}`} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {}
        <div className="relative" ref={dropdownRef}>
          <motion.button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-lg ${themeColors.hover} transition-colors`} whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.95
        }}>
            <motion.div animate={unreadCount > 0 ? {
            rotate: [0, -15, 15, -15, 0]
          } : {}} transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 3
          }}>
              <Bell className={`w-5 h-5 ${themeColors.textSecondary}`} />
            </motion.div>
            <AnimatePresence>
              {unreadCount > 0 && <>
                  <motion.span className={`absolute top-1 right-1 w-2 h-2 ${theme === 'dark' ? 'bg-[#E31837]' : 'bg-[#5F0229]'} rounded-full`} initial={{
                scale: 0
              }} animate={{
                scale: [1, 1.2, 1]
              }} exit={{
                scale: 0
              }} transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 2
              }} />
                  <motion.span className={`absolute -top-1 -right-1 w-5 h-5 ${theme === 'dark' ? 'bg-[#E31837]' : 'bg-[#5F0229]'} rounded-full flex items-center justify-center text-[10px] font-semibold text-white`} initial={{
                scale: 0
              }} animate={{
                scale: 1
              }} exit={{
                scale: 0
              }} transition={{
                type: "spring",
                stiffness: 500,
                damping: 15
              }}>
                    {unreadCount}
                  </motion.span>
                </>}
            </AnimatePresence>
          </motion.button>

          {}
          <AnimatePresence>
            {showNotifications && <motion.div className={`absolute right-0 top-12 w-96 ${themeColors.bgSecondary} border ${themeColors.border} rounded-xl shadow-2xl z-50 overflow-hidden`} initial={{
            opacity: 0,
            y: -10,
            scale: 0.95
          }} animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }} exit={{
            opacity: 0,
            y: -10,
            scale: 0.95
          }} transition={{
            duration: 0.2,
            ease: "easeOut"
          }}>
                {}
                <div className={`p-4 border-b ${themeColors.border} flex items-center justify-between`}>
                  <div>
                    <h3 className={`text-sm font-semibold ${themeColors.textPrimary}`}>Notificaciones</h3>
                    {unreadCount > 0 && <p className={`text-xs ${themeColors.textSecondary} mt-0.5`}>{unreadCount} sin leer</p>}
                  </div>
                  <motion.div whileHover={{
                x: 4
              }} transition={{
                duration: 0.2
              }}>
                    <Link to="/notifications" onClick={() => setShowNotifications(false)} className={`text-xs ${theme === 'dark' ? 'text-[#E31837] hover:text-[#C41530]' : 'text-[#5F0229] hover:text-[#4A0120]'} font-medium`}>
                      Ver todas
                    </Link>
                  </motion.div>
                </div>

                {}
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.slice(0, 4).map((notification, index) => <motion.div key={notification.id} onClick={() => {
                if (!notification.read) markAsRead(notification.id);
              }} className={`p-3 border-b ${theme === 'dark' ? 'border-white/5' : 'border-[#4A453D]/5'} ${themeColors.hover} transition-all cursor-pointer ${!notification.read ? theme === 'dark' ? 'bg-[#E31837]/5' : 'bg-[#5F0229]/5' : ''}`} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: index * 0.05
              }} whileHover={{
                scale: 1.01,
                x: 4,
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(74, 69, 61, 0.05)'
              }}>
                      <div className="flex gap-3">
                        <motion.div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(notification.type)}`} whileHover={{
                    rotate: 360,
                    scale: 1.1
                  }} transition={{
                    duration: 0.5
                  }}>
                          {getNotificationIcon(notification.type)}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-xs font-semibold ${themeColors.textPrimary}`}>{notification.title}</p>
                            <AnimatePresence>
                              {!notification.read && <motion.div className={`w-1.5 h-1.5 ${theme === 'dark' ? 'bg-[#E31837]' : 'bg-[#5F0229]'} rounded-full flex-shrink-0 mt-1`} initial={{
                          scale: 0
                        }} animate={{
                          scale: [1, 1.3, 1]
                        }} exit={{
                          scale: 0
                        }} transition={{
                          duration: 0.3,
                          repeat: Infinity,
                          repeatDelay: 1
                        }} />}
                            </AnimatePresence>
                          </div>
                          <p className={`text-xs ${themeColors.textSecondary} mb-1 line-clamp-2`}>{notification.description}</p>
                          <div className={`flex items-center gap-2 text-[10px] ${themeColors.textSecondary}`}>
                            <span>{notification.timestamp}</span>
                            {notification.projectName && <>
                                <span>•</span>
                                <span className={theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]'}>{notification.projectName}</span>
                              </>}
                          </div>
                        </div>
                      </div>
                    </motion.div>)}
                </div>

                {}
                <div className={`p-3 border-t ${themeColors.border} text-center`}>
                  <motion.div whileHover={{
                x: 4
              }} transition={{
                duration: 0.2
              }}>
                    <Link to="/notifications" onClick={() => setShowNotifications(false)} className={`text-xs ${themeColors.textSecondary} hover:${themeColors.textPrimary} transition-colors inline-flex items-center gap-1`}>
                      Ver todas las notificaciones
                      <motion.span animate={{
                    x: [0, 4, 0]
                  }} transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}>
                        →
                      </motion.span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>
        
        {}
        <motion.div className={`flex items-center gap-3 pl-4 border-l ${themeColors.border}`} whileHover={{
        scale: 1.02
      }} transition={{
        duration: 0.2
      }}>
          <div className="text-right">
            <p className={`text-sm font-medium ${themeColors.textPrimary}`}>{user.name}</p>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              {user.role === 'ADMIN' ? 'Administrator' : user.role === 'PM' ? 'Project Manager' : 'Developer'}
            </p>
          </div>
          <motion.div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E31837] to-[#FF6B30] flex items-center justify-center cursor-pointer" whileHover={{
          scale: 1.1,
          rotate: [0, -5, 5, -5, 0]
        }} whileTap={{
          scale: 0.95
        }} transition={{
          duration: 0.3
        }}>
            <span className="text-sm font-bold text-white">{user.avatar}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>;
}