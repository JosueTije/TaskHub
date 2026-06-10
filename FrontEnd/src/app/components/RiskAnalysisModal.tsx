import { X, Download, Loader2, ShieldAlert, ShieldCheck, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { RiskAnalysisData, RiskItem } from '../../hooks/useRiskAnalysis';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  projectName: string;
  data: RiskAnalysisData;
  generatedAt: string | null;
  isDownloadingPdf: boolean;
  onDownloadPdf: () => void;
  onClose: () => void;
  theme: 'dark' | 'light';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function semaphoreColor(level: string | undefined) {
  const l = (level ?? '').toLowerCase();
  if (l === 'verde') return { bg: 'bg-[#34C759]', border: 'border-[#34C759]', text: 'text-[#34C759]', dot: '#34C759' };
  if (l === 'amarillo') return { bg: 'bg-[#FF9F0A]', border: 'border-[#FF9F0A]', text: 'text-[#FF9F0A]', dot: '#FF9F0A' };
  if (l === 'rojo') return { bg: 'bg-[#FF3B30]', border: 'border-[#FF3B30]', text: 'text-[#FF3B30]', dot: '#FF3B30' };
  return { bg: 'bg-[#8E8E93]', border: 'border-[#8E8E93]', text: 'text-[#8E8E93]', dot: '#8E8E93' };
}

function riskLevelStyle(level: string) {
  if (level === 'Alto') return { border: 'border-l-[#FF3B30]', badge: 'bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/30' };
  if (level === 'Medio') return { border: 'border-l-[#FF9F0A]', badge: 'bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30' };
  return { border: 'border-l-[#34C759]', badge: 'bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30' };
}

function urgencyStyle(urgency: string) {
  if (urgency === 'Inmediata') return 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20';
  if (urgency === 'Esta semana') return 'bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/20';
  return 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20';
}

function globalRiskStyle(level: string) {
  if (level === 'Alto') return { bg: 'bg-[#FF3B30]/10', border: 'border-[#FF3B30]/30', text: 'text-[#FF3B30]' };
  if (level === 'Medio') return { bg: 'bg-[#FF9F0A]/10', border: 'border-[#FF9F0A]/30', text: 'text-[#FF9F0A]' };
  return { bg: 'bg-[#34C759]/10', border: 'border-[#34C759]/30', text: 'text-[#34C759]' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SemaphoreCard({ label, level, theme }: { label: string; level: string; theme: 'dark' | 'light' }) {
  const colors = semaphoreColor(level);
  const card = theme === 'dark' ? 'bg-[#0F0F0F] border-white/10' : 'bg-[#F6F2EA] border-[#4A453D]/10';
  const labelColor = theme === 'dark' ? 'text-white' : 'text-[#29251D]';

  return (
    <div className={`${card} border rounded-xl p-4 flex flex-col items-center gap-2`}>
      <div className={`w-10 h-10 rounded-full ${colors.bg}/20 border-2 ${colors.border} flex items-center justify-center`}>
        <div className={`w-5 h-5 rounded-full ${colors.bg}`} />
      </div>
      <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
      <span className={`text-xs font-semibold ${colors.text} capitalize`}>{level || '—'}</span>
    </div>
  );
}

function RiskCard({ risk, theme }: { risk: RiskItem; theme: 'dark' | 'light' }) {
  const styles = riskLevelStyle(risk.nivel);
  const card = theme === 'dark' ? 'bg-[#1C1C1E] border-white/8' : 'bg-white border-[#4A453D]/8';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-[#29251D]';
  const textMuted = theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]';

  return (
    <div className={`${card} border border-l-4 ${styles.border} rounded-xl p-4 space-y-3`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>{risk.nivel}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-white/8 text-[#8E8E93]' : 'bg-[#4A453D]/8 text-[#4A453D]'}`}>
          {risk.categoria}
        </span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${urgencyStyle(risk.urgencia)}`}>
          {risk.urgencia}
        </span>
      </div>

      <p className={`text-sm ${textPrimary} leading-relaxed`}>{risk.descripcion}</p>

      {risk.impacto && (
        <p className={`text-xs ${textMuted}`}>
          <span className="font-medium">Impacto: </span>{risk.impacto}
        </p>
      )}

      <div className="bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-lg p-3 flex gap-2">
        <Lightbulb className="w-4 h-4 text-[#007AFF] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#007AFF] leading-relaxed">{risk.recomendacion}</p>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function RiskAnalysisModal({
  projectName,
  data,
  generatedAt,
  isDownloadingPdf,
  onDownloadPdf,
  onClose,
  theme,
}: Props) {
  const bg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';
  const border = theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-[#29251D]';
  const textMuted = theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]';
  const overlay = theme === 'dark' ? 'bg-black/70' : 'bg-black/40';
  const divider = theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10';

  const globalStyle = globalRiskStyle(data.nivelRiesgoGlobal);
  const sem = data.indicadorSemaforo;

  const sortedRisks = [...data.riesgos].sort((a, b) => {
    const order = { Alto: 0, Medio: 1, Bajo: 2 };
    return (order[a.nivel] ?? 3) - (order[b.nivel] ?? 3);
  });

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 ${overlay} backdrop-blur-sm z-50 flex items-center justify-center p-4`}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className={`${bg} border ${border} rounded-2xl w-full max-w-[720px] max-h-[85vh] flex flex-col shadow-2xl`}
        >
          {/* Header */}
          <div className={`flex items-start gap-3 p-5 border-b ${divider} flex-shrink-0`}>
            <ShieldAlert className="w-5 h-5 text-[#FF3B30] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className={`font-semibold ${textPrimary} truncate`}>
                Análisis de riesgo — {projectName}
              </h2>
              {formattedDate && (
                <p className={`text-xs ${textMuted} mt-0.5`}>Generado el {formattedDate}</p>
              )}
            </div>

            {/* Global risk badge */}
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${globalStyle.bg} ${globalStyle.text} border ${globalStyle.border} flex-shrink-0`}>
              Riesgo {data.nivelRiesgoGlobal}
            </span>

            {/* Download PDF */}
            <button
              onClick={onDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 text-xs text-[#007AFF] hover:text-[#0051FF] disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {isDownloadingPdf
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />}
              PDF
            </button>

            <button
              onClick={onClose}
              className={`${textMuted} hover:text-[#FF3B30] transition-colors flex-shrink-0`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* Justification */}
            <p className={`text-sm ${textMuted} leading-relaxed`}>{data.justificacionGlobal}</p>

            {/* Semaphore grid */}
            <div>
              <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>Semáforo de dimensiones</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SemaphoreCard label="Cronograma" level={sem.cronograma} theme={theme} />
                <SemaphoreCard label="Equipo" level={sem.equipo} theme={theme} />
                <SemaphoreCard label="Calidad" level={sem.calidad} theme={theme} />
                <SemaphoreCard label="Capacidad" level={sem.capacidad} theme={theme} />
              </div>
            </div>

            {/* Risks list */}
            {sortedRisks.length > 0 && (
              <div>
                <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <AlertTriangle className="w-4 h-4 text-[#FF9F0A]" />
                  Riesgos identificados ({sortedRisks.length})
                </h3>
                <div className="space-y-3">
                  {sortedRisks.map((risk, i) => (
                    <RiskCard key={i} risk={risk} theme={theme} />
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {data.fortalezas?.length > 0 && (
              <div>
                <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                  Lo que está funcionando bien
                </h3>
                <div className="space-y-2">
                  {data.fortalezas.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-[#34C759] flex-shrink-0 mt-0.5" />
                      <p className={`text-sm ${textMuted}`}>{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`border-t ${divider} p-4 flex-shrink-0 space-y-3`}>
            <div className="flex gap-3">
              <button
                onClick={onDownloadPdf}
                disabled={isDownloadingPdf}
                className="flex-1 flex items-center justify-center gap-2 bg-[#007AFF] hover:bg-[#0051FF] disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                {isDownloadingPdf ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Generando PDF...</>
                ) : (
                  <><Download className="w-4 h-4" />Descargar PDF</>
                )}
              </button>
              <button
                onClick={onClose}
                className={`flex-1 ${textMuted} border ${border} rounded-xl py-2.5 text-sm hover:text-[#FF3B30] hover:border-[#FF3B30]/30 transition-colors`}
              >
                Cerrar
              </button>
            </div>
            <p className={`text-[10px] ${textMuted} text-center`}>
              Análisis generado por IA (Groq). Revisar con el equipo antes de tomar decisiones.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
