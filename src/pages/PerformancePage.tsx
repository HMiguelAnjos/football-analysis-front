// ─── PerformancePage — acompanhamento de resultados ──────────────────────────
// KPIs gerais + quebra por mercado, liga e analista. Performance global/por
// analista exige permissão (viewGlobalPerformance) — mas a tela em si é
// acessível e mostra o que o backend liberar pro usuário.

import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { FootballPerformanceSummary, PerfBreakdownItem } from '../types'
import PerformanceCards from '../components/PerformanceCards'
import { SectionCard, SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { formatPct } from '../lib/odds'

function BreakdownTable({ items }: { items?: PerfBreakdownItem[] }) {
  if (!items || items.length === 0) {
    return <SectionEmpty icon="📊" text="Sem dados suficientes ainda." />
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 border-b border-white/[0.06]">
            <th className="px-3 py-2">Dimensão</th>
            <th className="px-3 py-2 text-right">Picks</th>
            <th className="px-3 py-2 text-right">Acerto</th>
            <th className="px-3 py-2 text-right">ROI</th>
            <th className="px-3 py-2 text-right">Lucro</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => {
            const profit = it.profit ?? 0
            return (
              <tr key={it.key} className="border-b border-white/[0.04] last:border-b-0">
                <td className="px-3 py-2 font-semibold text-zinc-200">{it.label ?? it.key}</td>
                <td className="px-3 py-2 text-right tabular text-zinc-400">{it.total}</td>
                <td className="px-3 py-2 text-right tabular text-zinc-200">{formatPct(it.hit_rate, 1)}</td>
                <td className="px-3 py-2 text-right tabular text-zinc-400">{it.roi != null ? formatPct(it.roi, 1) : '—'}</td>
                <td className={`px-3 py-2 text-right tabular font-bold ${profit >= 0 ? 'text-accent-400' : 'text-red-400'}`}>
                  {it.profit != null ? `${profit >= 0 ? '+' : ''}${profit.toFixed(2)}u` : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function PerformancePage() {
  const [data, setData] = useState<FootballPerformanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = () => {
    setLoading(true)
    setError(false)
    api.getPerformance()
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <ErrorState title="Não foi possível carregar a performance" onRetry={load} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <PerformanceCards totals={data.totals} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Por mercado" icon="🎯">
          <BreakdownTable items={data.by_market} />
        </SectionCard>
        <SectionCard title="Por liga" icon="🏆">
          <BreakdownTable items={data.by_league} />
        </SectionCard>
      </div>

      {data.by_analyst && data.by_analyst.length > 0 && (
        <SectionCard title="Por analista" icon="🧠">
          <BreakdownTable items={data.by_analyst} />
        </SectionCard>
      )}
    </div>
  )
}
