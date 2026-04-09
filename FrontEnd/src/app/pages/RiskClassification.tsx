import { useParams, Link } from 'react-router';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { AlertTriangle, Clock, TrendingDown, FileText, ChevronRight } from 'lucide-react';
import { projects } from '../data/mockData';
export function RiskClassification() {
  const {
    id
  } = useParams();
  const project = projects.find(p => p.id === id) || projects[0];
  const riskFactors = [{
    factor: 'Hitos Retrasados',
    impact: 'High',
    value: `${project.delayedMilestones} milestones`,
    description: 'Múltiples hitos no se cumplieron en las fechas planeadas'
  }, {
    factor: 'Schedule Variance',
    impact: project.scheduleVariance < -5 ? 'High' : 'Medium',
    value: `${project.scheduleVariance}%`,
    description: 'Desviación significativa del cronograma planeado'
  }, {
    factor: 'Velocidad del Equipo',
    impact: 'Medium',
    value: '72%',
    description: 'El equipo está operando por debajo de la capacidad ideal'
  }, {
    factor: 'Dependencias Bloqueadas',
    impact: 'Low',
    value: '2 bloqueadores',
    description: 'Algunos elementos están esperando recursos externos'
  }];
  return <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Clasificación de Riesgo IA" subtitle={project.name} />
      
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {}
        <div className={`border rounded-xl p-8 ${project.risk === 'High' ? 'bg-gradient-to-br from-[#FF3B30]/10 to-transparent border-[#FF3B30]/30' : project.risk === 'Medium' ? 'bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30' : 'bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30'}`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${project.risk === 'High' ? 'bg-[#FF3B30]/20' : project.risk === 'Medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                <AlertTriangle className={`w-8 h-8 ${project.risk === 'High' ? 'text-[#FF3B30]' : project.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Nivel de Riesgo: {project.risk}</h2>
                <p className="text-[#8E8E93] mt-1">Análisis automático generado por IA</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-1 h-full bg-[#FF3B30] rounded-full"></div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Análisis Automático</h3>
                <p className="text-[#8E8E93] leading-relaxed">
                  El proyecto presenta <span className="text-[#FF3B30] font-medium">{project.delayedMilestones} hitos retrasados</span> y 
                  una variación <span className="text-[#FF3B30] font-medium">{project.scheduleVariance < 0 ? 'negativa' : 'positiva'}</span> del 
                  cronograma de <span className="text-[#FF3B30] font-medium">{Math.abs(project.scheduleVariance)}%</span>. 
                  La velocidad del equipo está por debajo del nivel óptimo y existen dependencias bloqueadas que podrían 
                  impactar la entrega. Se recomienda atención inmediata del Project Manager para ajustar el plan y 
                  mitigar los riesgos identificados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Factores de Riesgo</h3>
          <div className="space-y-3">
            {riskFactors.map((factor, index) => <div key={index} className="p-4 bg-[#0F0F0F] border border-white/10 rounded-lg hover:border-white/20 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {factor.impact === 'High' && <Clock className="w-4 h-4 text-[#FF3B30]" />}
                      {factor.impact === 'Medium' && <TrendingDown className="w-4 h-4 text-yellow-500" />}
                      {factor.impact === 'Low' && <AlertTriangle className="w-4 h-4 text-green-500" />}
                      <h4 className="text-sm font-medium text-white">{factor.factor}</h4>
                    </div>
                    <p className="text-xs text-[#8E8E93] mb-2">{factor.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white font-medium">{factor.value}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${factor.impact === 'High' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : factor.impact === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                        {factor.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recomendaciones</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 p-3 bg-[#0F0F0F] border border-white/10 rounded-lg">
              <ChevronRight className="w-4 h-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#8E8E93]">Revisar y ajustar el cronograma de los próximos sprints</p>
            </li>
            <li className="flex items-start gap-3 p-3 bg-[#0F0F0F] border border-white/10 rounded-lg">
              <ChevronRight className="w-4 h-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#8E8E93]">Identificar y resolver los bloqueadores con alta prioridad</p>
            </li>
            <li className="flex items-start gap-3 p-3 bg-[#0F0F0F] border border-white/10 rounded-lg">
              <ChevronRight className="w-4 h-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#8E8E93]">Considerar reasignar recursos para mejorar la velocidad</p>
            </li>
            <li className="flex items-start gap-3 p-3 bg-[#0F0F0F] border border-white/10 rounded-lg">
              <ChevronRight className="w-4 h-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#8E8E93]">Programar revisión de milestones con el equipo</p>
            </li>
          </ul>
        </div>

        {}
        <div className="flex gap-4">
          <Link to={`/project/${id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Volver al Proyecto
            </Button>
          </Link>
          <Link to={`/project/${id}/summary`} className="flex-1">
            <Button variant="primary" icon={FileText} className="w-full">
              Generar Resumen Ejecutivo
            </Button>
          </Link>
        </div>
      </div>
    </div>;
}