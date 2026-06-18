import { Award, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'motion/react';

//Tipos
interface ScoreBreakdownItem {
  label: string;
  weight: number;
  score: number;
  weighted: number;
}

interface ProjectScoreData {
  value: number;
  maxValue: number;
  classification: string;
  color: string;
  breakdown: Record<string, ScoreBreakdownItem>;
  strengths: string[];
  improvements: string[];
  critical: string[];
}

//Datos harcodeados
export const PROJECT_SCORE: ProjectScoreData = {
  value:          68,
  maxValue:       100,
  classification: 'En Riesgo',  
  color:          '#FF3B30',

  //Criterio 2 — pesos
  breakdown: {
    avance: {
      label:    'Avance',
      weight:   0.30,
      score:    68,
      weighted: 20,
    },
    cumplimiento: {
      label:    'Cumplimiento',
      weight:   0.25,
      score:    58,
      weighted: 15,
    },
    calidad: {
      label:    'Calidad',
      weight:   0.20,
      score:    80,
      weighted: 16,
    },
    equipo: {
      label:    'Equipo',
      weight:   0.15,
      score:    75,
      weighted: 11,
    },
    riesgo: {
      label:    'Gestión de Riesgo',
      weight:   0.10,
      score:    60,
      weighted:  6,
    },
  },

  //Criterio 3 — desglose
  strengths: [
    'Calidad de entregables por encima del umbral aceptado',
    'Equipo con alta tasa de resolución de tickets',
    'Velocidad de sprint estable en últimas 3 iteraciones',
    'Baja deuda técnica acumulada en el módulo actual',
  ],
  improvements: [
    'Estimación de horas con varianza del 18% vs real',
    'Ciclo de revisión de PR por encima de 24h en promedio',
  ],
  critical: [
    '3 milestones retrasados sin plan de mitigación activo',
    'SPI < 0.9 por segundo sprint consecutivo',
    'Bloqueadores sin resolver por más de 5 días hábiles',
  ],
};

//Colores
function dimensionColor(score: number): string {
  if (score >= 75) return '#34C759';
  if (score >= 55) return '#FF9500';
  return '#FF3B30';
}

function classificationStyle(classification: string): { bg: string; border: string; text: string } {
  switch (classification) {
    case 'Excelente':  return { bg: 'bg-green-500/20',   border: 'border-green-500/30',   text: 'text-green-500'   };
    case 'En Tiempo':  return { bg: 'bg-green-500/20',   border: 'border-green-500/30',   text: 'text-green-500'   };
    case 'Estable':    return { bg: 'bg-yellow-500/20',  border: 'border-yellow-500/30',  text: 'text-yellow-500'  };
    case 'En Riesgo':  return { bg: 'bg-[#FF3B30]/20',   border: 'border-[#FF3B30]/30',   text: 'text-[#FF3B30]'   };
    case 'Crítico':    return { bg: 'bg-[#FF2D55]/20',   border: 'border-[#FF2D55]/30',   text: 'text-[#FF2D55]'   };
    default:           return { bg: 'bg-white/10',       border: 'border-white/20',       text: 'text-white'       };
  }
}

//Componentes
export function ProjectScore() {
  const score = PROJECT_SCORE;
  const cls   = classificationStyle(score.classification);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 1.35 }}
    >
      {/*Título de sección*/}
      <motion.h2
        className="text-xl font-semibold text-white mb-6 flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 1.4 }}
      >
        <motion.div
          whileHover={{ rotate: 360, scale: 1.2 }}
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
        >
          <Award className="w-5 h-5 text-[#FF3B30]" />
        </motion.div>
        Score General del Proyecto
      </motion.h2>

      <motion.div
        className="bg-[#1C1C1E] border border-white/10 rounded-xl p-8 backdrop-blur-xl relative overflow-hidden group"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.45 }}
        whileHover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#FF3B30]/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 pointer-events-none"
          transition={{ duration: 0.4 }}
        />

        {/*Gauge + clasificación + pesos*/}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">

          {/*Gauge radial*/}
          <div className="relative w-[260px] h-[260px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={[{ value: score.value, fill: score.color }]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar background={{ fill: '#0F0F0F' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-6xl font-bold text-white">{score.value}</p>
              <p className="text-sm text-[#8E8E93]">/ {score.maxValue}</p>
            </div>
          </div>

          {/*Clasificación + contadores + pesos*/}
          <div className="text-center lg:text-left flex-1 min-w-0">

            {/*Categorización*/}
            <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${cls.bg} border ${cls.border}`}>
              <p className={`text-lg font-bold ${cls.text}`}>{score.classification}</p>
            </div>

            <p className="text-3xl font-bold text-white mb-2">Score Compuesto</p>
            <p className="text-sm text-[#8E8E93] max-w-md mb-6">
              Evaluación 0–100 basada en avance, cumplimiento de plazos, calidad de
              entregables, desempeño del equipo y gestión de riesgo.
            </p>

            {/*Resumen*/}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{score.strengths.length}</p>
                <p className="text-xs text-[#8E8E93]">Fortalezas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{score.improvements.length}</p>
                <p className="text-xs text-[#8E8E93]">A Mejorar</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#FF3B30]">{score.critical.length}</p>
                <p className="text-xs text-[#8E8E93]">Críticos</p>
              </div>
            </div>

            {/*Barras*/}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
                Desglose de pesos
              </p>
              {Object.values(score.breakdown).map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-[#8E8E93] w-36 shrink-0">{item.label}</span>
                  <div className="flex-1 h-1.5 bg-[#0F0F0F] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.score}%`,
                        backgroundColor: dimensionColor(item.score),
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white w-8 text-right">{item.score}</span>
                  <span className="text-xs text-[#48484A] w-10 text-right">
                    {(item.weight * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*Desglose*/}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-6">

          {/*Fortalezas*/}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Fortalezas
            </p>
            {score.strengths.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-[#8E8E93] bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2"
              >
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/*Mejora*/}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-yellow-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> A Mejorar
            </p>
            {score.improvements.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-[#8E8E93] bg-yellow-500/5 border border-yellow-500/10 rounded-lg px-3 py-2"
              >
                <span className="text-yellow-500 mt-0.5 shrink-0">⚠</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/*Critico*/}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#FF3B30] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" /> Críticos
            </p>
            {score.critical.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-[#8E8E93] bg-[#FF3B30]/5 border border-[#FF3B30]/10 rounded-lg px-3 py-2"
              >
                <span className="text-[#FF3B30] mt-0.5 shrink-0">✕</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
