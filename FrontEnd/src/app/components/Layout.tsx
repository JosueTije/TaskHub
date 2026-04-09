import { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  BarChart3, 
  Sparkles, 
  Trophy, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  User as UserIcon,
  Code,
  Archive,
  Sun,
  Moon,
  Users,
  LogOut
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import techMahindraLogo from '../../assets//8e900e5934114b83e48f18fd01cd6d76c2c12f23.png';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Proyectos', icon: FolderKanban },
  { path: '/archived-projects', label: 'Archivo', icon: Archive, roles: ['ADMIN', 'PM'] },
  { path: '/metrics', label: 'Métricas', icon: BarChart3, roles: ['ADMIN', 'PM'] },
  { path: '/ai', label: 'IA', icon: Sparkles, roles: ['ADMIN', 'PM'] },
  { path: '/gamification', label: 'Gamificación', icon: Trophy },
  { path: '/user-management', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
];

export function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, theme, setTheme } = useAuth();

  const role = user?.role || 'DEVELOPER';

  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    sidebar: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#E5DFD3]',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    textMuted: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    hover: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-[#4A453D]/10',
    hoverText: theme === 'dark' ? 'hover:text-white' : 'hover:text-[#29251D]',
    card: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#F6F2EA]',
    textSecondary: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${colors.bg}`}>

      <motion.aside 
        className={`hidden md:flex border-r ${colors.border} ${colors.sidebar} flex-col transition-all duration-300 relative overflow-hidden`}
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >

        <motion.div
          className="absolute inset-0 opacity-5 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, #E31837 0%, rgba(0,0,0,0) 50%)',
              'radial-gradient(circle at 100% 100%, #E31837 0%, rgba(0,0,0,0) 50%)',
              'radial-gradient(circle at 0% 0%, #E31837 0%, rgba(0,0,0,0) 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />


        <div className={`h-16 flex items-center justify-between px-6 border-b ${colors.border} relative z-10`}>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.img 
                key="logo"
                src={techMahindraLogo} 
                alt="Tech Mahindra" 
                className="h-8 w-auto"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 ${colors.hover} rounded-lg transition-colors ml-auto`}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isCollapsed ? (
                <ChevronRight className={`w-5 h-5 ${colors.textMuted}`} />
              ) : (
                <ChevronLeft className={`w-5 h-5 ${colors.textMuted}`} />
              )}
            </motion.div>
          </motion.button>
        </div>


        <nav className="flex-1 px-3 py-4 space-y-1 relative z-10">
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;

            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  to={item.path}
                  className="block relative group"
                  title={isCollapsed ? item.label : ''}
                >
                  <motion.div
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg relative overflow-hidden
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    animate={{
                      backgroundColor: isActive 
                        ? (theme === 'dark' ? '#E31837' : '#5F0229')
                        : (theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)'),
                      color: isActive ? '#FFFFFF' : (theme === 'dark' ? '#8E8E93' : '#4A453D'),
                      scale: 1,
                      x: 0
                    }}
                    whileHover={{ 
                      scale: isActive ? 1 : 1.02,
                      x: isActive ? 0 : 4
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >

                    {!isActive && (
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: theme === 'dark' 
                            ? 'linear-gradient(90deg, transparent, rgba(227, 24, 55, 0.1), transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(95, 2, 41, 0.1), transparent)',
                        }}
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      />
                    )}

                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span 
                          className="text-sm font-medium relative z-10"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>


                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          exit={{ scaleY: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>


        <motion.div 
          className={`px-3 border-t ${colors.border} pt-4 mt-auto relative z-10`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Link to="/profile" className="block">
            <motion.div
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${colors.textMuted} ${colors.hoverText} ${colors.hover} ${isCollapsed ? 'justify-center' : ''}`}
              whileHover={{ 
                scale: 1.02,
                x: isCollapsed ? 0 : 4
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E31837] to-[#5F0229] flex items-center justify-center flex-shrink-0"
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <UserIcon className="w-4 h-4 text-white" />
              </motion.div>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div 
                    className="flex-1 text-left overflow-hidden"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className={`text-sm font-medium ${colors.textPrimary} truncate`}>{user?.name}</p>
                    <p className={`text-xs ${colors.textSecondary} truncate`}>{user?.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </motion.div>


        <motion.div 
          className={`px-3 border-t ${colors.border} py-4 relative z-10`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${colors.textMuted} ${colors.hoverText} ${colors.hover} ${isCollapsed ? 'justify-center' : ''}`}
            whileHover={{ 
              scale: 1.02,
              x: isCollapsed ? 0 : 4
            }}
            whileTap={{ scale: 0.98 }}
            title={isCollapsed ? 'Cerrar Sesión' : ''}
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <LogOut className="w-4 h-4" />
            </motion.div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.aside>


      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>


      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside 
            className={`fixed top-0 left-0 bottom-0 w-64 ${colors.sidebar} border-r ${colors.border} z-50 md:hidden overflow-hidden`}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >

            <motion.div
              className="absolute inset-0 opacity-5 pointer-events-none"
              animate={{
                background: [
                  'radial-gradient(circle at 0% 0%, #E31837 0%, rgba(0,0,0,0) 50%)',
                  'radial-gradient(circle at 100% 100%, #E31837 0%, rgba(0,0,0,0) 50%)',
                  'radial-gradient(circle at 0% 0%, #E31837 0%, rgba(0,0,0,0) 50%)',
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

    
            <div className={`h-16 flex items-center justify-between px-6 border-b ${colors.border} relative z-10`}>
              <motion.img 
                src={techMahindraLogo} 
                alt="Tech Mahindra" 
                className="h-8 w-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              />
              <motion.button 
                onClick={() => setIsMobileMenuOpen(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className={`w-5 h-5 ${colors.textMuted}`} />
              </motion.button>
            </div>


            <nav className="px-3 py-4 space-y-1 relative z-10">
              {filteredNavItems.map((item, index) => {
                const Icon = item.icon;
        
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block relative group"
                    >
                      <motion.div
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg relative overflow-hidden"
                        animate={{
                          backgroundColor: isActive 
                            ? (theme === 'dark' ? '#E31837' : '#5F0229')
                            : (theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)'),
                          color: isActive ? '#FFFFFF' : (theme === 'dark' ? '#8E8E93' : '#4A453D'),
                          scale: 1,
                          x: 0
                        }}
                        whileHover={{ 
                          scale: isActive ? 1 : 1.02,
                          x: isActive ? 0 : 4
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                
                        {!isActive && (
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: theme === 'dark' 
                                ? 'linear-gradient(90deg, transparent, rgba(227, 24, 55, 0.1), transparent)'
                                : 'linear-gradient(90deg, transparent, rgba(95, 2, 41, 0.1), transparent)',
                            }}
                            animate={{
                              x: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          />
                        )}

                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
                        </motion.div>
                        <span className="text-sm font-medium relative z-10">{item.label}</span>

                
                        {isActive && (
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                            layoutId="mobileActiveIndicator"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>


            <motion.div 
              className={`px-3 border-t ${colors.border} pt-4 mt-auto relative z-10`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block">
                <motion.div
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${colors.textMuted} ${colors.hoverText} ${colors.hover}`}
                  whileHover={{ 
                    scale: 1.02,
                    x: 4
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E31837] to-[#5F0229] flex items-center justify-center flex-shrink-0"
                    whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <UserIcon className="w-4 h-4 text-white" />
                  </motion.div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className={`text-sm font-medium ${colors.textPrimary} truncate`}>{user?.name}</p>
                    <p className={`text-xs ${colors.textSecondary} truncate`}>{user?.email}</p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

     
            <motion.div 
              className={`px-3 border-t ${colors.border} py-4 relative z-10`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={toggleTheme}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${colors.textMuted} ${colors.hoverText} ${colors.hover}`}
                whileHover={{ 
                  scale: 1.02,
                  x: 4
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </motion.div>
                <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </motion.button>
            </motion.div>


            <motion.div 
              className={`px-3 border-t ${colors.border} py-4 relative z-10`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <motion.button
                onClick={logout}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${colors.textMuted} ${colors.hoverText} ${colors.hover}`}
                whileHover={{ 
                  scale: 1.02,
                  x: 4
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.div>
                <span>Cerrar Sesión</span>
              </motion.button>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>


      <main className={`flex-1 overflow-auto ${colors.bg}`}>
      
        <div className={`md:hidden h-16 border-b ${colors.border} ${colors.card} flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 backdrop-blur-md`}>
          <motion.button 
            onClick={() => setIsMobileMenuOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 ${colors.hover} rounded-lg transition-colors`}
          >
            <Menu className={`w-5 h-5 ${colors.textPrimary}`} />
          </motion.button>
          <motion.h1 
            className={`text-lg font-semibold ${colors.textPrimary}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            TaskHub
          </motion.h1>
          <motion.button 
            onClick={toggleTheme} 
            className={`p-2 ${colors.hover} rounded-lg transition-colors`}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'dark' ? (
              <Sun className={`w-5 h-5 ${colors.textMuted}`} />
            ) : (
              <Moon className={`w-5 h-5 ${colors.textMuted}`} />
            )}
          </motion.button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}