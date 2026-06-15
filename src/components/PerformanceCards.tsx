import type { FootballPerformanceSummary } from '../types'
import { KpiCard } from './dashboard/parts'
import { formatPct } from '../lib/odds'

// ─── Cartões de KPI da performance ───────────────────────────────────────────
// Resumo da operação: total, acertos, ROI, lucro simulado, pendentes.

function signedUnits(v?: number | null): string {
  if (v == null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}u`
}

export default function PerformanceCards({
  totals,
}: {
  totals: FootballPerformanceSummary['totals']
}) {
  const profitTone = (totals.profit ?? 0) >= 0 ? 'accent' : 'red'
  const roiTone = (totals.roi ?? 0) >= 0 ? 'accent' : 'red'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <KpiCard label="Picks" value={totals.total} icon="📋" />
      <KpiCard label="Taxa de acerto" value={formatPct(totals.hit_rate, 1)} tone="brand" icon="🎯" />
      <KpiCard label="ROI" value={totals.roi != null ? formatPct(totals.roi, 1) : '—'} tone={roiTone} icon="📈" />
      <KpiCard label="Lucro (sim.)" value={signedUnits(totals.profit)} tone={profitTone} icon="💰" />
      <KpiCard label="Pendentes" value={totals.pending} icon="⏳" />
      <KpiCard
        label="Liquidadas"
        value={totals.won + totals.lost + totals.push}
        hint={`${totals.won}V · ${totals.lost}D · ${totals.push}push`}
        icon="✅"
      />
    </div>
  )
}
