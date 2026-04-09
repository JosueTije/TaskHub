import { Header } from '../components/Header';
import { CalendarClock, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { sprints } from '../data/mockData';
const kanbanColumns = [{
  title: 'To Do',
  tasks: [{
    id: 't1',
    title: 'Implementar autenticación',
    assignee: 'CM'
  }, {
    id: 't2',
    title: 'Diseño de dashboard',
    assignee: 'AR'
  }]
}, {
  title: 'In Progress',
  tasks: [{
    id: 't3',
    title: 'API de pagos',
    assignee: 'LF'
  }, {
    id: 't4',
    title: 'Optimización de queries',
    assignee: 'PT'
  }]
}, {
  title: 'Review',
  tasks: [{
    id: 't5',
    title: 'Componentes de UI',
    assignee: 'DM'
  }]
}, {
  title: 'Done',
  tasks: [{
    id: 't6',
    title: 'Setup del proyecto',
    assignee: 'CM'
  }, {
    id: 't7',
    title: 'Configuración CI/CD',
    assignee: 'AR'
  }]
}];
export function Sprints() {
  return <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Sprints" subtitle="Gestión de sprints y seguimiento de tareas" />
      
      <div className="p-8 space-y-8">
        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Sprints Activos</h3>
            <p className="text-sm text-[#8E8E93] mt-1">Vista general de todos los sprints</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-[#0F0F0F]/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">
                    Sprint
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">
                    Capacidad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sprints.map(sprint => <tr key={sprint.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0F0F0F] border border-white/10 flex items-center justify-center">
                          <CalendarClock className="w-5 h-5 text-[#FF3B30]" />
                        </div>
                        <span className="text-sm font-medium text-white">{sprint.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#8E8E93]">{sprint.duration}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sprint.status === 'Active' ? 'bg-green-500/10 text-green-500' : sprint.status === 'Completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-[#8E8E93]/10 text-[#8E8E93]'}`}>
                        {sprint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-[#0F0F0F] rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full bg-[#FF3B30] rounded-full transition-all duration-500" style={{
                        width: `${sprint.progress}%`
                      }} />
                        </div>
                        <span className="text-sm text-white font-medium">{sprint.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-white font-medium">{sprint.used}</span>
                        <span className="text-[#8E8E93]"> / {sprint.capacity} hrs</span>
                      </div>
                      <div className="flex-1 h-1.5 bg-[#0F0F0F] rounded-full overflow-hidden max-w-[100px] mt-1">
                        <div className={`h-full rounded-full transition-all duration-500 ${sprint.used / sprint.capacity * 100 > 90 ? 'bg-[#FF3B30]' : 'bg-green-500'}`} style={{
                      width: `${sprint.used / sprint.capacity * 100}%`
                    }} />
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>

        {}
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Vista Kanban</h3>
            <p className="text-sm text-[#8E8E93] mt-1">Sprint 12 - E-commerce Platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kanbanColumns.map(column => <div key={column.title} className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-white">{column.title}</h4>
                  <span className="text-xs text-[#8E8E93] bg-[#0F0F0F] px-2 py-1 rounded">
                    {column.tasks.length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {column.tasks.map(task => <div key={task.id} className="bg-[#0F0F0F] border border-white/10 rounded-lg p-3 hover:border-[#FF3B30]/50 transition-all cursor-pointer group">
                      <p className="text-sm text-white mb-2 group-hover:text-[#FF3B30] transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center">
                          <span className="text-xs text-white">{task.assignee}</span>
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>)}
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-[#8E8E93]">Tareas Completadas</p>
                <p className="text-2xl font-semibold text-white">8 / 15</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#FF3B30]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#FF3B30]" />
              </div>
              <div>
                <p className="text-sm text-[#8E8E93]">Velocidad</p>
                <p className="text-2xl font-semibold text-white">32 pts</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-[#8E8E93]">Miembros Activos</p>
                <p className="text-2xl font-semibold text-white">5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}