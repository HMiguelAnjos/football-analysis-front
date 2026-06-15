// ─── PlayersPage — líderes da competição + busca ─────────────────────────────
// Abas de líderes (gols, assistências, chutes, chutes no gol) + busca por nome.

import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { FootballPlayer } from '../types'
import PlayerStatsCard from '../components/PlayerStatsCard'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { selectCls } from '../components/filterStyles'

type Metric = 'goals' | 'assists' | 'shots' | 'shots_on_target'

const METRICS: { key: Metric; label: string }[] = [
  { key: 'goals', label: 'Gols' },
  { key: 'assists', label: 'Assistências' },
  { key: 'shots', label: 'Chutes' },
  { key: 'shots_on_target', label: 'No gol' },
]

const METRIC_VALUE: Record<Metric, (p: FootballPlayer) => number> = {
  goals: p => p.goals ?? 0,
  assists: p => p.assists ?? 0,
  shots: p => p.shots ?? 0,
  shots_on_target: p => p.shots_on_target ?? 0,
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<FootballPlayer[] | null>(null)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [metric, setMetric] = useState<Metric>('goals')

  const searching = search.trim().length >= 2

  useEffect(() => {
    let cancelled = false
    setPlayers(null)
    setError(false)
    const run = () => {
      const req = searching
        ? api.getPlayers({ search: search.trim() })
        : api.getPlayerLeaders({ metric, limit: 30 })
      req
        .then(r => { if (!cancelled) setPlayers(r.data) })
        .catch(() => { if (!cancelled) { setError(true); setPlayers([]) } })
    }
    const t = setTimeout(run, searching ? 350 : 0)
    return () => { cancelled = true; clearTimeout(t) }
  }, [search, metric, searching])

  const ranked = useMemo(() => {
    if (!players || searching) return players
    // Reforça a ordenação do lado do cliente pela métrica selecionada.
    return [...players].sort((a, b) => METRIC_VALUE[metric](b) - METRIC_VALUE[metric](a))
  }, [players, metric, searching])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar jogador…"
          className={`${selectCls} w-full sm:w-64`}
        />
        {!searching && (
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${
                  metric === m.key ? 'bg-brand-500/20 text-brand-300' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!searching && (
        <p className="text-[12px] text-zinc-500">
          Líderes por <span className="text-zinc-300 font-semibold">
            {METRICS.find(m => m.key === metric)?.label}
          </span> na competição.
        </p>
      )}

      {error && <ErrorState title="Não foi possível carregar os jogadores" onRetry={() => setMetric(m => m)} />}

      {ranked === null ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : ranked.length === 0 ? (
        <SectionEmpty
          icon="👤"
          text={searching ? 'Nenhum jogador encontrado para esta busca.' : 'Sem dados de jogadores para esta competição ainda.'}
        />
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
