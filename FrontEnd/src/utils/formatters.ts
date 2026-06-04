const RISK_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export function mapRisk(r: string): string {
  return RISK_LABELS[r] ?? r;
}

export function riskBadgeClass(r: string): string {
  if (r === 'HIGH' || r === 'CRITICAL') return 'bg-[#FF3B30]/10 text-[#FF3B30]';
  if (r === 'MEDIUM') return 'bg-yellow-500/10 text-yellow-500';
  return 'bg-green-500/10 text-green-500';
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}
