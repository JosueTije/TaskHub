import { useState } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Plus, X, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
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
export function CreateProject() {
  const navigate = useNavigate();
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
  const addSprint = () => {
    if (newSprint.name && newSprint.startDate && newSprint.endDate) {
      setSprints([...sprints, {
        ...newSprint,
        id: Date.now().toString()
      }]);
      setNewSprint({
        name: '',
        startDate: '',
        endDate: ''
      });
    }
  };
  const addMilestone = () => {
    if (newMilestone.name && newMilestone.plannedDate) {
      setMilestones([...milestones, {
        ...newMilestone,
        id: Date.now().toString()
      }]);
      setNewMilestone({
        name: '',
        plannedDate: ''
      });
    }
  };
  const removeSprint = (id: string) => {
    setSprints(sprints.filter(s => s.id !== id));
  };
  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };
  const handleCreateProject = () => {
    navigate('/project/1');
  };
  return <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Crear Nuevo Proyecto" subtitle="Configura tu proyecto desde cero" />
      
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Información General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                Nombre del Proyecto
              </label>
              <input type="text" placeholder="Ej: E-commerce Platform Redesign" className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                Descripción
              </label>
              <textarea rows={3} placeholder="Describe el objetivo y alcance del proyecto..." className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                  Fecha de Inicio
                </label>
                <input type="date" className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                  Fecha de Fin Estimada
                </label>
                <input type="date" className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Colaboradores
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-2">
                Buscar Developer
              </label>
              <input type="text" placeholder="Buscar por nombre..." className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Carlos Mendoza', 'Ana Rodríguez', 'Luis Fernández'].map(dev => <div key={dev} className="flex items-center gap-2 px-3 py-1.5 bg-[#0F0F0F] border border-white/10 rounded-lg">
                  <span className="text-sm text-white">{dev}</span>
                  <button className="text-[#8E8E93] hover:text-[#FF3B30]">
                    <X className="w-4 h-4" />
                  </button>
                </div>)}
            </div>
          </div>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Crear Sprints
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <input type="text" placeholder="Nombre del Sprint" value={newSprint.name} onChange={e => setNewSprint({
              ...newSprint,
              name: e.target.value
            })} className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              <input type="date" placeholder="Fecha Inicio" value={newSprint.startDate} onChange={e => setNewSprint({
              ...newSprint,
              startDate: e.target.value
            })} className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              <input type="date" placeholder="Fecha Fin" value={newSprint.endDate} onChange={e => setNewSprint({
              ...newSprint,
              endDate: e.target.value
            })} className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
            </div>
            <Button variant="secondary" icon={Plus} onClick={addSprint}>
              Agregar Sprint
            </Button>

            {}
            {sprints.length > 0 && <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-[#8E8E93]">Sprints creados:</p>
                {sprints.map(sprint => <div key={sprint.id} className="flex items-center justify-between p-3 bg-[#0F0F0F] border border-white/10 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{sprint.name}</p>
                      <p className="text-xs text-[#8E8E93] mt-1">
                        {sprint.startDate} → {sprint.endDate}
                      </p>
                    </div>
                    <button onClick={() => removeSprint(sprint.id)} className="text-[#8E8E93] hover:text-[#FF3B30] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>)}
              </div>}
          </div>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Milestones</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre del Milestone" value={newMilestone.name} onChange={e => setNewMilestone({
              ...newMilestone,
              name: e.target.value
            })} className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white placeholder-[#8E8E93] focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
              <input type="date" placeholder="Fecha Planeada" value={newMilestone.plannedDate} onChange={e => setNewMilestone({
              ...newMilestone,
              plannedDate: e.target.value
            })} className="px-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none transition-all" />
            </div>
            <Button variant="secondary" icon={Plus} onClick={addMilestone}>
              Agregar Milestone
            </Button>

            {}
            {milestones.length > 0 && <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-[#8E8E93]">Milestones creados:</p>
                {milestones.map(milestone => <div key={milestone.id} className="flex items-center justify-between p-3 bg-[#0F0F0F] border border-white/10 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{milestone.name}</p>
                      <p className="text-xs text-[#8E8E93] mt-1">
                        Fecha planeada: {milestone.plannedDate}
                      </p>
                    </div>
                    <button onClick={() => removeMilestone(milestone.id)} className="text-[#8E8E93] hover:text-[#FF3B30] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>)}
              </div>}
          </div>
        </div>

        {}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateProject}>
            Crear Proyecto
          </Button>
        </div>
      </div>
    </div>;
}