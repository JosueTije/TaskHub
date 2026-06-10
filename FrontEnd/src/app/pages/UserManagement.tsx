import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Search, MoreVertical, Edit2, Trash2, Key, CheckCircle2, XCircle, X, Loader2, Shield, Briefcase, Code, Mail, Lock, User as UserIcon, AlertCircle, BarChart3, TrendingUp, Target, Award, Calendar, Activity } from 'lucide-react';
import { useAuth, UserRole, type User } from '../contexts/AuthContext';
import { useUsers } from '../contexts/AuthContext';
import { authFetch } from '../../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

// ─── Theme helper ─────────────────────────────────────────────────────────────

function makeColors(theme: 'dark' | 'light') {
  return {
    page:       theme === 'dark' ? 'bg-[#0F0F0F]'              : 'bg-[#F6F2EA]',
    card:       theme === 'dark' ? 'bg-[#1C1C1E]'              : 'bg-white',
    cardDeep:   theme === 'dark' ? 'bg-[#0F0F0F]'              : 'bg-[#E5DFD3]',
    border:     theme === 'dark' ? 'border-white/10'            : 'border-[#4A453D]/10',
    divide:     theme === 'dark' ? 'divide-white/10'            : 'divide-[#4A453D]/10',
    text:       theme === 'dark' ? 'text-white'                 : 'text-[#29251D]',
    textMuted:  theme === 'dark' ? 'text-[#8E8E93]'            : 'text-[#4A453D]',
    hoverRow:   theme === 'dark' ? 'hover:bg-[#0F0F0F]/50'     : 'hover:bg-[#E5DFD3]/50',
    hoverItem:  theme === 'dark' ? 'hover:bg-[#1C1C1E]'        : 'hover:bg-[#E5DFD3]',
    hoverDeep:  theme === 'dark' ? 'hover:bg-[#0F0F0F]'        : 'hover:bg-[#E5DFD3]',
    input:      theme === 'dark'
      ? 'bg-[#0F0F0F] border-white/10 text-white placeholder-[#8E8E93]'
      : 'bg-[#E5DFD3] border-[#4A453D]/10 text-[#29251D] placeholder-[#4A453D]',
    select:     theme === 'dark'
      ? 'bg-[#0F0F0F] border-white/10 text-white'
      : 'bg-[#E5DFD3] border-[#4A453D]/10 text-[#29251D]',
    label:      theme === 'dark' ? 'text-white'                 : 'text-[#29251D]',
    paginationBtn: theme === 'dark'
      ? 'bg-[#1C1C1E] border-white/10 text-white hover:bg-white/5'
      : 'bg-white border-[#4A453D]/10 text-[#29251D] hover:bg-[#E5DFD3]',
    dropdownBg: theme === 'dark' ? 'bg-[#0F0F0F] border-white/10' : 'bg-white border-[#4A453D]/10',
    modalBg:    theme === 'dark' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-[#4A453D]/10',
    metricCard: theme === 'dark' ? 'bg-[#0F0F0F] border-white/10' : 'bg-[#F6F2EA] border-[#4A453D]/10',
    theadBg:    theme === 'dark' ? 'bg-[#0F0F0F] border-white/10' : 'bg-[#F6F2EA] border-[#4A453D]/10',
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function UserManagement() {
  const { user: currentUser, theme } = useAuth();
  const {
    users, loading: usersLoading, error: usersError,
    page, totalPages, total,
    goToPage, handleSearch,
    createUser, updateUser, deleteUser, toggleUserStatus, resetUserPassword,
    refetch: refetchUsers,
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const c = makeColors(theme);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className={`flex items-center justify-center min-h-[60vh] ${c.page}`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#E31837] mx-auto mb-4" />
          <h2 className={`text-2xl font-bold ${c.text} mb-2`}>Acceso Denegado</h2>
          <p className={c.textMuted}>No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    );
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => handleSearch(value), 350);
  };

  const filteredUsers = users;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return <Shield className="w-4 h-4" />;
      case 'PM':    return <Briefcase className="w-4 h-4" />;
      case 'DEVELOPER': return <Code className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'PM':    return 'warning';
      case 'DEVELOPER': return 'default';
    }
  };

  const handleResetPassword = async (userId: string) => {
    setOpenDropdown(null);
    try {
      const newPassword = await resetUserPassword(userId);
      alert(`Contraseña reseteada a: ${newPassword}\nEl usuario deberá cambiarla en el próximo inicio de sesión.`);
    } catch (e: any) {
      alert(e.message || 'No se pudo resetear la contraseña');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser.id) { alert('No puedes eliminar tu propia cuenta'); return; }
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setOpenDropdown(null);
    try { await deleteUser(userId); }
    catch (e: any) { alert(e.message || 'No se pudo eliminar el usuario'); }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUser.id) { alert('No puedes cambiar el estado de tu propia cuenta'); return; }
    setOpenDropdown(null);
    try { await toggleUserStatus(userId, currentStatus ? 'INACTIVE' : 'ACTIVE'); }
    catch (e: any) { alert(e.message || 'No se pudo cambiar el estado'); }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${c.text} mb-2`}>Gestión de Usuarios</h1>
          <p className={c.textMuted}>Administra los usuarios y permisos del sistema</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <UserPlus className="w-5 h-5" />
          <span>Crear Usuario</span>
        </Button>
      </div>

      {/* Search */}
      <div className={`${c.card} border ${c.border} rounded-xl p-4`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${c.textMuted}`} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] transition-all ${c.input}`}
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuarios', value: total, icon: Users, color: 'text-[#E31837]' },
          { label: 'Administradores', value: users.filter(u => u.role === 'ADMIN').length, icon: Shield, color: 'text-[#E31837]' },
          { label: 'Project Managers', value: users.filter(u => u.role === 'PM').length, icon: Briefcase, color: 'text-yellow-500' },
          { label: 'Developers', value: users.filter(u => u.role === 'DEVELOPER').length, icon: Code, color: 'text-blue-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} className={`${c.card} border ${c.border} rounded-xl p-5`} whileHover={{ scale: 1.02 }}>
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <p className={`text-sm ${c.textMuted}`}>{label}</p>
            </div>
            <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Error banner */}
      {usersError && (
        <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF3B30] flex-shrink-0" />
            <div>
              <p className={`text-sm font-medium ${c.text}`}>No se pudieron cargar los usuarios</p>
              <p className={`text-xs ${c.textMuted} mt-0.5`}>{usersError}</p>
            </div>
          </div>
          <button
            onClick={refetchUsers}
            disabled={usersLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#FF3B30] rounded-lg hover:bg-[#E31837] disabled:opacity-50 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            {usersLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            Reintentar
          </button>
        </div>
      )}

      {/* Users table */}
      <div className={`${c.card} border ${c.border} rounded-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${c.theadBg} border-b ${c.border}`}>
              <tr>
                {['Usuario', 'Email', 'Rol', 'Estado', 'Acciones'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-xs font-semibold ${c.textMuted} uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${c.divide}`}>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className={`px-6 py-12 text-center ${c.textMuted} text-sm`}>
                    {searchTerm.trim()
                      ? `No se encontraron usuarios para "${searchTerm.trim()}"`
                      : 'No hay usuarios en el sistema'}
                  </td>
                </tr>
              )}
              {filteredUsers.map(user => (
                <motion.tr
                  key={user.id}
                  className={`${c.hoverRow} transition-colors`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E31837] to-[#FF3B30] flex items-center justify-center text-lg flex-shrink-0">
                        {user.avatar}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${c.text}`}>{user.name}</p>
                        {user.needsPasswordReset && (
                          <p className="text-xs text-orange-500">Debe cambiar contraseña</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm ${c.textMuted}`}>{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleIcon(user.role)}
                      <span>{user.role}</span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive
                      ? <Badge variant="success"><CheckCircle2 className="w-3 h-3" /><span>Activo</span></Badge>
                      : <Badge variant="danger"><XCircle className="w-3 h-3" /><span>Inactivo</span></Badge>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                        className={`p-2 ${c.hoverDeep} rounded-lg transition-colors`}
                      >
                        <MoreVertical className={`w-5 h-5 ${c.textMuted}`} />
                      </button>

                      <AnimatePresence>
                        {openDropdown === user.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className={`absolute right-0 top-full mt-2 w-48 ${c.dropdownBg} border rounded-lg shadow-xl z-10`}
                          >
                            <button
                              onClick={() => { setSelectedUser(user); setShowMetricsModal(true); setOpenDropdown(null); }}
                              className={`w-full px-4 py-2.5 flex items-center gap-2 text-sm ${c.text} ${c.hoverItem} transition-colors rounded-t-lg`}
                            >
                              <BarChart3 className="w-4 h-4" /><span>Ver Métricas</span>
                            </button>
                            <div className={`border-t ${c.border}`} />
                            <button
                              onClick={() => { setSelectedUser(user); setShowEditModal(true); setOpenDropdown(null); }}
                              className={`w-full px-4 py-2.5 flex items-center gap-2 text-sm ${c.text} ${c.hoverItem} transition-colors`}
                            >
                              <Edit2 className="w-4 h-4" /><span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className={`w-full px-4 py-2.5 flex items-center gap-2 text-sm ${c.text} ${c.hoverItem} transition-colors`}
                            >
                              <Key className="w-4 h-4" /><span>Resetear contraseña</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              className={`w-full px-4 py-2.5 flex items-center gap-2 text-sm ${c.text} ${c.hoverItem} transition-colors`}
                            >
                              {user.isActive
                                ? <><XCircle className="w-4 h-4" /><span>Desactivar</span></>
                                : <><CheckCircle2 className="w-4 h-4" /><span>Activar</span></>}
                            </button>
                            <div className={`border-t ${c.border}`} />
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-[#E31837] hover:bg-[#E31837]/10 transition-colors rounded-b-lg"
                            >
                              <Trash2 className="w-4 h-4" /><span>Eliminar</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between text-sm ${c.textMuted}`}>
          <span>{total} usuarios · página {page} de {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || usersLoading}
              className={`px-3 py-1.5 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${c.paginationBtn}`}
            >
              ← Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    disabled={usersLoading}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 border ${
                      p === page
                        ? 'bg-[#E31837] text-white border-transparent'
                        : c.paginationBtn
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || usersLoading}
              className={`px-3 py-1.5 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${c.paginationBtn}`}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createUser}
        theme={theme}
      />
      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
          user={selectedUser}
          onUpdate={updateUser}
          theme={theme}
        />
      )}
      {selectedUser && (
        <UserMetricsModal
          isOpen={showMetricsModal}
          onClose={() => { setShowMetricsModal(false); setSelectedUser(null); }}
          user={selectedUser}
          theme={theme}
        />
      )}
    </div>
  );
}

// ─── CreateUserModal ──────────────────────────────────────────────────────────

function CreateUserModal({
  isOpen, onClose, onCreate, theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (user: any) => void;
  theme: 'dark' | 'light';
}) {
  const c = makeColors(theme);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'DEVELOPER' as UserRole, temporaryPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          temporaryPassword: formData.temporaryPassword.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al crear usuario');
      onCreate({
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
        avatar: '👤',
        isActive: data.user.status === 'ACTIVE',
        needsPasswordReset: true,
      });
      alert('Usuario creado correctamente');
      handleClose();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        alert('La petición tardó demasiado. Revisa si el usuario se creó y vuelve a intentar.');
      } else {
        alert(error.message || 'No se pudo crear el usuario');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', role: 'DEVELOPER', temporaryPassword: '' });
    setGeneratedPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`${c.modalBg} border rounded-2xl p-6 w-full max-w-md`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${c.text}`}>Crear Usuario</h3>
          <button onClick={handleClose} className={`p-2 ${c.hoverDeep} rounded-lg transition-colors`}>
            <X className={`w-5 h-5 ${c.textMuted}`} />
          </button>
        </div>

        {generatedPassword ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-green-500">Usuario creado exitosamente</p>
              </div>
              <p className={`text-xs ${c.textMuted} mb-3`}>Contraseña temporal asignada por el administrador.</p>
              <div className={`${c.cardDeep} rounded-lg p-3`}>
                <p className={`text-xs ${c.textMuted} mb-1`}>Contraseña:</p>
                <p className={`text-sm font-mono ${c.text} break-all`}>{generatedPassword}</p>
              </div>
            </div>
            <Button variant="primary" onClick={handleClose} className="w-full"><span>Cerrar</span></Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${c.label} mb-2`}>Nombre completo</label>
              <div className="relative">
                <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${c.textMuted}`} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] ${c.input}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${c.label} mb-2`}>Email corporativo</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${c.textMuted}`} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] ${c.input}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${c.label} mb-2`}>Rol</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] ${c.select}`}
              >
                <option value="DEVELOPER">Developer</option>
                <option value="PM">Project Manager</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${c.label} mb-2`}>Contraseña temporal</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${c.textMuted}`} />
                <input
                  type="text"
                  value={formData.temporaryPassword}
                  onChange={e => setFormData({ ...formData, temporaryPassword: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] ${c.input}`}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
                <span>Cancelar</span>
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
                {isLoading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Creando...</span></>
                  : <span>Crear Usuario</span>}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ─── EditUserModal ────────────────────────────────────────────────────────────

function EditUserModal({
  isOpen, onClose, user, onUpdate, theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (id: string, updates: { name: string; role: UserRole }) => Promise<void>;
  theme: 'dark' | 'light';
}) {
  const c = makeColors(theme);
  const [formData, setFormData] = useState({ name: '', role: 'DEVELOPER' as UserRole });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setFormData({ name: user.name, role: user.role });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onUpdate(user.id, { name: formData.name.trim(), role: formData.role });
      onClose();
    } catch (e: any) {
      setError(e.message || 'No se pudo actualizar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`${c.modalBg} border rounded-2xl p-6 w-full max-w-md`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${c.text}`}>Editar Usuario</h3>
          <button onClick={onClose} className={`p-2 ${c.hoverDeep} rounded-lg transition-colors`}>
            <X className={`w-5 h-5 ${c.textMuted}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${c.label} mb-2`}>Nombre completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] ${c.input}`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${c.label} mb-2`}>Rol</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] ${c.select}`}
            >
              <option value="DEVELOPER">Developer</option>
              <option value="PM">Project Manager</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          {error && <p className="text-sm text-[#E31837]">{error}</p>}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              <span>Cancelar</span>
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <span>Guardar Cambios</span>}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── UserMetricsModal ─────────────────────────────────────────────────────────

interface UserMetrics {
  projectsAssigned: number;
  totalTickets: number;
  completedTickets: number;
  inProgressTickets: number;
  blockedTickets: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  points: number;
  sprintsParticipated: number;
  performance: number;
}

function UserMetricsModal({
  isOpen, onClose, user, theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  theme: 'dark' | 'light';
}) {
  const c = makeColors(theme);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    setError('');
    authFetch<{ metrics: UserMetrics }>(`/users/${user.id}/metrics`)
      .then(({ metrics }) => setMetrics(metrics))
      .catch((e: any) => setError(e.message || 'No se pudieron cargar las métricas'))
      .finally(() => setLoading(false));
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modalBg} border rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E31837] to-[#FF3B30] flex items-center justify-center text-xl flex-shrink-0">
              {user.avatar}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${c.text}`}>{user.name}</h3>
              <p className={`text-sm ${c.textMuted}`}>{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 ${c.hoverDeep} rounded-lg transition-colors`}>
            <X className={`w-5 h-5 ${c.textMuted}`} />
          </button>
        </div>

        {/* Role + status badges */}
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

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#E31837]" />
          </div>
        )}
        {error && <p className="text-sm text-[#E31837] py-4">{error}</p>}

        {!loading && !error && metrics && (
          <>
            <h4 className={`text-lg font-semibold ${c.text} mb-4 flex items-center gap-2`}>
              <BarChart3 className="w-5 h-5 text-[#E31837]" />
              Métricas de {user.role === 'ADMIN' ? 'Administración' : user.role === 'PM' ? 'Project Manager' : 'Desarrollo'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Proyectos Asignados', value: metrics.projectsAssigned, icon: Briefcase, color: 'text-yellow-500' },
                { label: 'Total Tickets', value: metrics.totalTickets, icon: Target, color: 'text-blue-500' },
                { label: 'Completados', value: metrics.completedTickets, icon: CheckCircle2, color: 'text-green-500' },
                { label: 'En Progreso', value: metrics.inProgressTickets, icon: Activity, color: 'text-blue-400' },
                { label: 'Bloqueados', value: metrics.blockedTickets, icon: AlertCircle, color: 'text-[#E31837]' },
                { label: 'Story Points', value: `${metrics.completedStoryPoints}/${metrics.totalStoryPoints}`, icon: Award, color: 'text-yellow-500' },
                { label: 'Puntos', value: metrics.points, icon: TrendingUp, color: 'text-green-500' },
                { label: 'Sprints Participados', value: metrics.sprintsParticipated, icon: Calendar, color: 'text-purple-500' },
                { label: 'Rendimiento', value: `${metrics.performance}%`, icon: BarChart3, color: 'text-[#E31837]' },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div
                  key={label}
                  className={`${c.metricCard} border rounded-xl p-5`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <p className={`text-sm ${c.textMuted}`}>{label}</p>
                  </div>
                  <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}><span>Cerrar</span></Button>
        </div>
      </motion.div>
    </div>
  );
}
