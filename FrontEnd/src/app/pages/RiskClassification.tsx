import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { AlertTriangle, Clock, TrendingDown, FileText, ChevronRight, Loader2 } from 'lucide-react';
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
  };
}

interface Project {
  id: string;
  name: string;
  riskLevel: string;
}

export function RiskClassification() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.allSettled([
      authFetch<Analytics>(`/analytics/project/${id}/dashboard`),
      authFetch<{ project: Project }>(`/projects/${id}`).catch(() => null),
    ]).then(([analyticsResult, projectResult]) => {
      if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value);
      if (projectResult.status === 'fulfilled' && projectResult.value) {
        setProject((projectResult.value as any)?.project ?? null);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E31837]" />
      </div>
    );
  }

  const risk = mapRisk(analytics?.kpis.risk ?? 'MEDIUM');
  const sv = analytics?.kpis.scheduleVariance ?? 0;
  const delayed = analytics?.kpis.delayedMilestones ?? 0;
  const blocked = analytics?.kpis.blockedTickets ?? 0;
  const spi = analytics?.kpis.spi ?? 1;

  const riskColor = risk === 'High' || risk === 'Critical'
    ? { text: 'text-[#FF3B30]', bg: 'bg-[#FF3B30]/10', border: 'border-[#FF3B30]/30', icon: 'bg-[#FF3B30]/20' }
    : risk === 'Medium'
    ? { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'bg-yellow-500/20' }
    : { text: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'bg-green-500/20' };

  const riskFactors = [
    {
      factor: 'Hitos Retrasados',
      impact: delayed >= 3 ? 'High' : delayed >= 1 ? 'Medium' : 'Low',
      value: `${delayed} hitos`,
      description: delayed > 0
        ? 'Hitos críticos que no se cumplieron en las fechas planeadas'
        : 'Sin hitos retrasados — el proyecto está dentro del cronograma',
    },
    {
      factor: 'Schedule Variance',
      impact: sv < -10 ? 'High' : sv < 0 ? 'Medium' : 'Low',
      value: `${sv > 0 ? '+' : ''}${sv}%`,
      description: sv < 0
        ? 'El proyecto está por detrás del cronograma planificado'
        : 'El proyecto está al día o adelantado respecto al cronograma',
    },
    {
      factor: 'Schedule Performance Index (SPI)',
      impact: spi < 0.8 ? 'High' : spi < 1 ? 'Medium' : 'Low',
      value: spi.toFixed(2),
      description: spi < 1
        ? 'El equipo está por debajo de la velocidad objetivo'
        : 'El equipo opera dentro del rendimiento esperado',
    },
    {
      factor: 'Tickets Bloqueados',
      impact: blocked >= 3 ? 'High' : blocked >= 1 ? 'Medium' : 'Low',
      value: `${blocked} tickets`,
      description: blocked > 0
        ? 'Elementos bloqueados que impactan el flujo de trabajo'
        : 'Sin tickets bloqueados actualmente',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Clasificación de Riesgo" subtitle={project?.name ?? `Proyecto ${id}`} />

      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {/* Risk level card */}
        <div className={`border rounded-xl p-8 bg-gradient-to-br from-${riskColor.bg} to-transparent ${riskColor.border}`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${riskColor.icon}`}>
                <AlertTriangle className={`w-8 h-8 ${riskColor.text}`} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Nivel de Riesgo: {risk}</h2>
                <p className="text-[#8E8E93] mt-1">Calculado automáticamente a partir de métricas del proyecto</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-1 h-full ${riskColor.text.replace('text-', 'bg-')} rounded-full`}></div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Análisis Automático</h3>
                <p className="text-[#8E8E93] leading-relaxed">
                  El proyecto presenta{' '}
                  <span className={`${riskColor.text} font-medium`}>{delayed} hitos retrasados</span> y una variación{' '}
                  <span className={`${sv < 0 ? riskColor.text : 'text-green-500'} font-medium`}>
                    {sv < 0 ? 'negativa' : 'positiva'}
                  </span>{' '}
                  del cronograma de{' '}
                  <span className={`${sv < 0 ? riskColor.text : 'text-green-500'} font-medium`}>{Math.abs(sv)}%</span>.{' '}
                  El SPI es{' '}
                  <span className={`${spi < 1 ? riskColor.text : 'text-green-500'} font-medium`}>{spi.toFixed(2)}</span>
                  {spi < 1 ? ', indicando rendimiento por debajo del objetivo' : ', indicando buen rendimiento'}.{' '}
                  {blocked > 0 && (
                    <>Hay <span className={`${riskColor.text} font-medium`}>{blocked} tickets bloqueados</span> que requieren atención.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk factors */}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Factores de Riesgo</h3>
          <div className="space-y-3">
            {riskFactors.map((factor) => (
              <div key={factor.factor} className="p-4 bg-[#0F0F0F] border border-white/10 rounded-lg hover:border-white/20 transition-all">
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        factor.impact === 'High' ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                          : factor.impact === 'Medium' ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {factor.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recomendaciones</h3>
          <ul className="space-y-3">
            {[
              'Revisar y ajustar el cronograma de los próximos sprints',
              'Identificar y resolver los bloqueadores con alta prioridad',
              'Considerar reasignar recursos para mejorar la velocidad',
              'Programar revisión de hitos con el equipo',
            ].map(rec => (
              <li key={rec} className="flex items-start gap-3 p-3 bg-[#0F0F0F] border border-white/10 rounded-lg">
                <ChevronRight className="w-4 h-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#8E8E93]">{rec}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link to={`/project/${id}`} className="flex-1">
            <Button variant="outline" className="w-full">Volver al Proyecto</Button>
          </Link>
          <Link to={`/project/${id}/summary`} className="flex-1">
            <Button variant="primary" icon={FileText} className="w-full">Generar Resumen Ejecutivo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
