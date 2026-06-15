// ─── RecommendationsPage — recomendações geradas pelo modelo ──────────────────
// Lista pública (somente leitura) das entradas geradas pelo modelo, com
// filtros por liga e mercado e alternância entre cartões e tabela.

import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import type { FootballLeague, FootballRecommendation } from '../types'
import RecommendationCard from '../components/RecommendationCard'
import RecommendationTable from '../components/RecommendationTable'
import LeagueFilter from '../components/LeagueFilter'
import MarketFilter from '../components/MarketFilter'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { InlineError } from '../components/States'
import { useCompetition } from '../hooks/useCompetition'

type View = 'cards' | 'table'

export default function RecommendationsPage() {
  const { isWorldCup } = useCompetition()
  const [recs, setRecs] = useState<FootballRecommendation[] | null>(null)
  const [leagues, setLeagues] = useState<FootballLeague[]>([])
  const [error, setError] = useState(false)

  const [leagueId, setLeagueId] = useState('')
  const [market, setMarket] = useState('')
  const [view, setView] = useState<View>('cards')

  useEffect(() => {
    if (isWorldCup) return
    api.getLeagues().then(r => setLeagues(r.data)).catch(() => setLeagues([]))
  }, [isWorldCup])

  const load = useCallback(async () => {
    try {
      const r = await api.getRecommendations({
        league_id: leagueId || undefined,
        market: market || undefined,
      })
      setRecs(r.data)
      setError(false)
    } catch {
      setError(true)
      setRecs([])
    }
  }, [leagueId, market])

  useEffect(() => {
    setRecs(null)
    load()
  }, [load])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        {!isWorldCup && (
          <LeagueFilter leagues={leagues} value={leagueId} onChange={setLeagueId} />
        )}
        <MarketFilter value={market} onChange={setMarket} />
        <div className="ml-auto flex items-center gap-2">
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            {(['cards', 'table'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${
                  view === v ? 'bg-brand-500/20 text-brand-300' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {v === 'cards' ? 'Cartões' : 'Tabela'}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
          >
            ↻
          </button>
        </div>
      </div>

      {error && (
        <InlineError
          title="Falha ao carregar as recomendações"
          description="Verifique a conexão com o backend e tente novamente."
          onRetry={load}
        />
      )}

      {recs === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : recs.length === 0 ? (
        <SectionEmpty icon="⚡" text="Nenhuma recomendação para os filtros selecionados." />
      ) : view === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recs.map(r => <RecommendationCard key={r.id} rec={r} />)}
        </div>
      ) : (
        <RecommendationTable recs={recs} />
      )}
    </div>
  )
}
