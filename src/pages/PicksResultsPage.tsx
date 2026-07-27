// ─── PicksResultsPage — histórico de picks liquidados ─────────────────────────
// Tabela (somente leitura) do ledger imutável de resultados. Mostra, por pick, o
// VALOR REAL que decidiu a entrada (ex.: "3 finalizações no gol", "11 escanteios")
// além do acerto/erro. Filtros por resultado e por mercado; resumo de acurácia.

import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { FootballPickResult, PickResultStatus } from '../types'
import { marketLabel } from '../lib/markets'
import PageHeader from '../components/PageHeader'
import MarketFilter from '../components/MarketFilter'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { InlineError } from '../components/States'

type ResultFilter = '' | 'win' | 'loss' | 'push'

// Resultado (win/loss/push/pending) → rótulo + classe do badge.
const RESULT_META: Record<string, { label: string; cls: string }> = {
  win: { label: 'GREEN', cls: 'text-accent-300 bg-accent-500/10 border-accent-500/25' },
  loss: { label: 'RED', cls: 'text-red-300 bg-red-500/10 border-red-500/25' },
  push: { label: 'ANULADO', cls: 'text-zinc-400 bg-white/[0.04] border-white/[0.10]' },
  pending: { label: 'PENDENTE', cls: 'text-amber-300 bg-amber-500/10 border-amber-500/25' },
}

function resultMeta(r: PickResultStatus) {
  return RESULT_META[r] ?? RESULT_META.pending
}

function formatWhen(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export default function PicksResultsPage() {
  const [rows, setRows] = useState<FootballPickResult[] | null>(null)
  const [error, setError] = useState(false)
  const [result, setResult] = useState<ResultFilter>('')
  const [market, setMarket] = useState('')

  const load = () => {
    setRows(null)
    setError(false)
    api.getPickResults()
      .then(r => setRows(r.data))
      .catch(() => { setError(true); setRows([]) })
  }

  useEffect(load, [])

  const filtered = useMemo(() => {
    let out = rows ?? []
    if (result) out = out.filter(r => r.result === result)
    if (market) out = out.filter(r => r.market === market)
    return out
  }, [rows, result, market])

  // Resumo de acurácia sobre o conjunto FILTRADO (empates/anulados fora da taxa).
  const stats = useMemo(() => {
    const won = filtered.filter(r => r.result === 'win').length
    const lost = filtered.filter(r => r.result === 'loss').length
    const denom = won + lost
    return { total: filtered.length, won, lost, rate: denom ? won / denom : null }
  }, [filtered])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <PageHeader
        title="Resultados"
        subtitle="Histórico de picks liquidados — o valor real que decidiu cada entrada."
        action={
          <button
            onClick={load}
            className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
          >
            ↻
          </button>
        }
      />

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Picks" value={String(stats.total)} />
        <StatCard label="Acertos" value={String(stats.won)} tone="accent" />
        <StatCard label="Erros" value={String(stats.lost)} tone="red" />
        <StatCard
          label="Taxa de acerto"
          value={stats.rate != null ? `${(stats.rate * 100).toFixed(0)}%` : '—'}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
          {(
            [['', 'Todos'], ['win', 'Green'], ['loss', 'Red'], ['push', 'Anulado']] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setResult(id)}
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${
                result === id ? 'bg-brand-500/20 text-brand-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <MarketFilter value={market} onChange={setMarket} />
      </div>

      {error && (
        <InlineError
          title="Falha ao carregar os resultados"
          description="Verifique a conexão com o backend e tente novamente."
          onRetry={load}
        />
      )}

      {rows === null ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : filtered.length === 0 ? (
        <SectionEmpty
          icon="🏁"
          text="Nenhum resultado liquidado para os filtros selecionados. Assim que os jogos terminarem, os picks aparecem aqui."
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 border-b border-white/[0.06]">
                  <th className="px-4 py-3">Jogo</th>
                  <th className="px-4 py-3">Mercado</th>
                  <th className="px-4 py-3">Seleção</th>
                  <th className="px-4 py-3 text-center">Resultado</th>
                  <th className="px-4 py-3">Valor real</th>
                  <th className="px-4 py-3 whitespace-nowrap">Liquidado em</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const meta = resultMeta(r.result)
                  return (
                    <tr key={r.id} className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-100 truncate max-w-[180px]">{r.match}</div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[180px]">{r.league ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{marketLabel(r.market)}</td>
                      <td className="px-4 py-3 font-semibold text-brand-200">
                        <span className="block truncate max-w-[220px]">{r.selection}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-200">{r.actual ?? '—'}</td>
                      <td className="px-4 py-3 text-[11px] text-zinc-500 whitespace-nowrap">
                        {formatWhen(r.settled_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label, value, tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'accent' | 'red'
}) {
  const toneCls =
    tone === 'accent' ? 'text-accent-300' : tone === 'red' ? 'text-red-300' : 'text-white'
  return (
    <div className="card-premium px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className={`text-[22px] font-extrabold tabular mt-1 ${toneCls}`}>{value}</p>
    </div>
  )
}
