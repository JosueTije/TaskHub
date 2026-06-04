import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { FileText, Download, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { authFetch } from '../../services/api';
import { mapRisk } from '../../utils/formatters';

interface Analytics {
  kpis: {
    progress: number;
    plannedProgress: number;
    scheduleVariance: number;
    spi: number;
    risk: string;
    blockedTickets: number;
    delayedMilestones: number;
    totalStoryPoints: number;
    completedStoryPoints: number;
  };
  progressHistory: { date: string; planned: number; actual: number }[];
}

interface Project {
  id: string;
  name: string;
  status: string;
  riskLevel: string;
  startDate: string;
  targetEndDate: string;
  pm: { fullName: string } | null;
  stats: { membersCount: number; sprintsCount: number; ticketsCount: number };
}

export function ExecutiveSummary() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.allSettled([
      authFetch<Analytics>(`/analytics/project/${id}/dashboard`),
      authFetch<{ project: Project }>(`/projects/${id}`).then(r => r.project),
    ]).then(([analyticsResult, projectResult]) => {
      if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value);
      if (projectResult.status === 'fulfilled') setProject(projectResult.value as Project | null);
    }).finally(() => setLoading(false));
  }, [id, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E31837]" />
      </div>
    );
  }

  const risk = mapRisk(analytics?.kpis.risk ?? project?.riskLevel ?? 'MEDIUM');
  const progress = analytics?.kpis.progress ?? 0;
  const sv = analytics?.kpis.scheduleVariance ?? 0;
  const delayed = analytics?.kpis.delayedMilestones ?? 0;
  const spi = analytics?.kpis.spi ?? 1;
  const totalSP = analytics?.kpis.totalStoryPoints ?? 0;
  const completedSP = analytics?.kpis.completedStoryPoints ?? 0;

  const riskTextColor = risk === 'High' || risk === 'Critical' ? 'text-[#FF3B30]' : risk === 'Medium' ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Resumen Ejecutivo" subtitle={`${project?.name ?? `Proyecto ${id}`}`} />

      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {/* AI generation note */}
        <div className="bg-gradient-to-br from-[#FF3B30]/10 to-transparent border border-[#FF3B30]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-[#FF3B30]" />
            <h3 className="text-lg font-semibold text-white">Resumen Generado Automáticamente</h3>
          </div>
          <p className="text-sm text-[#8E8E93]">
            Basado en datos reales del proyecto — sprints, tickets y métricas de progreso
          </p>
        </div>

        {/* Document */}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0F0F0F]/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8E8E93]" />
              <span className="text-sm text-[#8E8E93]">Actualizado con datos en tiempo real</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={RefreshCw} onClick={() => setRefreshKey(k => k + 1)}>
                Actualizar
              </Button>
              <Button variant="primary" icon={Download} onClick={() => window.print()}>
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Current status */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                Estado Actual del Proyecto
              </h3>
              <p className="text-[#8E8E93] leading-relaxed ml-3">
                El proyecto <span className="text-white font-medium">{project?.name ?? id}</span> se encuentra con un avance del{' '}
                <span className="text-white font-medium">{progress}%</span> sobre un total de{' '}
                <span className="text-white font-medium">{totalSP} story points</span> planificados
                ({completedSP} completados). El nivel de riesgo actual es{' '}
                <span className={`font-medium ${riskTextColor}`}>{risk}</span>
                {project?.pm ? ` bajo la gestión de ${project.pm.fullName}` : ''}.
              </p>
            </div>

            {/* Deviations */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                Desviaciones del Plan Original
              </h3>
              <div className="ml-3 space-y-4">
                <p className="text-[#8E8E93] leading-relaxed">
                  Se ha identificado una Schedule Variance de{' '}
                  <span className={`font-medium ${sv < 0 ? 'text-[#FF3B30]' : 'text-green-500'}`}>
                    {sv > 0 ? '+' : ''}{sv}%
                  </span>{' '}
                  y un SPI de{' '}
                  <span className={`font-medium ${spi < 1 ? 'text-[#FF3B30]' : 'text-green-500'}`}>{spi.toFixed(2)}</span>.
                  Esta desviación se debe principalmente a:
                </p>
                <ul className="space-y-2 pl-4">
                  {delayed > 0 && (
                    <li className="text-[#8E8E93] flex items-start gap-2">
                      <span className="text-[#FF3B30] mt-1">•</span>
                      <span><span className="text-white font-medium">{delayed} hito{delayed !== 1 ? 's' : ''}</span> no se cumplieron en las fechas planeadas</span>
                    </li>
                  )}
                  {sv < 0 && (
                    <li className="text-[#8E8E93] flex items-start gap-2">
                      <span className="text-[#FF3B30] mt-1">•</span>
                      <span>El progreso real ({progress}%) está por debajo del progreso planificado ({analytics?.kpis.plannedProgress ?? 0}%)</span>
                    </li>
                  )}
                  <li className="text-[#8E8E93] flex items-start gap-2">
                    <span className="text-[#FF3B30] mt-1">•</span>
                    <span>Dependencias técnicas que requirieron más tiempo del estimado</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Risk analysis */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                Análisis de Riesgos
              </h3>
              <div className="ml-3 grid gap-3">
                {delayed > 0 && (
                  <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-medium rounded-full">High</span>
                      <span className="text-white font-medium">Hitos Retrasados</span>
                    </div>
                    <p className="text-sm text-[#8E8E93]">
                      {delayed} hito{delayed !== 1 ? 's' : ''} crítico{delayed !== 1 ? 's' : ''} no se cumplieron en las fechas planeadas.
                    </p>
                  </div>
                )}
                <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${spi < 0.8 ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : spi < 1 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                      {spi < 0.8 ? 'High' : spi < 1 ? 'Medium' : 'Low'}
                    </span>
                    <span className="text-white font-medium">Rendimiento del Equipo (SPI: {spi.toFixed(2)})</span>
                  </div>
                  <p className="text-sm text-[#8E8E93]">
                    {spi >= 1
                      ? 'El equipo opera dentro o por encima del rendimiento esperado.'
                      : 'La velocidad actual del equipo está por debajo del objetivo.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF3B30] rounded-full"></div>
                Recomendaciones Estratégicas
              </h3>
              <div className="ml-3 space-y-3">
                {[
                  { title: '1. Replanificación del Cronograma', desc: 'Realizar una sesión con el equipo para ajustar las fechas de los hitos pendientes y establecer expectativas realistas.' },
                  { title: '2. Gestión de Bloqueadores', desc: 'Priorizar la resolución de bloqueadores técnicos y establecer un proceso de escalación para dependencias externas.' },
                  { title: '3. Optimización de Recursos', desc: 'Evaluar la posibilidad de reasignar recursos en las áreas más críticas del proyecto.' },
                  { title: '4. Comunicación con Stakeholders', desc: 'Mantener comunicación transparente con los stakeholders sobre el estado actual y los ajustes necesarios.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="bg-[#0F0F0F] border border-[#FF3B30]/20 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">{title}</h4>
                    <p className="text-sm text-[#8E8E93]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusion */}
            <div className="border-t border-white/10 pt-6">
              <p className="text-[#8E8E93] leading-relaxed">
                <span className="text-white font-medium">Conclusión:</span>{' '}
                {progress >= 80
                  ? `El proyecto muestra un avance sólido del ${progress}% con buen control de calidad. Con las acciones correctivas indicadas, el equipo puede cumplir los objetivos estratégicos establecidos.`
                  : `A pesar de las desviaciones identificadas, el proyecto mantiene un rumbo recuperable. La implementación de las recomendaciones propuestas permitirá al equipo retomar el ritmo planificado.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link to={`/project/${id}`} className="flex-1">
            <Button variant="outline" className="w-full">Volver al Proyecto</Button>
          </Link>
          <Link to={`/project/${id}/risk`} className="flex-1">
            <Button variant="secondary" className="w-full">Ver Análisis de Riesgo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
