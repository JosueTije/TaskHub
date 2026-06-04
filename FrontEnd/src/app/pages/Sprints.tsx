import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { CalendarClock, TrendingUp, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { authFetch } from '../../services/api';
import { useAuth } from '../contexts/AuthContext';

interface BackendProject { id: string; name: string; }
interface BackendSprint {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  capacity: number;
  _count: { tickets: number };
  projectId: string;
  projectName?: string;
}

function statusLabel(s: string) {
  const map: Record<string, string> = { PLANNING: 'Planning', ACTIVE: 'Active', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
  return map[s] ?? s;
}

function statusColor(s: string) {
  if (s === 'ACTIVE') return 'bg-green-500/10 text-green-500';
  if (s === 'COMPLETED') return 'bg-blue-500/10 text-blue-500';
  if (s === 'CANCELLED') return 'bg-[#8E8E93]/10 text-[#8E8E93]';
  return 'bg-yellow-500/10 text-yellow-500';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function Sprints() {
  const { user } = useAuth();
  const [sprints, setSprints] = useState<BackendSprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const { projects } = await authFetch<{ projects: BackendProject[] }>('/projects');
        const results = await Promise.allSettled(
          projects.map(p => authFetch<BackendSprint[]>(`/sprints/project/${p.id}`).then(list =>
            list.map(s => ({ ...s, projectName: p.name }))
          ))
        );
        const all: BackendSprint[] = [];
        results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value); });
        // sort: ACTIVE first, then by startDate desc
        all.sort((a, b) => {
          if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
          if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
        setSprints(all);
      } catch {
        setSprints([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const activeSprints = sprints.filter(s => s.status === 'ACTIVE');
  const totalTickets = sprints.reduce((sum, s) => sum + s._count.tickets, 0);
  const completedSprints = sprints.filter(s => s.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E31837]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Sprints" subtitle="Gestión de sprints y seguimiento de tareas" />

      <div className="p-8 space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-[#8E8E93]">Sprints Completados</p>
                <p className="text-2xl font-semibold text-white">{completedSprints}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#FF3B30]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#FF3B30]" />
              </div>
              <div>
                <p className="text-sm text-[#8E8E93]">Sprints Activos</p>
                <p className="text-2xl font-semibold text-white">{activeSprints.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-[#8E8E93]">Tickets Totales</p>
                <p className="text-2xl font-semibold text-white">{totalTickets}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sprints table */}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Todos los Sprints</h3>
            <p className="text-sm text-[#8E8E93] mt-1">Vista general de todos los sprints por proyecto</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-[#0F0F0F]/50">
                  {['Sprint', 'Proyecto', 'Duración', 'Estado', 'Tickets', 'Capacidad'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-[#8E8E93] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sprints.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#8E8E93]">No hay sprints disponibles</td></tr>
                ) : sprints.map(sprint => (
                  <tr key={sprint.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0F0F0F] border border-white/10 flex items-center justify-center">
                          <CalendarClock className="w-5 h-5 text-[#FF3B30]" />
                        </div>
                        <span className="text-sm font-medium text-white">{sprint.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#8E8E93]">{sprint.projectName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#8E8E93]">
                        {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(sprint.status)}`}>
                        {statusLabel(sprint.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white font-medium">{sprint._count.tickets}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-white font-medium">{sprint.capacity}</span>
                        <span className="text-[#8E8E93]"> hrs</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
