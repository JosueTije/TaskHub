import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Search, MoreVertical, Edit2, Trash2, Key, CheckCircle2, XCircle, X, Loader2, Shield, Briefcase, Code, Mail, Lock, User as UserIcon, AlertCircle, BarChart3, TrendingUp, TrendingDown, Clock, Target, Award, Calendar, Activity } from 'lucide-react';
import { useAuth, UserRole, type User } from '../contexts/AuthContext';
import { useUsers } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
export function UserManagement() {
  const {
    user: currentUser,
    theme
  } = useAuth();
  const {
    users,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword
  } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  if (currentUser?.role !== 'ADMIN') {
    return <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#E31837] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-[#8E8E93]">No tienes permisos para acceder a esta página</p>
        </div>
      </div>;
  }
  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || user.role.toLowerCase().includes(searchTerm.toLowerCase()));
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'PM':
        return <Briefcase className="w-4 h-4" />;
      case 'DEVELOPER':
        return <Code className="w-4 h-4" />;
    }
  };
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'PM':
        return 'warning';
      case 'DEVELOPER':
        return 'default';
    }
  };
  const handleResetPassword = (userId: string) => {
    const newPassword = resetUserPassword(userId);
    alert(`Contraseña reseteada a: ${newPassword}\nEl usuario deberá cambiarla en el próximo inicio de sesión.`);
    setOpenDropdown(null);
  };
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      deleteUser(userId);
      setOpenDropdown(null);
    }
  };
  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    if (userId === currentUser.id) {
      alert('No puedes desactivar tu propia cuenta');
      return;
    }
    updateUser(userId, {
      isActive: !currentStatus
    });
    setOpenDropdown(null);
  };
  return <div className="p-6 md:p-8 space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
          <p className="text-[#8E8E93]">Administra los usuarios y permisos del sistema</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <UserPlus className="w-5 h-5" />
          <span>Crear Usuario</span>
        </Button>
      </div>

      {}
      <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
          <input type="text" placeholder="Buscar por nombre, email o rol..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#E31837] transition-all" />
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5" whileHover={{
        scale: 1.02
      }}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-[#E31837]" />
            <p className="text-sm text-[#8E8E93]">Total Usuarios</p>
          </div>
          <p className="text-3xl font-bold text-white">{users.length}</p>
        </motion.div>

        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5" whileHover={{
        scale: 1.02
      }}>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-[#E31837]" />
            <p className="text-sm text-[#8E8E93]">Administradores</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
        </motion.div>

        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5" whileHover={{
        scale: 1.02
      }}>
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-[#8E8E93]">Project Managers</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {users.filter(u => u.role === 'PM').length}
          </p>
        </motion.div>

        <motion.div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5" whileHover={{
        scale: 1.02
      }}>
          <div className="flex items-center gap-3 mb-2">
            <Code className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-[#8E8E93]">Developers</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {users.filter(u => u.role === 'DEVELOPER').length}
          </p>
        </motion.div>
      </div>

      {}
      <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0F0F0F] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map(user => <motion.tr key={user.id} className="hover:bg-[#0F0F0F]/50 transition-colors" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E31837] to-[#FF3B30] flex items-center justify-center text-lg">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        {user.needsPasswordReset && <p className="text-xs text-orange-500">Debe cambiar contraseña</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#8E8E93]">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleIcon(user.role)}
                      <span>{user.role}</span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Activo</span>
                      </Badge> : <Badge variant="danger">
                        <XCircle className="w-3 h-3" />
                        <span>Inactivo</span>
                      </Badge>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end relative">
                      <button onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)} className="p-2 hover:bg-[#0F0F0F] rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-[#8E8E93]" />
                      </button>

                      <AnimatePresence>
                        {openDropdown === user.id && <motion.div initial={{
                      opacity: 0,
                      scale: 0.95,
                      y: -10
                    }} animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0
                    }} exit={{
                      opacity: 0,
                      scale: 0.95,
                      y: -10
                    }} className="absolute right-0 top-full mt-2 w-48 bg-[#0F0F0F] border border-white/10 rounded-lg shadow-xl z-10">
                            <button onClick={() => {
                        setSelectedUser(user);
                        setShowMetricsModal(true);
                        setOpenDropdown(null);
                      }} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-[#1C1C1E] transition-colors rounded-t-lg">
                              <BarChart3 className="w-4 h-4" />
                              <span>Ver Métricas</span>
                            </button>
                            <div className="border-t border-white/10" />
                            <button onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                        setOpenDropdown(null);
                      }} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-[#1C1C1E] transition-colors">
                              <Edit2 className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                            <button onClick={() => handleResetPassword(user.id)} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-[#1C1C1E] transition-colors">
                              <Key className="w-4 h-4" />
                              <span>Resetear contraseña</span>
                            </button>
                            <button onClick={() => handleToggleStatus(user.id, user.isActive)} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-[#1C1C1E] transition-colors">
                              {user.isActive ? <>
                                  <XCircle className="w-4 h-4" />
                                  <span>Desactivar</span>
                                </> : <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Activar</span>
                                </>}
                            </button>
                            <div className="border-t border-white/10" />
                            <button onClick={() => handleDeleteUser(user.id)} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-[#E31837] hover:bg-[#E31837]/10 transition-colors rounded-b-lg">
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          </motion.div>}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {}
      <CreateUserModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={createUser} />

      {}
      {selectedUser && <EditUserModal isOpen={showEditModal} onClose={() => {
      setShowEditModal(false);
      setSelectedUser(null);
    }} user={selectedUser} onUpdate={updateUser} />}

      {}
      {selectedUser && <UserMetricsModal isOpen={showMetricsModal} onClose={() => {
      setShowMetricsModal(false);
      setSelectedUser(null);
    }} user={selectedUser} />}
    </div>;
}
function CreateUserModal({
  isOpen,
  onClose,
  onCreate
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (user: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'DEVELOPER' as UserRole,
    temporaryPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          role: formData.role,
          temporaryPassword: formData.temporaryPassword
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al crear usuario");
      }
      setGeneratedPassword(formData.temporaryPassword);
      onCreate({
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
        avatar: "👤",
        isActive: data.user.status === "ACTIVE",
        needsPasswordReset: true
      });
    } catch (error: any) {
      alert(error.message || "No se pudo crear el usuario");
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'DEVELOPER',
      temporaryPassword: ''
    });
    setGeneratedPassword('');
    onClose();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} exit={{
      opacity: 0,
      scale: 0.95
    }} className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Crear Usuario</h3>
          <button onClick={handleClose} className="p-2 hover:bg-[#0F0F0F] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#8E8E93]" />
          </button>
        </div>

        {generatedPassword ? <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-green-500">Usuario creado exitosamente</p>
              </div>
              <p className="text-xs text-[#8E8E93] mb-3">
                Contraseña temporal asignada por el administrador.
              </p>
              <div className="bg-[#0F0F0F] rounded-lg p-3">
                <p className="text-xs text-[#8E8E93] mb-1">Contraseña:</p>
                <p className="text-sm font-mono text-white break-all">{generatedPassword}</p>
              </div>
            </div>

            <Button variant="primary" onClick={handleClose} className="w-full">
              <span>Cerrar</span>
            </Button>
          </div> : <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input type="text" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} className="w-full pl-10 pr-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E31837]" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Email corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input type="email" value={formData.email} onChange={e => setFormData({
              ...formData,
              email: e.target.value
            })} className="w-full pl-10 pr-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E31837]" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Rol</label>
              <select value={formData.role} onChange={e => setFormData({
            ...formData,
            role: e.target.value as UserRole
          })} className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E31837]">
                <option value="DEVELOPER">Developer</option>
                <option value="PM">Project Manager</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Contraseña temporal</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input type="text" value={formData.temporaryPassword} onChange={e => setFormData({
              ...formData,
              temporaryPassword: e.target.value
            })} className="w-full pl-10 pr-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E31837]" required />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
                <span>Cancelar</span>
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
                {isLoading ? <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creando...</span>
                  </> : <span>Crear Usuario</span>}
              </Button>
            </div>
          </form>}
      </motion.div>
    </div>;
}
function EditUserModal({
  isOpen,
  onClose,
  user,
  onUpdate
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (id: string, updates: Partial<User>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'DEVELOPER' as UserRole,
    temporaryPassword: ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          role: formData.role,
          temporaryPassword: formData.temporaryPassword
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al crear usuario");
      }
      setGeneratedPassword(formData.temporaryPassword);
      onCreate({
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
        avatar: "👤",
        isActive: data.user.status === "ACTIVE",
        needsPasswordReset: true
      });
    } catch (error: any) {
      alert(error.message || "No se pudo crear el usuario");
    } finally {
      setIsLoading(false);
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} exit={{
      opacity: 0,
      scale: 0.95
    }} className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#0F0F0F] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#8E8E93]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Nombre completo</label>
            <input type="text" value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E31837]" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })} className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E31837]" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Rol</label>
            <select value={formData.role} onChange={e => setFormData({
            ...formData,
            role: e.target.value as UserRole
          })} className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E31837]">
              <option value="DEVELOPER">Developer</option>
              <option value="PM">Project Manager</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

        <div>
  <label className="block text-sm font-medium text-white mb-2">Contraseña temporal</label>
  <div className="relative">
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
    <input type="text" value={formData.temporaryPassword} onChange={e => setFormData({
              ...formData,
              temporaryPassword: e.target.value
            })} className="w-full pl-10 pr-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E31837]" placeholder="Ej. Temp123!" required minLength={8} />
  </div>
  <p className="text-xs text-[#8E8E93] mt-2">
    El usuario usará esta contraseña para su primer inicio de sesión.
  </p>
        </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              <span>Cancelar</span>
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              <span>Guardar Cambios</span>
            </Button>
          </div>
        </form>
      </motion.div>
    </div>;
}
function UserMetricsModal({
  isOpen,
  onClose,
  user
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}) {
  const generateMetrics = () => {
    const baseMultiplier = parseInt(user.id);
    if (user.role === 'ADMIN') {
      return {
        projectsManaged: 12,
        totalUsers: 48,
        activeUsers: 45,
        totalTickets: 1234,
        resolvedTickets: 987,
        systemUptime: 99.9,
        averageResponseTime: 2.3,
        totalSprintsCompleted: 45
      };
    } else if (user.role === 'PM') {
      return {
        projectsManaged: 5 + baseMultiplier,
        activeProjects: 3,
        completedProjects: 2 + baseMultiplier,
        totalSprints: 24,
        completedSprints: 18,
        activeSprints: 6,
        totalTeamMembers: 12,
        totalTickets: 156,
        completedTickets: 98,
        onTrackTickets: 45,
        delayedTickets: 13,
        averageVelocity: 32
      };
    } else {
      return {
        projectsAssigned: 3,
        totalTickets: 67,
        completedTickets: 45,
        inProgressTickets: 15,
        reviewTickets: 7,
        totalStoryPoints: 234,
        completedStoryPoints: 189,
        averageCompletionTime: 4.2,
        totalCommits: 342,
        totalPRs: 89,
        codeReviewsGiven: 67,
        sprintsParticipated: 18
      };
    }
  };
  const metrics = generateMetrics();
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} exit={{
      opacity: 0,
      scale: 0.95
    }} onClick={e => e.stopPropagation()} className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E31837] to-[#FF3B30] flex items-center justify-center text-xl">
              {user.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-sm text-[#8E8E93]">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#0F0F0F] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#8E8E93]" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'PM' ? 'warning' : 'default'}>
            {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
            {user.role === 'PM' && <Briefcase className="w-3 h-3" />}
            {user.role === 'DEVELOPER' && <Code className="w-3 h-3" />}
            <span>{user.role}</span>
          </Badge>
          <Badge variant={user.isActive ? 'success' : 'danger'}>
            {user.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{user.isActive ? 'Activo' : 'Inactivo'}</span>
          </Badge>
        </div>

        {}
        {user.role === 'ADMIN' && <>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E31837]" />
              Métricas de Administración
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm text-[#8E8E93]">Proyectos Gestionados</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.projectsManaged}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-[#E31837]" />
                  <p className="text-sm text-[#8E8E93]">Total Usuarios</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalUsers}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-[#8E8E93]">Usuarios Activos</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.activeUsers}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-[#8E8E93]">Total Tickets</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalTickets}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-[#8E8E93]">Tickets Resueltos</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.resolvedTickets}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-[#8E8E93]">Uptime del Sistema</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.systemUptime}%</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-[#8E8E93]">Tiempo Respuesta Promedio</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.averageResponseTime}h</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <p className="text-sm text-[#8E8E93]">Sprints Completados</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalSprintsCompleted}</p>
              </motion.div>
            </div>
          </>}

        {user.role === 'PM' && <>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E31837]" />
              Métricas de Project Manager
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm text-[#8E8E93]">Proyectos Gestionados</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.projectsManaged}</p>
                <div className="mt-2 flex gap-3 text-xs">
                  <span className="text-green-500">✓ {metrics.completedProjects} completados</span>
                  <span className="text-blue-500">⚡ {metrics.activeProjects} activos</span>
                </div>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <p className="text-sm text-[#8E8E93]">Total Sprints</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalSprints}</p>
                <div className="mt-2 flex gap-3 text-xs">
                  <span className="text-green-500">✓ {metrics.completedSprints} completados</span>
                  <span className="text-blue-500">⚡ {metrics.activeSprints} activos</span>
                </div>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-[#E31837]" />
                  <p className="text-sm text-[#8E8E93]">Miembros del Equipo</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalTeamMembers}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-[#8E8E93]">Total Tickets</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalTickets}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-[#8E8E93]">Tickets Completados</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.completedTickets}</p>
                <p className="text-xs text-[#8E8E93] mt-1">
                  {Math.round(metrics.completedTickets / metrics.totalTickets * 100)}% completado
                </p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-[#8E8E93]">En Progreso</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.onTrackTickets}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <p className="text-sm text-[#8E8E93]">Tickets Retrasados</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.delayedTickets}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-[#8E8E93]">Velocidad Promedio</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.averageVelocity}</p>
                <p className="text-xs text-[#8E8E93] mt-1">puntos por sprint</p>
              </motion.div>
            </div>
          </>}

        {user.role === 'DEVELOPER' && <>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E31837]" />
              Métricas de Desarrollo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm text-[#8E8E93]">Proyectos Asignados</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.projectsAssigned}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-[#8E8E93]">Total Tickets</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalTickets}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-[#8E8E93]">Tickets Completados</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.completedTickets}</p>
                <p className="text-xs text-[#8E8E93] mt-1">
                  {Math.round(metrics.completedTickets / metrics.totalTickets * 100)}% completado
                </p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-[#8E8E93]">En Progreso</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.inProgressTickets}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Code className="w-5 h-5 text-purple-500" />
                  <p className="text-sm text-[#8E8E93]">En Revisión</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.reviewTickets}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm text-[#8E8E93]">Story Points Totales</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalStoryPoints}</p>
                <p className="text-xs text-green-500 mt-1">✓ {metrics.completedStoryPoints} completados</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-[#8E8E93]">Tiempo Promedio Completar</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.averageCompletionTime}</p>
                <p className="text-xs text-[#8E8E93] mt-1">días por ticket</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Code className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-[#8E8E93]">Total Commits</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalCommits}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Code className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-[#8E8E93]">Pull Requests</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.totalPRs}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-500" />
                  <p className="text-sm text-[#8E8E93]">Code Reviews Dados</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.codeReviewsGiven}</p>
              </motion.div>

              <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5" whileHover={{
            scale: 1.02
          }}>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <p className="text-sm text-[#8E8E93]">Sprints Participados</p>
                </div>
                <p className="text-3xl font-bold text-white">{metrics.sprintsParticipated}</p>
              </motion.div>
            </div>
          </>}

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            <span>Cerrar</span>
          </Button>
        </div>
      </motion.div>
    </div>;
}