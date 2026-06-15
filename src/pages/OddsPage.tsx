// ─── OddsPage — comparação de odds entre casas ───────────────────────────────
// Lista o board de odds (por jogo) com filtros de liga e mercado. Cada item
// traz a melhor odd em destaque e a tabela comparativa entre casas.

import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import type { FootballLeague, OddsBoardItem } from '../types'
import OddsComparisonTable from '../components/OddsComparisonTable'
import LeagueFilter from '../components/LeagueFilter'
import MarketFilter from '../components/MarketFilter'
import { SectionCard, SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { matchupLabel, formatKickoffTime } from '../lib/match'

export default function OddsPage() {
  const [board, setBoard] = useState<OddsBoardItem[] | null>(null)
  const [leagues, setLeagues] = useState<FootballLeague[]>([])
  const [error, setError] = useState(false)
  const [leagueId, setLeagueId] = useState('')
  const [market, setMarket] = useState('')

  useEffect(() => {
    api.getLeagues().then(r => setLeagues(r.data)).catch(() => setLeagues([]))
  }, [])

  const load = useCallback(() => {
    setBoard(null)
    setError(false)
    api.getOdds({ league_id: leagueId || undefined, market: market || undefined })
      .then(r => setBoard(r.data))
      .catch(() => { setError(true); setBoard([]) })
  }, [leagueId, market])

  useEffect(load, [load])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <LeagueFilter leagues={leagues} value={leagueId} onChange={setLeagueId} />
        <MarketFilter value={market} onChange={setMarket} />
        <button
          onClick={load}
          className="ml-auto text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
        >
          ↻ Atualizar
        </button>
      </div>

      {error && <ErrorState title="Não foi possível carregar as odds" onRetry={load} />}

      {board === null ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : board.length === 0 ? (
        <SectionEmpty icon="💱" text="Nenhuma odd disponível para os filtros selecionados." />
      ) : (
        <div className="space-y-4">
          {board.map((item, i) => (
            <SectionCard
              key={item.match.id ?? i}
              title={matchupLabel(item.match)}
              subtitle={`${item.match.league_name ?? ''} · ${formatKickoffTime(item.match.kickoff)}`}
              icon="💱"
            >
              <OddsComparisonTable entries={item.entries} />
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}
