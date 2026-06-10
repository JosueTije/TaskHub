import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { toast } from 'sonner';
import { Plus, X, Calendar, Users, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { authFetch } from '../../services/api';

interface SprintData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface MilestoneData {
  id: string;
  name: string;
  plannedDate: string;
}

interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'PM' | 'DEVELOPER' | 'VIEWER';
  avatarUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_SETUP';
}

interface CreateProjectResponse {
  message: string;
  project: {
    id: string;
    name: string;
    code: string;
  };
}

export function CreateProject() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<BackendUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [projectForm, setProjectForm] = useState({
    name: '',
    code: '',
    description: '',
    pmId: '',
    riskLevel: 'LOW',
    startDate: '',
    targetEndDate: '',
  });

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchDeveloper, setSearchDeveloper] = useState('');

  const [sprints, setSprints] = useState<SprintData[]>([]);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);

  const [newSprint, setNewSprint] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const [newMilestone, setNewMilestone] = useState({
    name: '',
    plannedDate: ''
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        setError('');

        const data = await authFetch<{ users: BackendUser[] }>('/users');
        setUsers(data.users);
      } catch (err: any) {
        setError(err.message || 'No se pudieron cargar los usuarios');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const pmOptions = useMemo(() => {
    return users.filter((user) => user.role === 'PM' || user.role === 'ADMIN');
  }, [users]);

  const developerOptions = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = user.role === 'DEVELOPER';
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchDeveloper.toLowerCase()) ||
        user.email.toLowerCase().includes(searchDeveloper.toLowerCase());

      return matchesRole && matchesSearch;
    });
  }, [users, searchDeveloper]);

  const selectedDevelopers = useMemo(() => {
    return users.filter((user) => selectedMemberIds.includes(user.id));
  }, [users, selectedMemberIds]);

  const addSprint = () => {
    if (newSprint.name && newSprint.startDate && newSprint.endDate) {
      setSprints([
        ...sprints,
        {
          ...newSprint,
          id: Date.now().toString()
        }
      ]);

      setNewSprint({
        name: '',
        startDate: '',
        endDate: ''
      });
    }
  };

  const addMilestone = () => {
    if (newMilestone.name && newMilestone.plannedDate) {
      setMilestones([
        ...milestones,
        {
          ...newMilestone,
          id: Date.now().toString()
        }
      ]);

      setNewMilestone({
        name: '',
        plannedDate: ''
      });
    }
  };

  const removeSprint = (id: string) => {
    setSprints(sprints.filter((s) => s.id !== id));
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const addDeveloper = (userId: string) => {
    if (!selectedMemberIds.includes(userId)) {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const removeDeveloper = (userId: string) => {
    setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
  };

  const handleCreateProject = async () => {
    try {
      setError('');

      if (!projectForm.name.trim()) {
        setError('El nombre del proyecto es obligatorio');
        return;
      }

      if (!projectForm.code.trim()) {
        setError('El código del proyecto es obligatorio');
        return;
      }

      if (!projectForm.startDate || !projectForm.targetEndDate) {
        setError('Debes seleccionar fecha de inicio y fecha de fin');
        return;
      }

      if (new Date(projectForm.targetEndDate) < new Date(projectForm.startDate)) {
        setError('La fecha de fin no puede ser anterior a la fecha de inicio');
        return;
      }

      setIsSubmitting(true);

      const payload = {
        name: projectForm.name.trim(),
        code: projectForm.code.trim(),
        description: projectForm.description.trim() || null,
        pmId: projectForm.pmId || null,
        riskLevel: projectForm.riskLevel,
        startDate: projectForm.startDate,
        targetEndDate: projectForm.targetEndDate,
        memberIds: selectedMemberIds,
      };

      const data = await authFetch<CreateProjectResponse>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('Proyecto creado correctamente');
      navigate(`/project/${data.project.id}`);
    } catch (err: any) {
      setError(err.message || 'No se pudo crear el proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Crear Nuevo Proyecto" subtitle="Configura tu proyecto desde cero" />

      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-[#FF3B30] flex-shrink-0" />
            <p className="text-sm text-[#FF3B30]">{error}</p>
          </div>
        )}

        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Información General</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="Ej: E-commerce Platform Redesign"
                className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                Código del Proyecto
              </label>
              <input
                type="text"
                value={projectForm.code}
                onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value.toUpperCase() })}
                placeholder="Ej: ECOM"
                className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                Descripción
              </label>
              <textarea
                rows={3}
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Describe el objetivo y alcance del proyecto..."
                className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                  Fecha de Fin Estimada
                </label>
                <input
                  type="date"
                  value={projectForm.targetEndDate}
                  onChange={(e) => setProjectForm({ ...projectForm, targetEndDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                  PM
                </label>
                <select
                  value={projectForm.pmId}
                  onChange={(e) => setProjectForm({ ...projectForm, pmId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all"
                >
                  <option value="">Sin PM asignado</option>
                  {pmOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.role})
                    </option>
                  ))}
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                  Nivel de Riesgo
                </label>
                <select
                  value={projectForm.riskLevel}
                  onChange={(e) => setProjectForm({ ...projectForm, riskLevel: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all"
                >
                  <option value="LOW">Bajo</option>
                  <option value="MEDIUM">Medio</option>
                  <option value="HIGH">Alto</option>
                  <option value="CRITICAL">Crítico</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Colaboradores
          </h3>

          {isLoadingUsers ? (
            <div className="flex items-center gap-2 text-[#8E8E93]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando usuarios...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                  Buscar Developer
                </label>
                <input
                  type="text"
                  value={searchDeveloper}
                  onChange={(e) => setSearchDeveloper(e.target.value)}
                  placeholder="Buscar por nombre o correo..."
                  className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedDevelopers.length === 0 ? (
                  <p className="text-sm text-[#8E8E93]">No has agregado developers todavía.</p>
                ) : (
                  selectedDevelopers.map((dev) => (
                    <div
                      key={dev.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#0F0F0F] border border-white/10 rounded-lg"
                    >
                      <span className="text-sm text-white">{dev.fullName}</span>
                      <button
                        onClick={() => removeDeveloper(dev.id)}
                        className="text-[#8E8E93] hover:text-[#FF3B30]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2">
                {developerOptions
                  .filter((dev) => !selectedMemberIds.includes(dev.id))
                  .map((dev) => (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => addDeveloper(dev.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-lg hover:border-[#FF3B30] transition-all text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{dev.fullName}</p>
                        <p className="text-xs text-[#8E8E93]">{dev.email}</p>
                      </div>
                      <span className="text-xs text-[#FF3B30]">Agregar</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 opacity-70">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Crear Sprints
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nombre del Sprint"
                value={newSprint.name}
                onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93]"
              />
              <input
                type="date"
                value={newSprint.startDate}
                onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white"
              />
              <input
                type="date"
                value={newSprint.endDate}
                onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white"
              />
            </div>

            <Button variant="secondary" icon={Plus} onClick={addSprint}>
              Agregar Sprint
            </Button>

            {sprints.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-[#8E8E93]">Sprints creados localmente:</p>
                {sprints.map((sprint) => (
                  <div
                    key={sprint.id}
                    className="flex items-center justify-between p-3 bg-[#0F0F0F] border border-white/10 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{sprint.name}</p>
                      <p className="text-xs text-[#8E8E93] mt-1">
                        {sprint.startDate} → {sprint.endDate}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSprint(sprint.id)}
                      className="text-[#8E8E93] hover:text-[#FF3B30] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-[#8E8E93]">
              Por ahora los sprints aún no se guardan en backend. Los conectamos en el siguiente paso.
            </p>
          </div>
        </div>

        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 opacity-70">
          <h3 className="text-lg font-semibold text-white mb-4">Milestones</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre del Milestone"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93]"
              />
              <input
                type="date"
                value={newMilestone.plannedDate}
                onChange={(e) => setNewMilestone({ ...newMilestone, plannedDate: e.target.value })}
                className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white"
              />
            </div>

            <Button variant="secondary" icon={Plus} onClick={addMilestone}>
              Agregar Milestone
            </Button>

            {milestones.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-[#8E8E93]">Milestones creados localmente:</p>
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-3 bg-[#0F0F0F] border border-white/10 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{milestone.name}</p>
                      <p className="text-xs text-[#8E8E93] mt-1">
                        Fecha planeada: {milestone.plannedDate}
                      </p>
                    </div>
                    <button
                      onClick={() => removeMilestone(milestone.id)}
                      className="text-[#8E8E93] hover:text-[#FF3B30] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-[#8E8E93]">
              Por ahora los milestones aún no se guardan en backend porque no existen en tu schema Prisma actual.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleCreateProject} disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
          </Button>
        </div>
      </div>
    </div>
  );
}