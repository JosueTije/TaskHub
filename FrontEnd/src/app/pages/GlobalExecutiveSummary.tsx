import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { FileText, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, Folder, Target, Clock, BarChart3, Activity } from 'lucide-react';
import { projects } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
export function GlobalExecutiveSummary() {
  const {
    user
  } = useAuth();
  const role = user?.role || 'DEVELOPER';
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const filteredProjects = useMemo(() => {
    if (role === 'ADMIN') {
      return projects;
    }
    if (role === 'PM' && user.assignedProjects) {
      return projects.filter(p => user.assignedProjects?.includes(p.id));
    }
    return [];
  }, [user, role]);
  const globalKPIs = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalTickets = filteredProjects.reduce((sum, p) => sum + p.tickets.length, 0);
    const completedTickets = filteredProjects.reduce((sum, p) => sum + p.tickets.filter(t => t.status === 'Done').length, 0);
    const blockedTickets = filteredProjects.reduce((sum, p) => sum + p.blockedTickets, 0);
    const totalTeamMembers = filteredProjects.reduce((sum, p) => sum + p.team.length, 0);
    const avgProgress = filteredProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects;
    const highRiskProjects = filteredProjects.filter(p => p.risk === 'High').length;
    const delayedProjects = filteredProjects.filter(p => p.status === 'Delayed').length;
    const avgSPI = filteredProjects.reduce((sum, p) => sum + p.spi, 0) / totalProjects;
    const avgScheduleVariance = filteredProjects.reduce((sum, p) => sum + p.scheduleVariance, 0) / totalProjects;
    return {
      totalProjects,
      totalTickets,
      completedTickets,
      blockedTickets,
      totalTeamMembers,
      avgProgress: Math.round(avgProgress),
      highRiskProjects,
      delayedProjects,
      avgSPI: avgSPI.toFixed(2),
      avgScheduleVariance: Math.round(avgScheduleVariance),
      completionRate: Math.round(completedTickets / totalTickets * 100)
    };
  }, [filteredProjects]);
  const projectStatusData = useMemo(() => {
    const statusCount = filteredProjects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredProjects]);
  const riskDistributionData = useMemo(() => {
    const riskCount = filteredProjects.reduce((acc, p) => {
      acc[p.risk] = (acc[p.risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [{
      name: 'Low',
      value: riskCount['Low'] || 0,
      color: '#34C759'
    }, {
      name: 'Medium',
      value: riskCount['Medium'] || 0,
      color: '#FF9500'
    }, {
      name: 'High',
      value: riskCount['High'] || 0,
      color: '#FF3B30'
    }];
  }, [filteredProjects]);
  const progressTrendData = useMemo(() => {
    return filteredProjects.map(p => ({
      name: p.name.split(' ').slice(0, 2).join(' '),
      progress: p.progress,
      spi: parseFloat((p.spi * 100).toFixed(0))
    }));
  }, [filteredProjects]);
  const COLORS = ['#34C759', '#FF9500', '#FF3B30', '#007AFF'];
  const handleExportPDF = () => {
    console.log('Exporting global summary to PDF...');
  };
  return <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Resumen Ejecutivo Global" subtitle={user.role === 'ADMIN' ? 'Vista consolidada de todos los proyectos' : 'Vista consolidada de tus proyectos asignados'} />
      
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'all'] as const).map(filter => <button key={filter} onClick={() => setTimeFilter(filter)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeFilter === filter ? 'bg-[#FF3B30] text-white' : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-white/10'}`}>
                {filter === 'week' ? 'Esta Semana' : filter === 'month' ? 'Este Mes' : filter === 'quarter' ? 'Este Trimestre' : 'Histórico'}
              </button>)}
          </div>
          <Button variant="primary" icon={Download} onClick={handleExportPDF}>
            Exportar Reporte
          </Button>
        </div>

        {}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Folder className="w-5 h-5 text-blue-500" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{globalKPIs.totalProjects}</p>
            <p className="text-xs text-[#8E8E93]">Proyectos Activos</p>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-purple-500" />
              <span className={`text-xs font-medium ${globalKPIs.avgProgress >= 70 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
                {globalKPIs.avgProgress}%
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{globalKPIs.completionRate}%</p>
            <p className="text-xs text-[#8E8E93]">Tasa de Completitud</p>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
              <span className="text-xs font-medium text-[#FF3B30]">{globalKPIs.blockedTickets}</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{globalKPIs.highRiskProjects}</p>
            <p className="text-xs text-[#8E8E93]">Proyectos Alto Riesgo</p>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-green-500" />
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{globalKPIs.totalTeamMembers}</p>
            <p className="text-xs text-[#8E8E93]">Miembros del Equipo</p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{globalKPIs.totalTickets}</p>
                <p className="text-xs text-[#8E8E93]">Tickets Totales</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-500 font-medium">{globalKPIs.completedTickets} completados</span>
              <span className="text-[#8E8E93]">•</span>
              <span className="text-[#FF3B30] font-medium">{globalKPIs.blockedTickets} bloqueados</span>
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{globalKPIs.avgSPI}</p>
                <p className="text-xs text-[#8E8E93]">SPI Promedio</p>
              </div>
            </div>
            <p className="text-xs text-[#8E8E93]">
              {parseFloat(globalKPIs.avgSPI) >= 1 ? 'Por encima del cronograma' : 'Por debajo del cronograma'}
            </p>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${globalKPIs.avgScheduleVariance < 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>
                  {globalKPIs.avgScheduleVariance > 0 ? '+' : ''}{globalKPIs.avgScheduleVariance}%
                </p>
                <p className="text-xs text-[#8E8E93]">Variación de Cronograma</p>
              </div>
            </div>
            <p className="text-xs text-[#8E8E93]">
              {globalKPIs.delayedProjects} proyecto{globalKPIs.delayedProjects !== 1 ? 's' : ''} retrasado{globalKPIs.delayedProjects !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 gap-6">
          {}
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
              <h3 className="text-lg font-semibold text-white">Distribución por Estado</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" labelLine={false} label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {projectStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{
                backgroundColor: '#1C1C1E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }} labelStyle={{
                color: '#fff'
              }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {}
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
              <h3 className="text-lg font-semibold text-white">Distribución de Riesgo</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#8E8E93" />
                <YAxis stroke="#8E8E93" />
                <Tooltip contentStyle={{
                backgroundColor: '#1C1C1E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }} labelStyle={{
                color: '#fff'
              }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {riskDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">Progreso y SPI por Proyecto</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#8E8E93" />
              <YAxis stroke="#8E8E93" />
              <Tooltip contentStyle={{
              backgroundColor: '#1C1C1E',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }} labelStyle={{
              color: '#fff'
            }} />
              <Legend />
              <Line type="monotone" dataKey="progress" stroke="#007AFF" strokeWidth={2} name="Progreso %" />
              <Line type="monotone" dataKey="spi" stroke="#34C759" strokeWidth={2} name="SPI %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
              <h3 className="text-lg font-semibold text-white">Detalle de Proyectos</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F0F0F]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#8E8E93]">Proyecto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#8E8E93]">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#8E8E93]">Progreso</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#8E8E93]">Riesgo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#8E8E93]">SPI</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#8E8E93]">Tickets</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#8E8E93]">Equipo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#8E8E93]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredProjects.map(project => <tr key={project.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <p className="text-xs text-[#8E8E93]">{project.manager}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${project.status === 'On Track' ? 'bg-green-500/10 text-green-500' : project.status === 'Active' ? 'bg-blue-500/10 text-blue-500' : project.status === 'Delayed' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-[#8E8E93]/10 text-[#8E8E93]'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#0F0F0F] rounded-full h-2 max-w-[100px]">
                          <div className="bg-[#FF3B30] h-2 rounded-full transition-all" style={{
                        width: `${project.progress}%`
                      }} />
                        </div>
                        <span className="text-sm text-white font-medium">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${project.risk === 'High' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : project.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                        {project.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${project.spi >= 1 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
                        {project.spi.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-white font-medium">{project.tickets.filter(t => t.status === 'Done').length}</span>
                        <span className="text-[#8E8E93]">/{project.tickets.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, idx) => <div key={idx} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF3B30] to-[#FF6B30] flex items-center justify-center text-xs font-bold text-white border-2 border-[#1C1C1E]">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>)}
                        {project.team.length > 3 && <div className="w-8 h-8 rounded-full bg-[#0F0F0F] border-2 border-[#1C1C1E] flex items-center justify-center text-xs text-[#8E8E93]">
                            +{project.team.length - 3}
                          </div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/project/${project.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalle
                        </Button>
                      </Link>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">Resumen Ejecutivo</h3>
          </div>
          <div className="space-y-4 text-[#8E8E93] leading-relaxed">
            <p>
              La organización cuenta actualmente con <span className="text-white font-medium">{globalKPIs.totalProjects} proyectos activos</span> gestionados 
              por <span className="text-white font-medium">{globalKPIs.totalTeamMembers} miembros del equipo</span>. El progreso promedio de los proyectos 
              es del <span className="text-white font-medium">{globalKPIs.avgProgress}%</span>, con una tasa de completitud general 
              del <span className="text-white font-medium">{globalKPIs.completionRate}%</span>.
            </p>
            <p>
              Se identifican <span className={`font-medium ${globalKPIs.highRiskProjects > 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>
              {globalKPIs.highRiskProjects} proyecto{globalKPIs.highRiskProjects !== 1 ? 's' : ''} con riesgo alto</span> que 
              requieren atención inmediata, y <span className={`font-medium ${globalKPIs.delayedProjects > 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>
              {globalKPIs.delayedProjects} proyecto{globalKPIs.delayedProjects !== 1 ? 's' : ''} retrasado{globalKPIs.delayedProjects !== 1 ? 's' : ''}</span> respecto 
              al cronograma planificado. El Schedule Performance Index (SPI) promedio es de <span className={`font-medium ${parseFloat(globalKPIs.avgSPI) >= 1 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
              {globalKPIs.avgSPI}</span>, indicando que la organización está {parseFloat(globalKPIs.avgSPI) >= 1 ? 'por encima' : 'por debajo'} del rendimiento esperado.
            </p>
            <p>
              Actualmente existen <span className="text-white font-medium">{globalKPIs.blockedTickets} tickets bloqueados</span> que 
              están impactando la velocidad de desarrollo. Se recomienda priorizar la resolución de estos bloqueadores para 
              optimizar el flujo de trabajo y mejorar la productividad general del equipo.
            </p>
          </div>
        </div>

        {}
        <div className="flex gap-4">
          <Link to="/projects" className="flex-1">
            <Button variant="outline" className="w-full">
              Ver Todos los Proyectos
            </Button>
          </Link>
          <Link to="/metrics" className="flex-1">
            <Button variant="secondary" className="w-full">
              Ver Métricas Detalladas
            </Button>
          </Link>
        </div>
      </div>
    </div>;
}