import { useState } from 'react';
import { User, Mail, Shield, Lock, Bell, Palette, Eye, EyeOff, Save, Camera, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
export function UserProfile() {
  const {
    user,
    theme,
    setTheme
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: '',
    bio: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    sprintReminders: true,
    theme: theme
  });
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    card: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white',
    cardSecondary: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#E5DFD3]',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(74,69,61,0.1)',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    textSecondary: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
    hover: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-[#4A453D]/5',
    inputBg: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white',
    inputBorder: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/20'
  };
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[#E31837]';
      case 'PM':
        return 'bg-[#5F0229]';
      case 'DEVELOPER':
        return 'bg-[#0A0638]';
      default:
        return 'bg-[#8E8E93]';
    }
  };
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'PM':
        return 'Project Manager';
      case 'DEVELOPER':
        return 'Developer';
      default:
        return role;
    }
  };
  const handleProfileSave = () => {
    setMessage({
      type: 'success',
      text: 'Perfil actualizado correctamente'
    });
    setTimeout(() => setMessage(null), 3000);
  };
  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 8 caracteres'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setMessage({
      type: 'success',
      text: 'Contraseña actualizada correctamente'
    });
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setTimeout(() => setMessage(null), 3000);
  };
  const handlePreferencesSave = () => {
    setTheme(preferences.theme);
    setMessage({
      type: 'success',
      text: 'Preferencias guardadas correctamente'
    });
    setTimeout(() => setMessage(null), 3000);
  };
  const tabs = [{
    id: 'profile' as const,
    label: 'Perfil',
    icon: User
  }, {
    id: 'security' as const,
    label: 'Seguridad',
    icon: Lock
  }, {
    id: 'preferences' as const,
    label: 'Preferencias',
    icon: Palette
  }];
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              <h1 className={`text-2xl md:text-3xl font-bold ${colors.textPrimary} mb-2`}>Mi Perfil</h1>
              <p className={`text-sm ${colors.textSecondary}`}>
                Administra tu información personal y configuración
              </p>
            </motion.div>

            {}
            <AnimatePresence>
              {message && <motion.div initial={{
              opacity: 0,
              scale: 0.9,
              y: -10
            }} animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }} exit={{
              opacity: 0,
              scale: 0.9,
              y: -10
            }} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${message.type === 'success' ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20' : 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm font-medium">{message.text}</span>
                </motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {}
          <motion.div className="lg:col-span-4" initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.4,
          delay: 0.2
        }}>
            <div className={`${colors.card} border ${colors.border} rounded-xl p-6 space-y-6`}>
              {}
              <div className="flex flex-col items-center">
                <motion.div className="relative group" whileHover={{
                scale: 1.05
              }}>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E31837] to-[#5F0229] flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <motion.button className="absolute bottom-0 right-0 p-2 bg-[#E31837] rounded-full shadow-lg" whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.95
                }}>
                    <Camera className="w-4 h-4 text-white" />
                  </motion.button>
                </motion.div>
                
                <h3 className={`mt-4 text-xl font-semibold ${colors.textPrimary}`}>
                  {user?.name}
                </h3>
                <p className={`text-sm ${colors.textSecondary}`}>{user?.email}</p>
                
                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(user?.role || '')}`}>
                  {getRoleLabel(user?.role || '')}
                </div>
              </div>

              {}
              <div className={`pt-6 border-t ${colors.border} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${colors.textSecondary}`}>Miembro desde</span>
                  <span className={`text-sm font-medium ${colors.textPrimary}`}>Marzo 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${colors.textSecondary}`}>Proyectos activos</span>
                  <span className={`text-sm font-medium ${colors.textPrimary}`}>3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${colors.textSecondary}`}>Último acceso</span>
                  <span className={`text-sm font-medium ${colors.textPrimary}`}>Hoy</span>
                </div>
              </div>
            </div>
          </motion.div>

          {}
          <motion.div className="lg:col-span-8" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.4,
          delay: 0.2
        }}>
            <div className={`${colors.card} border ${colors.border} rounded-xl overflow-hidden`}>
              {}
              <div className={`flex border-b ${colors.border}`}>
                {tabs.map(tab => {
                const Icon = tab.icon;
                return <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id ? `${colors.textPrimary}` : `${colors.textSecondary} ${colors.hover}`}`} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }}>
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E31837]" transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }} />}
                    </motion.button>;
              })}
              </div>

              {}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {}
                  {activeTab === 'profile' && <motion.div key="profile" initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} transition={{
                  duration: 0.3
                }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>
                            Nombre completo
                          </label>
                          <input type="text" value={profileForm.name} onChange={e => setProfileForm({
                        ...profileForm,
                        name: e.target.value
                      })} className={`w-full px-4 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837] outline-none transition-all`} />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>
                            Email
                          </label>
                          <input type="email" value={profileForm.email} onChange={e => setProfileForm({
                        ...profileForm,
                        email: e.target.value
                      })} className={`w-full px-4 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837] outline-none transition-all`} />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>
                            Teléfono
                          </label>
                          <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({
                        ...profileForm,
                        phone: e.target.value
                      })} placeholder="+52 999 999 9999" className={`w-full px-4 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837] outline-none transition-all`} />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>
                            Departamento
                          </label>
                          <input type="text" value={profileForm.department} onChange={e => setProfileForm({
                        ...profileForm,
                        department: e.target.value
                      })} placeholder="Ej: Engineering" className={`w-full px-4 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837] outline-none transition-all`} />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>
                          Biografía
                        </label>
                        <textarea value={profileForm.bio} onChange={e => setProfileForm({
                      ...profileForm,
                      bio: e.target.value
                    })} rows={4} placeholder="Cuéntanos sobre ti..." className={`w-full px-4 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837] outline-none transition-all resize-none`} />
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleProfileSave} className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Guardar cambios
                        </Button>
                      </div>
                    </motion.div>}

                  {}
                  {activeTab === 'security' && <motion.div key="security" initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} transition={{
                  duration: 0.3
                }} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>
                            Contraseña actual
                          </label>
                          <div className="relative">
                            <input type={showPasswords.current ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={e => setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value
                        })} className={`w-full px-4 py-2 pr-12 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837] outline-none transition-all`} />
                            <button type="button" onClick={() => setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current
                        })} className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSecondary} ${colors.hover} p-1 rounded`}>
                              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>
                            Nueva contraseña
                          </label>
                          <div className="relative">
                            <input type={showPasswords.new ? 'text' : 'password'} value={passwordForm.newPassword} onChange={e => setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value
                        })} className={`w-full px-4 py-2 pr-12 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837] outline-none transition-all`} />
                            <button type="button" onClick={() => setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new
                        })} className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSecondary} ${colors.hover} p-1 rounded`}>
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>
                            Confirmar nueva contraseña
                          </label>
                          <div className="relative">
                            <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value
                        })} className={`w-full px-4 py-2 pr-12 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837] outline-none transition-all`} />
                            <button type="button" onClick={() => setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm
                        })} className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSecondary} ${colors.hover} p-1 rounded`}>
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 ${colors.cardSecondary} border ${colors.border} rounded-lg`}>
                        <h4 className={`text-sm font-medium ${colors.textPrimary} mb-2`}>Requisitos de contraseña:</h4>
                        <ul className={`text-sm ${colors.textSecondary} space-y-1 list-disc list-inside`}>
                          <li>Mínimo 8 caracteres</li>
                          <li>Al menos una letra mayúscula</li>
                          <li>Al menos un número</li>
                          <li>Al menos un carácter especial</li>
                        </ul>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handlePasswordChange} className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Cambiar contraseña
                        </Button>
                      </div>
                    </motion.div>}

                  {}
                  {activeTab === 'preferences' && <motion.div key="preferences" initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} transition={{
                  duration: 0.3
                }} className="space-y-6">
                      {}
                      <div>
                        <h3 className={`text-sm font-semibold ${colors.textPrimary} mb-4`}>Apariencia</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <motion.button onClick={() => setPreferences({
                        ...preferences,
                        theme: 'dark'
                      })} className={`p-4 border-2 rounded-lg transition-all ${preferences.theme === 'dark' ? 'border-[#E31837] bg-[#E31837]/5' : `${colors.border} ${colors.hover}`}`} whileHover={{
                        scale: 1.02
                      }} whileTap={{
                        scale: 0.98
                      }}>
                            <div className="w-full aspect-video bg-[#0F0F0F] rounded mb-2 flex items-center justify-center">
                              <div className="text-white text-xs">Aa</div>
                            </div>
                            <p className={`text-sm font-medium ${colors.textPrimary}`}>Modo Oscuro</p>
                          </motion.button>

                          <motion.button onClick={() => setPreferences({
                        ...preferences,
                        theme: 'light'
                      })} className={`p-4 border-2 rounded-lg transition-all ${preferences.theme === 'light' ? 'border-[#E31837] bg-[#E31837]/5' : `${colors.border} ${colors.hover}`}`} whileHover={{
                        scale: 1.02
                      }} whileTap={{
                        scale: 0.98
                      }}>
                            <div className="w-full aspect-video bg-[#F6F2EA] rounded mb-2 flex items-center justify-center border border-[#4A453D]/10">
                              <div className="text-[#29251D] text-xs">Aa</div>
                            </div>
                            <p className={`text-sm font-medium ${colors.textPrimary}`}>Modo Claro</p>
                          </motion.button>
                        </div>
                      </div>

                      {}
                      <div>
                        <h3 className={`text-sm font-semibold ${colors.textPrimary} mb-4`}>Notificaciones</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Mail className={`w-5 h-5 ${colors.textSecondary}`} />
                              <div>
                                <p className={`text-sm font-medium ${colors.textPrimary}`}>Notificaciones por email</p>
                                <p className={`text-xs ${colors.textSecondary}`}>Recibe actualizaciones por correo</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={preferences.emailNotifications} onChange={e => setPreferences({
                            ...preferences,
                            emailNotifications: e.target.checked
                          })} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E31837]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Bell className={`w-5 h-5 ${colors.textSecondary}`} />
                              <div>
                                <p className={`text-sm font-medium ${colors.textPrimary}`}>Notificaciones push</p>
                                <p className={`text-xs ${colors.textSecondary}`}>Alertas en tiempo real</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={preferences.pushNotifications} onChange={e => setPreferences({
                            ...preferences,
                            pushNotifications: e.target.checked
                          })} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E31837]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <BarChart3 className={`w-5 h-5 ${colors.textSecondary}`} />
                              <div>
                                <p className={`text-sm font-medium ${colors.textPrimary}`}>Reporte semanal</p>
                                <p className={`text-xs ${colors.textSecondary}`}>Resumen de actividades</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={preferences.weeklyReport} onChange={e => setPreferences({
                            ...preferences,
                            weeklyReport: e.target.checked
                          })} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E31837]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertCircle className={`w-5 h-5 ${colors.textSecondary}`} />
                              <div>
                                <p className={`text-sm font-medium ${colors.textPrimary}`}>Recordatorios de sprint</p>
                                <p className={`text-xs ${colors.textSecondary}`}>Avisos de inicio y fin</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={preferences.sprintReminders} onChange={e => setPreferences({
                            ...preferences,
                            sprintReminders: e.target.checked
                          })} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E31837]"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handlePreferencesSave} className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Guardar preferencias
                        </Button>
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>;
}