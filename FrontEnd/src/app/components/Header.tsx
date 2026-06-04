import { Bell, CheckCircle2, AlertTriangle, Trophy, Sparkles, Clock, X, Moon, Sun } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { getThemeColors } from '../utils/themeColors';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  return `Hace ${Math.floor(hrs / 24)} días`;
}

function notifIcon(type: string) {
  switch (type) {
    case 'ticket_completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'blocker_added':    return <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />;
    case 'achievement':      return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 'ai_alert':         return <Sparkles className="w-4 h-4 text-purple-500" />;
    case 'deadline':         return <Clock className="w-4 h-4 text-orange-500" />;
    case 'ticket_assigned':  return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case 'sprint_started':   return <Clock className="w-4 h-4 text-orange-500" />;
    default:                 return <Bell className="w-4 h-4 text-[#8E8E93]" />;
  }
}

function notifBg(type: string) {
  switch (type) {
    case 'ticket_completed': return 'bg-green-500/10';
    case 'blocker_added':    return 'bg-[#FF3B30]/10';
    case 'achievement':      return 'bg-yellow-500/10';
    case 'ai_alert':         return 'bg-purple-500/10';
    case 'deadline':         return 'bg-orange-500/10';
    case 'ticket_assigned':  return 'bg-blue-500/10';
    case 'sprint_started':   return 'bg-orange-500/10';
    default:                 return 'bg-white/10';
  }
}

export function Header({ title, subtitle }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, theme, toggleTheme } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const themeColors = getThemeColors(theme);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  return (
    <motion.div
      className={`h-16 border-b ${themeColors.border} ${themeColors.bgSecondary} flex items-center justify-between px-8`}
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <h1 className={`text-xl font-semibold ${themeColors.textPrimary}`}>{title}</h1>
        {subtitle && <p className={`text-sm ${themeColors.textSecondary} mt-0.5`}>{subtitle}</p>}
      </motion.div>

      <motion.div className="flex items-center gap-4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        {/* Theme toggle */}
        <motion.button onClick={toggleTheme} className={`p-2 rounded-lg ${themeColors.hover} transition-colors`} whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.95 }}>
          <AnimatePresence mode="wait">
            <motion.div key={theme} initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 180, opacity: 0 }} transition={{ duration: 0.3 }}>
              {theme === 'dark' ? <Moon className={`w-5 h-5 ${themeColors.textSecondary}`} /> : <Sun className={`w-5 h-5 ${themeColors.textSecondary}`} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Bell */}
        <div className="relative" ref={dropdownRef}>
          <motion.button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-lg ${themeColors.hover} transition-colors`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <motion.div animate={unreadCount > 0 ? { rotate: [0, -15, 15, -15, 0] } : {}} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}>
              <Bell className={`w-5 h-5 ${themeColors.textSecondary}`} />
            </motion.div>
            <AnimatePresence>
              {unreadCount > 0 && (
                <>
                  <motion.span className={`absolute top-1 right-1 w-2 h-2 ${theme === 'dark' ? 'bg-[#E31837]' : 'bg-[#5F0229]'} rounded-full`} initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1] }} exit={{ scale: 0 }} transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }} />
                  <motion.span className={`absolute -top-1 -right-1 w-5 h-5 ${theme === 'dark' ? 'bg-[#E31837]' : 'bg-[#5F0229]'} rounded-full flex items-center justify-center text-[10px] font-semibold text-white`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                </>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className={`absolute right-0 top-12 w-96 ${themeColors.bgSecondary} border ${themeColors.border} rounded-xl shadow-2xl z-50 overflow-hidden`}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Header */}
                <div className={`p-4 border-b ${themeColors.border} flex items-center justify-between`}>
                  <div>
                    <h3 className={`text-sm font-semibold ${themeColors.textPrimary}`}>Notificaciones</h3>
                    {unreadCount > 0 && <p className={`text-xs ${themeColors.textSecondary} mt-0.5`}>{unreadCount} sin leer</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className={`text-xs ${themeColors.textSecondary} hover:${themeColors.textPrimary} transition-colors`}>
                        Marcar todas
                      </button>
                    )}
                    <Link to="/notifications" onClick={() => setShowNotifications(false)} className={`text-xs ${theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]'} font-medium`}>
                      Ver todas
                    </Link>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[380px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className={`w-8 h-8 ${themeColors.textSecondary} mx-auto mb-2 opacity-40`} />
                      <p className={`text-xs ${themeColors.textSecondary}`}>Sin notificaciones</p>
                    </div>
                  ) : notifications.slice(0, 5).map((n, index) => (
                    <motion.div
                      key={n.id}
                      onClick={() => { if (!n.read) markAsRead(n.id); }}
                      className={`p-3 border-b ${theme === 'dark' ? 'border-white/5' : 'border-[#4A453D]/5'} ${themeColors.hover} transition-all cursor-pointer ${!n.read ? theme === 'dark' ? 'bg-[#E31837]/5' : 'bg-[#5F0229]/5' : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notifBg(n.type)}`}>
                          {notifIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-xs font-semibold ${themeColors.textPrimary}`}>{n.title}</p>
                            <AnimatePresence>
                              {!n.read && (
                                <motion.div className={`w-1.5 h-1.5 ${theme === 'dark' ? 'bg-[#E31837]' : 'bg-[#5F0229]'} rounded-full flex-shrink-0 mt-1`} initial={{ scale: 0 }} animate={{ scale: [1, 1.3, 1] }} exit={{ scale: 0 }} transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1 }} />
                              )}
                            </AnimatePresence>
                          </div>
                          <p className={`text-xs ${themeColors.textSecondary} mb-1 line-clamp-2`}>{n.description}</p>
                          <div className={`flex items-center gap-2 text-[10px] ${themeColors.textSecondary}`}>
                            <span>{relativeTime(n.createdAt)}</span>
                            {n.projectName && (
                              <>
                                <span>•</span>
                                <span className={theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]'}>{n.projectName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className={`p-3 border-t ${themeColors.border} text-center`}>
                  <Link to="/notifications" onClick={() => setShowNotifications(false)} className={`text-xs ${themeColors.textSecondary} hover:${themeColors.textPrimary} transition-colors inline-flex items-center gap-1`}>
                    Ver todas las notificaciones →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User info */}
        <motion.div className={`flex items-center gap-3 pl-4 border-l ${themeColors.border}`} whileHover={{ scale: 1.02 }}>
          <div className="text-right">
            <p className={`text-sm font-medium ${themeColors.textPrimary}`}>{user?.name}</p>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'PM' ? 'Project Manager' : 'Developer'}
            </p>
          </div>
          <motion.div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E31837] to-[#FF6B30] flex items-center justify-center cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <span className="text-sm font-bold text-white">{user?.name?.charAt(0) ?? '?'}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
