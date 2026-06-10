import { useState } from 'react';
import { API_URL } from '../services/api';

export interface RiskItem {
  categoria: string;
  nivel: 'Alto' | 'Medio' | 'Bajo';
  descripcion: string;
  impacto: string;
  recomendacion: string;
  urgencia: 'Inmediata' | 'Esta semana' | 'Este sprint';
}

export interface RiskAnalysisData {
  nivelRiesgoGlobal: 'Alto' | 'Medio' | 'Bajo';
  justificacionGlobal: string;
  riesgos: RiskItem[];
  fortalezas: string[];
  indicadorSemaforo: {
    cronograma: 'verde' | 'amarillo' | 'rojo';
    equipo: 'verde' | 'amarillo' | 'rojo';
    calidad: 'verde' | 'amarillo' | 'rojo';
    capacidad: 'verde' | 'amarillo' | 'rojo';
  };
}

export function useRiskAnalysis(projectId: string) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState<RiskAnalysisData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  async function analyze() {
    if (isAnalyzing || !projectId) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/ai/risk-analysis`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json();

      if (!res.ok) {
        const msg =
          res.status === 503
            ? 'El servicio de IA no está disponible en este momento.'
            : res.status === 408
            ? 'La generación tardó demasiado. Intenta de nuevo.'
            : res.status === 422
            ? (json.message ?? 'El proyecto no tiene suficientes datos para el análisis.')
            : json.message ?? 'Error al generar el análisis. Intenta de nuevo.';
        setError(msg);
        return;
      }

      setData(json.riskData);
      setGeneratedAt(json.generatedAt);
    } catch {
      setError('Error de conexión. Verifica tu red e intenta de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function downloadPdf() {
    if (!data || !projectId || isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/ai/risk-analysis/pdf`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskData: data }),
      });

      if (!res.ok) {
        setError('Error al generar el PDF. Intenta de nuevo.');
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition') ?? '';
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'analisis-riesgo.pdf';

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Error de conexión al descargar el PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function clear() {
    setData(null);
    setError(null);
    setGeneratedAt(null);
  }

  return {
    analyze,
    isAnalyzing,
    data,
    generatedAt,
    error,
    clearError: () => setError(null),
    downloadPdf,
    isDownloadingPdf,
    clear,
  };
}
