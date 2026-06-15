import type { FootballRecommendation } from '../types'
import { marketLabel } from '../lib/markets'
import {
  confidenceMeta,
  formatEdge,
  formatOdd,
  formatPct,
  impliedProb,
  recommendationEdge,
  timeAgo,
} from '../lib/odds'
import { SectionEmpty } from './dashboard/parts'

// ─── Tabela densa de recomendações ───────────────────────────────────────────
// Visão tabular pra muitas entradas. Mesmos dados do RecommendationCard.

const EDGE_TONE: Record<'accent' | 'red' | 'neutral', string> = {
  accent: 'text-accent-400',
  red: 'text-red-400',
  neutral: 'text-zinc-400',
}

export default function RecommendationTable({
  recs,
}: {
  recs: FootballRecommendation[]
}) {
  if (recs.length === 0) {
    return <SectionEmpty icon="📋" text="Nenhuma recomendação para os filtros selecionados." />
  }

  return (
    <div className="card-premium overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 border-b border-white/[0.06]">
              <th className="px-4 py-3">Jogo</th>
              <th className="px-4 py-3">Mercado</th>
              <th className="px-4 py-3">Seleção</th>
              <th className="px-4 py-3 text-right">Odd</th>
              <th className="px-4 py-3 text-right">Justa</th>
              <th className="px-4 py-3 text-right">Prob.</th>
              <th className="px-4 py-3 text-right">Edge</th>
              <th className="px-4 py-3 text-center">Conf.</th>
              <th className="px-4 py-3 whitespace-nowrap">Quando</th>
            </tr>
          </thead>
          <tbody>
            {recs.map(r => {
              const conf = confidenceMeta(r.confidence as string | null | undefined)
              const edgeFmt = formatEdge(recommendationEdge(r))
              return (
                <tr key={r.id} className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-zinc-100 truncate max-w-[180px]">{r.match}</div>
                    <div className="text-[11px] text-zinc-500 truncate max-w-[180px]">{r.league ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{marketLabel(r.market)}</td>
                  <td className="px-4 py-3 font-semibold text-brand-200">
                    {r.selection}{r.line != null ? ` ${r.line}` : ''}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-zinc-200">{formatOdd(r.odd)}</td>
                  <td className="px-4 py-3 text-right tabular text-zinc-400">{formatOdd(r.fair_odd)}</td>
                  <td className="px-4 py-3 text-right tabular text-zinc-400">
                    {formatPct(r.model_prob ?? impliedProb(r.odd))}
                  </td>
                  <td className={`px-4 py-3 text-right tabular font-bold ${EDGE_TONE[edgeFmt.tone]}`}>
                    {edgeFmt.text}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {conf ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${conf.cls}`}>
                        {conf.label}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-zinc-500 whitespace-nowrap">{timeAgo(r.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
