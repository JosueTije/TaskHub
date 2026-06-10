import { useState, useRef } from 'react';
import { API_URL } from '../services/api';

const PROGRESS_STEPS = [
  'Analizando el proyecto...',
  'Generando narrativa con IA...',
  'Creando PDF...',
];

export function useExecutiveSummary(projectId: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isGeneratingRef = useRef(false);

  function startProgressCycle() {
    let step = 0;
    setProgressMessage(PROGRESS_STEPS[0]);
    intervalRef.current = setInterval(() => {
      step = (step + 1) % PROGRESS_STEPS.length;
      setProgressMessage(PROGRESS_STEPS[step]);
    }, 8000);
  }

  function stopProgressCycle() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgressMessage('');
  }

  async function generate() {
    if (isGeneratingRef.current || !projectId) return;
    isGeneratingRef.current = true;
    setIsGenerating(true);
    setError(null);
    startProgressCycle();

    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/ai/executive-summary`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg =
          res.status === 503
            ? 'El servicio de IA no está disponible en este momento.'
            : res.status === 408
            ? 'La generación tardó demasiado. Intenta de nuevo.'
            : res.status === 422
            ? (errData.message ?? 'El proyecto no tiene suficientes datos para generar el resumen.')
            : errData.message ?? 'Error al generar el PDF. Intenta de nuevo.';
        setError(msg);
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition') ?? '';
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'resumen-ejecutivo.pdf';

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Error de conexión. Verifica tu red e intenta de nuevo.');
    } finally {
      stopProgressCycle();
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  }

  return { generate, isGenerating, progressMessage, error, clearError: () => setError(null) };
}
