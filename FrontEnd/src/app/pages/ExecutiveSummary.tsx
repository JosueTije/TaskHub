import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { FileText, Download, RefreshCw, Edit3, Sparkles } from 'lucide-react';
import { projects } from '../data/mockData';
export function ExecutiveSummary() {
  const {
    id
  } = useParams();
  const project = projects.find(p => p.id === id) || projects[0];
  const [isRegenerating, setIsRegenerating] = useState(false);
  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), 2000);
  };
  const handleExportPDF = () => {
    console.log('Exporting to PDF...');
  };
  return <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Resumen Ejecutivo" subtitle={`${project.name} - Generado con IA`} />
      
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {}
        <div className="bg-gradient-to-br from-[#FF3B30]/10 to-transparent border border-[#FF3B30]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-[#FF3B30]" />
            <h3 className="text-lg font-semibold text-white">Resumen Generado Automáticamente</h3>
          </div>
          <p className="text-sm text-[#8E8E93]">
            Este resumen ha sido generado usando inteligencia artificial basándose en los datos del proyecto
          </p>
        </div>

        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden">
          {}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0F0F0F]/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8E8E93]" />
              <span className="text-sm text-[#8E8E93]">Última actualización: Hace 5 minutos</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={RefreshCw} onClick={handleRegenerate} className={isRegenerating ? 'animate-spin' : ''}>
                Regenerar
              </Button>
              <Button variant="secondary" icon={Edit3}>
                Editar
              </Button>
              <Button variant="primary" icon={Download} onClick={handleExportPDF}>
                Exportar PDF
              </Button>
            </div>
          </div>

          {}
          <div className="p-8 space-y-8">
            {}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                Estado Actual del Proyecto
              </h3>
              <p className="text-[#8E8E93] leading-relaxed ml-3">
                El proyecto <span className="text-white font-medium">{project.name}</span> se encuentra actualmente 
                con un avance del <span className="text-white font-medium">{project.progress}%</span>, mostrando 
                un progreso significativo hacia los objetivos establecidos. El equipo ha completado exitosamente 
                {' '}<span className="text-white font-medium">{project.milestones.filter(m => m.status === 'Completed').length} de {project.milestones.length}</span> hitos 
                planeados. El proyecto está clasificado con un nivel de riesgo{' '}
                <span className={`font-medium ${project.risk === 'High' ? 'text-[#FF3B30]' : 'text-white'}`}>{project.risk}</span>, 
                requiriendo atención especial en las próximas iteraciones.
              </p>
            </div>

            {}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                Desviaciones del Plan Original
              </h3>
              <div className="ml-3 space-y-4">
                <p className="text-[#8E8E93] leading-relaxed">
                  Se ha identificado una variación del cronograma (Schedule Variance) de{' '}
                  <span className={`font-medium ${project.scheduleVariance < 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>
                    {project.scheduleVariance}%
                  </span>. Esta desviación se debe principalmente a:
                </p>
                <ul className="space-y-2 pl-4">
                  <li className="text-[#8E8E93] flex items-start gap-2">
                    <span className="text-[#FF3B30] mt-1">•</span>
                    <span>Retrasos en la implementación de funcionalidades core que impactaron el cronograma general</span>
                  </li>
                  <li className="text-[#8E8E93] flex items-start gap-2">
                    <span className="text-[#FF3B30] mt-1">•</span>
                    <span>Dependencias técnicas externas que requirieron más tiempo del estimado</span>
                  </li>
                  <li className="text-[#8E8E93] flex items-start gap-2">
                    <span className="text-[#FF3B30] mt-1">•</span>
                    <span>Cambios de alcance solicitados por stakeholders durante el desarrollo</span>
                  </li>
                </ul>
              </div>
            </div>

            {}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                Análisis de Riesgos
              </h3>
              <div className="ml-3 space-y-4">
                <p className="text-[#8E8E93] leading-relaxed">
                  El proyecto presenta los siguientes riesgos que deben ser monitoreados:
                </p>
                <div className="grid gap-3">
                  <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-medium rounded-full">
                        High
                      </span>
                      <span className="text-white font-medium">Hitos Retrasados</span>
                    </div>
                    <p className="text-sm text-[#8E8E93]">
                      {project.delayedMilestones} hitos críticos no se cumplieron en las fechas planeadas, 
                      lo que podría afectar la fecha de entrega final.
                    </p>
                  </div>
                  <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full">
                        Medium
                      </span>
                      <span className="text-white font-medium">Capacidad del Equipo</span>
                    </div>
                    <p className="text-sm text-[#8E8E93]">
                      La velocidad actual del equipo está por debajo del objetivo, lo que requiere 
                      optimización de procesos o recursos adicionales.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                Recomendaciones Estratégicas
              </h3>
              <div className="ml-3 space-y-3">
                <div className="bg-[#0F0F0F] border border-[#FF3B30]/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">1. Replanificación del Cronograma</h4>
                  <p className="text-sm text-[#8E8E93]">
                    Se recomienda realizar una sesión de replanificación con el equipo para ajustar 
                    las fechas de los hitos pendientes y establecer expectativas realistas.
                  </p>
                </div>
                <div className="bg-[#0F0F0F] border border-[#FF3B30]/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">2. Gestión de Bloqueadores</h4>
                  <p className="text-sm text-[#8E8E93]">
                    Priorizar la resolución de bloqueadores técnicos identificados y establecer un 
                    proceso de escalación para dependencias externas.
                  </p>
                </div>
                <div className="bg-[#0F0F0F] border border-[#FF3B30]/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">3. Optimización de Recursos</h4>
                  <p className="text-sm text-[#8E8E93]">
                    Evaluar la posibilidad de reasignar recursos del equipo o incorporar apoyo 
                    adicional en las áreas más críticas del proyecto.
                  </p>
                </div>
                <div className="bg-[#0F0F0F] border border-[#FF3B30]/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">4. Comunicación con Stakeholders</h4>
                  <p className="text-sm text-[#8E8E93]">
                    Mantener comunicación transparente con los stakeholders sobre el estado actual 
                    y los ajustes necesarios para garantizar el éxito del proyecto.
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="border-t border-white/10 pt-6">
              <p className="text-[#8E8E93] leading-relaxed">
                <span className="text-white font-medium">Conclusión:</span> A pesar de las desviaciones 
                identificadas, el proyecto mantiene un rumbo recuperable con las acciones correctivas 
                apropiadas. La implementación de las recomendaciones propuestas y el monitoreo continuo 
                de los indicadores clave permitirá al equipo retomar el ritmo planeado y cumplir con 
                los objetivos estratégicos establecidos.
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="flex gap-4">
          <Link to={`/project/${id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Volver al Proyecto
            </Button>
          </Link>
          <Link to={`/project/${id}/risk`} className="flex-1">
            <Button variant="secondary" className="w-full">
              Ver Análisis de Riesgo
            </Button>
          </Link>
        </div>
      </div>
    </div>;
}