import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Trophy, Award, TrendingUp, ArrowLeft, Crown, Zap, CheckCircle2, Target, AlertTriangle, Clock, Flame, Star, Medal, BarChart3 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
const projectData = {
  '1': {
    name: 'E-commerce Platform',
    totalScore: 8950,
    developers: [{
      id: '1',
      name: 'Carlos Mendoza',
      avatar: '👨‍💻',
      totalPoints: 1850,
      highPriorityTickets: 24,
      estimationAccuracy: 94,
      blockersResolved: 8,
      position: 1,
      badge: 'Legend',
      currentSprintPoints: 420,
      sprintCompletion: 96,
      streak: 15
    }, {
      id: '2',
      name: 'María González',
      avatar: '👩‍💼',
      totalPoints: 1620,
      highPriorityTickets: 20,
      estimationAccuracy: 91,
      blockersResolved: 6,
      position: 2,
      badge: 'Master',
      currentSprintPoints: 380,
      sprintCompletion: 92,
      streak: 12
    }, {
      id: '3',
      name: 'Sofia Torres',
      avatar: '👩‍🎨',
      totalPoints: 1480,
      highPriorityTickets: 18,
      estimationAccuracy: 89,
      blockersResolved: 5,
      position: 3,
      badge: 'Expert',
      currentSprintPoints: 350,
      sprintCompletion: 88,
      streak: 10
    }, {
      id: '4',
      name: 'Diego Morales',
      avatar: '🧑‍💻',
      totalPoints: 1320,
      highPriorityTickets: 16,
      estimationAccuracy: 86,
      blockersResolved: 4,
      position: 4,
      badge: 'Pro',
      currentSprintPoints: 310,
      sprintCompletion: 85,
      streak: 8
    }, {
      id: '5',
      name: 'Andrea López',
      avatar: '👩‍🔧',
      totalPoints: 1180,
      highPriorityTickets: 14,
      estimationAccuracy: 84,
      blockersResolved: 3,
      position: 5,
      badge: 'Pro',
      currentSprintPoints: 280,
      sprintCompletion: 82,
      streak: 6
    }]
  }
};
const sprintWinner = {
  name: 'Carlos Mendoza',
  avatar: '👨‍💻',
  points: 420,
  completion: 96,
  sprintName: 'Sprint 12'
};
const pointsSystem = [{
  action: 'Ticket Alta Prioridad',
  points: 20,
  type: 'positive'
}, {
  action: 'Ticket Media Prioridad',
  points: 10,
  type: 'positive'
}, {
  action: 'Ticket Baja Prioridad',
  points: 5,
  type: 'positive'
}, {
  action: 'Completar antes de estimación',
  points: '+15',
  type: 'bonus'
}, {
  action: 'Resolver bloqueador crítico',
  points: '+25',
  type: 'bonus'
}, {
  action: 'Ticket reabierto',
  points: '-10',
  type: 'penalty'
}, {
  action: 'Retraso en entrega',
  points: '-15',
  type: 'penalty'
}];
const developerEvolution = {
  weekly: [{
    week: 'Sem 1',
    points: 280,
    tickets: 12
  }, {
    week: 'Sem 2',
    points: 340,
    tickets: 15
  }, {
    week: 'Sem 3',
    points: 380,
    tickets: 17
  }, {
    week: 'Sem 4',
    points: 420,
    tickets: 18
  }],
  consistency: 92,
  trend: 'up'
};
export function ProjectGamification() {
  const {
    id
  } = useParams();
  const project = projectData[id as keyof typeof projectData] || projectData['1'];
  const [selectedDeveloper, setSelectedDeveloper] = useState<string | null>(null);
  const winner = project.developers[0];
  const selectedDev = project.developers.find(d => d.id === selectedDeveloper);
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Legend':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'Master':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Expert':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'Pro':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };
  return <div className="min-h-screen bg-[#0F0F0F]">
      {}
      <div className="border-b border-white/10 bg-[#0F0F0F] sticky top-0 z-10">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link to="/gamification" className="inline-flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors mb-3">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver a Global</span>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{project.name}</h1>
              <p className="text-sm text-[#8E8E93]">Gamificación del proyecto</p>
            </div>
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-[#8E8E93] mb-1">Score Total del Proyecto</p>
              <p className="text-3xl font-bold text-white">{project.totalScore.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#FF3B30]" />
              Ganador General del Proyecto
            </h2>
            <div className="bg-gradient-to-br from-yellow-500/10 to-[#1C1C1E] border border-yellow-500/30 rounded-xl p-6 backdrop-blur-xl shadow-lg shadow-yellow-500/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#0F0F0F] border-2 border-yellow-500 flex items-center justify-center text-4xl">
                    {winner.avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{winner.name}</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getBadgeColor(winner.badge)}`}>
                    {winner.badge}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white mb-1">{winner.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-[#8E8E93]">Puntos Totales</p>
                </div>
                <div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <p className="text-2xl font-bold text-white">{winner.streak}</p>
                  </div>
                  <p className="text-xs text-[#8E8E93]">Días Streak</p>
                </div>
              </div>
            </div>
          </section>

          {}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FF3B30]" />
              Ganador del Sprint Actual
            </h2>
            <div className="bg-gradient-to-br from-[#FF3B30]/10 to-[#1C1C1E] border border-[#FF3B30]/30 rounded-xl p-6 backdrop-blur-xl shadow-lg shadow-[#FF3B30]/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#0F0F0F] border-2 border-[#FF3B30] flex items-center justify-center text-4xl">
                    {sprintWinner.avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-[#FF3B30] rounded-full p-1.5">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{sprintWinner.name}</h3>
                  <Badge variant="danger" className="text-xs">{sprintWinner.sprintName}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white mb-1">{sprintWinner.points}</p>
                  <p className="text-xs text-[#8E8E93]">Puntos del Sprint</p>
                </div>
                <div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white mb-1">{sprintWinner.completion}%</p>
                  <p className="text-xs text-[#8E8E93]">% Cumplimiento</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {}
        <section>
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF3B30]" />
            Ranking Interno del Proyecto
          </h2>
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
            {}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 bg-[#0F0F0F]/50">
              <div className="col-span-1 text-xs font-semibold text-[#8E8E93]">#</div>
              <div className="col-span-3 text-xs font-semibold text-[#8E8E93]">Developer</div>
              <div className="col-span-2 text-xs font-semibold text-[#8E8E93] text-right">Puntos</div>
              <div className="col-span-2 text-xs font-semibold text-[#8E8E93] text-right">Alta Prioridad</div>
              <div className="col-span-2 text-xs font-semibold text-[#8E8E93] text-right">% Estimación</div>
              <div className="col-span-2 text-xs font-semibold text-[#8E8E93] text-right">Bloqueadores</div>
            </div>

            {}
            <div className="divide-y divide-white/5">
              {project.developers.map(dev => <div key={dev.id} onClick={() => setSelectedDeveloper(dev.id === selectedDeveloper ? null : dev.id)} className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#0F0F0F]/50 transition-all cursor-pointer ${selectedDeveloper === dev.id ? 'bg-[#FF3B30]/5 border-l-2 border-[#FF3B30]' : ''}`}>
                  <div className="col-span-1 flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${dev.position === 1 ? 'bg-yellow-500/20 text-yellow-500' : dev.position === 2 ? 'bg-gray-400/20 text-gray-400' : dev.position === 3 ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-[#8E8E93]'}`}>
                      {dev.position}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F0F0F] border border-white/10 flex items-center justify-center text-xl">
                      {dev.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {dev.name}
                      </p>
                      <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white mt-1 ${getBadgeColor(dev.badge)}`}>
                        {dev.badge}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <p className="text-sm font-semibold text-white">{dev.totalPoints.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Badge variant="default">{dev.highPriorityTickets}</Badge>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${dev.estimationAccuracy >= 90 ? 'text-green-500' : dev.estimationAccuracy >= 80 ? 'text-yellow-500' : 'text-[#FF3B30]'}`}>
                        {dev.estimationAccuracy}%
                      </span>
                      {dev.estimationAccuracy >= 90 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Badge variant={dev.blockersResolved > 5 ? 'danger' : 'default'}>
                      {dev.blockersResolved}
                    </Badge>
                  </div>
                </div>)}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FF3B30]" />
              Sistema de Puntos
            </h2>
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
              <div className="space-y-3">
                {pointsSystem.map((item, index) => <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${item.type === 'positive' ? 'bg-blue-500/5 border border-blue-500/20' : item.type === 'bonus' ? 'bg-green-500/5 border border-green-500/20' : 'bg-[#FF3B30]/5 border border-[#FF3B30]/20'}`}>
                    <div className="flex items-center gap-3">
                      {item.type === 'positive' && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                      {item.type === 'bonus' && <Star className="w-5 h-5 text-green-500" />}
                      {item.type === 'penalty' && <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />}
                      <span className="text-sm text-white">{item.action}</span>
                    </div>
                    <span className={`text-lg font-bold ${item.type === 'positive' ? 'text-blue-500' : item.type === 'bonus' ? 'text-green-500' : 'text-[#FF3B30]'}`}>
                      {item.points}
                    </span>
                  </div>)}
              </div>
            </div>
          </section>

          {}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF3B30]" />
              Evolución Individual
            </h2>
            {selectedDev ? <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                  <div className="w-12 h-12 rounded-full bg-[#0F0F0F] border border-white/10 flex items-center justify-center text-2xl">
                    {selectedDev.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedDev.name}</p>
                    <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white mt-1 ${getBadgeColor(selectedDev.badge)}`}>
                      {selectedDev.badge}
                    </div>
                  </div>
                </div>

                {}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-3">
                    <p className="text-lg font-bold text-white mb-1">{developerEvolution.consistency}%</p>
                    <p className="text-xs text-[#8E8E93]">Consistencia</p>
                  </div>
                  <div className="bg-[#0F0F0F]/50 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <p className="text-lg font-bold text-green-500">Alza</p>
                    </div>
                    <p className="text-xs text-[#8E8E93]">Tendencia</p>
                  </div>
                </div>

                {}
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={developerEvolution.weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="#8E8E93" tick={{
                  fill: '#8E8E93',
                  fontSize: 10
                }} />
                    <YAxis stroke="#8E8E93" tick={{
                  fill: '#8E8E93',
                  fontSize: 10
                }} />
                    <Tooltip contentStyle={{
                  backgroundColor: '#0F0F0F',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px'
                }} />
                    <Line type="monotone" dataKey="points" stroke="#FF3B30" strokeWidth={3} dot={{
                  fill: '#FF3B30',
                  r: 4
                }} name="Puntos" />
                  </LineChart>
                </ResponsiveContainer>

                {}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm font-semibold text-white mb-4">Tickets cerrados por sprint</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={developerEvolution.weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="week" stroke="#8E8E93" tick={{
                    fill: '#8E8E93',
                    fontSize: 10
                  }} />
                      <YAxis stroke="#8E8E93" tick={{
                    fill: '#8E8E93',
                    fontSize: 10
                  }} />
                      <Tooltip contentStyle={{
                    backgroundColor: '#0F0F0F',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }} />
                      <Bar dataKey="tickets" fill="#007AFF" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div> : <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-12 backdrop-blur-xl text-center">
                <Trophy className="w-12 h-12 text-[#8E8E93] mx-auto mb-4" />
                <p className="text-sm text-[#8E8E93]">
                  Selecciona un developer del ranking para ver su evolución individual
                </p>
              </div>}
          </section>
        </div>
      </div>
    </div>;
}