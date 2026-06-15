import type { OddsEntry } from '../types'
import { marketLabel } from '../lib/markets'
import { formatOdd } from '../lib/odds'
import { SectionEmpty } from './dashboard/parts'

// ─── Tabela de comparação de odds entre casas ────────────────────────────────
// Destaca a melhor odd (maior) por linha e a variação vs odd anterior.

function movementMeta(entry: OddsEntry): { text: string; cls: string } | null {
  const prev = entry.previous_odd
  const mv = entry.movement ?? (prev != null ? entry.odd - prev : null)
  if (mv == null || Math.abs(mv) < 0.005) return null
  const up = mv > 0
  return {
    text: `${up ? '▲' : '▼'} ${Math.abs(mv).toFixed(2)}`,
    cls: up ? 'text-accent-400' : 'text-red-400',
  }
}

export default function OddsComparisonTable({ entries }: { entries: OddsEntry[] }) {
  if (entries.length === 0) {
    return <SectionEmpty icon="📊" text="Sem odds disponíveis para os filtros selecionados." />
  }

  const bestOdd = Math.max(...entries.map(e => e.odd))

  return (
    <div className="card-premium overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 border-b border-white/[0.06]">
              <th className="px-4 py-3">Casa</th>
              <th className="px-4 py-3">Mercado</th>
              <th className="px-4 py-3">Seleção</th>
              <th className="px-4 py-3 text-right">Anterior</th>
              <th className="px-4 py-3 text-right">Atual</th>
              <th className="px-4 py-3 text-right">Variação</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const mv = movementMeta(e)
              const isBest = e.odd === bestOdd
              return (
                <tr key={`${e.bookmaker}-${e.selection}-${i}`} className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold text-zinc-200">{e.bookmaker}</td>
                  <td className="px-4 py-3 text-zinc-400">{marketLabel(e.market)}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {e.selection}{e.line != null ? ` ${e.line}` : ''}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-zinc-500">{formatOdd(e.previous_odd)}</td>
                  <td className={`px-4 py-3 text-right tabular font-bold ${isBest ? 'text-accent-400' : 'text-zinc-200'}`}>
                    {formatOdd(e.odd)}
                    {isBest && <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider text-accent-400">melhor</span>}
                  </td>
                  <td className={`px-4 py-3 text-right tabular ${mv ? mv.cls : 'text-zinc-600'}`}>
                    {mv ? mv.text : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
