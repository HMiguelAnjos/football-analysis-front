// ─── PlayersPage — líderes, índices compostos e busca ────────────────────────
// Dois modos: "Estatísticas" (gols, chutes, desarmes…) e "Índices" (IPO/ICJ/
// ID/IIP, 0–100). Busca por nome sobrepõe os dois.

import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { FootballPlayer } from '../types'
import PlayerStatsCard from '../components/PlayerStatsCard'
import PageHeader from '../components/PageHeader'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { selectCls } from '../components/filterStyles'

type Kind = 'stats' | 'index'
type Metric = 'goals' | 'assists' | 'shots' | 'shots_on_target' | 'dribbles' | 'tackles' | 'fouls_drawn' | 'rating'
type IndexKey = 'iip' | 'ipo' | 'icj' | 'id'

const METRICS: { key: Metric; label: string }[] = [
  { key: 'goals', label: 'Gols' },
  { key: 'assists', label: 'Assistências' },
  { key: 'shots', label: 'Chutes' },
  { key: 'shots_on_target', label: 'No gol' },
  { key: 'dribbles', label: 'Dribles' },
  { key: 'tackles', label: 'Desarmes' },
  { key: 'fouls_drawn', label: 'Faltas sofridas' },
  { key: 'rating', label: 'Nota' },
]

const INDEXES: { key: IndexKey; label: string; hint: string }[] = [
  { key: 'iip', label: 'IIP', hint: 'Influência na partida' },
  { key: 'ipo', label: 'IPO', hint: 'Periculosidade ofensiva' },
  { key: 'icj', label: 'ICJ', hint: 'Criação de jogadas' },
  { key: 'id', label: 'ID', hint: 'Defensivo' },
]

const METRIC_VALUE: Record<Metric, (p: FootballPlayer) => number> = {
  goals: p => p.goals ?? 0, assists: p => p.assists ?? 0, shots: p => p.shots ?? 0,
  shots_on_target: p => p.shots_on_target ?? 0, dribbles: p => p.dribbles ?? 0,
  tackles: p => p.tackles ?? 0, fouls_drawn: p => p.fouls_drawn ?? 0, rating: p => p.rating ?? 0,
}
const INDEX_VALUE: Record<IndexKey, (p: FootballPlayer) => number> = {
  iip: p => p.iip ?? 0, ipo: p => p.ipo ?? 0, icj: p => p.icj ?? 0, id: p => p.idef ?? 0,
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<FootballPlayer[] | null>(null)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState<Kind>('stats')
  const [metric, setMetric] = useState<Metric>('goals')
  const [index, setIndex] = useState<IndexKey>('iip')

  const searching = search.trim().length >= 2

  useEffect(() => {
    let cancelled = false
    setPlayers(null); setError(false)
    const run = () => {
      const req = searching
        ? api.getPlayers({ search: search.trim() })
        : kind === 'index'
          ? api.getPlayerIndex({ index, limit: 30 })
          : api.getPlayerLeaders({ metric, limit: 30 })
      req.then(r => { if (!cancelled) setPlayers(r.data) })
         .catch(() => { if (!cancelled) { setError(true); setPlayers([]) } })
    }
    const t = setTimeout(run, searching ? 350 : 0)
    return () => { cancelled = true; clearTimeout(t) }
  }, [search, kind, metric, index, searching])

  const ranked = useMemo(() => {
    if (!players || searching) return players
    const val = kind === 'index' ? INDEX_VALUE[index] : METRIC_VALUE[metric]
    return [...players].sort((a, b) => val(b) - val(a))
  }, [players, kind, metric, index, searching])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <PageHeader title="Jogadores" subtitle="Líderes por estatística, índices compostos (0–100) e busca por nome." />
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar jogador…"
          className={`${selectCls} w-full sm:w-56`}
        />
        {!searching && (
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            {(['stats', 'index'] as const).map(k => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${
                  kind === k ? 'bg-brand-500/20 text-brand-300' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {k === 'stats' ? 'Estatísticas' : 'Índices'}
              </button>
            ))}
          </div>
        )}
      </div>

      {!searching && (
        <div className="flex flex-wrap gap-1.5">
          {kind === 'stats'
            ? METRICS.map(m => (
                <button key={m.key} onClick={() => setMetric(m.key)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                    metric === m.key ? 'bg-brand-500/15 border-brand-500/30 text-brand-200'
                                     : 'border-white/[0.08] text-zinc-500 hover:text-zinc-300'}`}>
                  {m.label}
                </button>
              ))
            : INDEXES.map(ix => (
                <button key={ix.key} onClick={() => setIndex(ix.key)} title={ix.hint}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                    index === ix.key ? 'bg-brand-500/15 border-brand-500/30 text-brand-200'
                                     : 'border-white/[0.08] text-zinc-500 hover:text-zinc-300'}`}>
                  {ix.label} <span className="text-zinc-600">· {ix.hint}</span>
                </button>
              ))}
        </div>
      )}

      {error && <ErrorState title="Não foi possível carregar os jogadores" onRetry={() => setSearch(s => s)} />}

      {ranked === null ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : ranked.length === 0 ? (
        <SectionEmpty icon="👤" text={searching ? 'Nenhum jogador encontrado.' : 'Sem dados de jogadores para esta competição ainda.'} />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {ranked.map((p, i) => (
            <div key={p.id} className="relative">
              {!searching && (
                <span className="absolute -top-2 -left-2 z-10 grid place-items-center w-6 h-6 rounded-full bg-brand-500 text-ink-900 text-[11px] font-extrabold shadow">
                  {i + 1}
                </span>
              )}
              <PlayerStatsCard player={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
