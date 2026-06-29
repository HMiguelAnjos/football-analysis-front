import type { FootballPerformanceSummary } from '../types'
import { KpiCard } from './dashboard/parts'
import { formatPct } from '../lib/odds'

// ─── Cartões de KPI da performance ───────────────────────────────────────────
// Resumo da operação: total, taxa de acerto, pendentes, liquidadas. ROI/Lucro
// ficam de fora enquanto o modelo é confidence-first SEM odds (sem preço, lucro
// não tem como ser simulado — a métrica honesta é a taxa de acerto).

export default function PerformanceCards({
  totals,
}: {
  totals: FootballPerformanceSummary['totals']
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiCard label="Picks" value={totals.total} icon="📋" />
      <KpiCard label="Taxa de acerto" value={formatPct(totals.hit_rate, 1)} tone="brand" icon="🎯" />
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
