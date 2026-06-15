// ─── DashboardPage — central de decisão (betting analytics) ──────────────────
// KPIs da operação + oportunidades do dia + jogadores em destaque. Foco total
// em tomada de decisão; zero conteúdo institucional.

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type {
  FootballMatch, FootballPlayer, FootballRecommendation, FootballPerformanceSummary,
} from '../types'
import MatchList from '../components/MatchList'
import RecommendationCard from '../components/RecommendationCard'
import PlayerStatsCard from '../components/PlayerStatsCard'
import PerformanceCards from '../components/PerformanceCards'
import { SectionCard, SectionEmpty, KpiCard } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { useVisiblePolling } from '../hooks/useVisiblePolling'
import { recommendationEdge } from '../lib/odds'

const EMPTY_TOTALS: FootballPerformanceSummary['totals'] = {
  total: 0, won: 0, lost: 0, push: 0, pending: 0, hit_rate: null, roi: null, profit: null,
}

export default function DashboardPage() {
  const [matches, setMatches] = useState<FootballMatch[] | null>(null)
  const [recs, setRecs] = useState<FootballRecommendation[] | null>(null)
  const [live, setLive] = useState<FootballRecommendation[]>([])
  const [perf, setPerf] = useState<FootballPerformanceSummary['totals'] | null>(null)
  const [players, setPlayers] = useState<FootballPlayer[]>([])

  const loadMatches = useCallback(async () => {
    try {
      const r = await api.getMatchesToday()
      setMatches(r.data.matches ?? [])
    } catch { setMatches([]) }
  }, [])

  const loadRest = useCallback(async () => {
    const [recsR, liveR, perfR, plR] = await Promise.allSettled([
      api.getRecommendations({ status: 'pending' }),
      api.getLivePicks(),
      api.getPerformance(),
      api.getPlayerLeaders({ metric: 'goals', limit: 6 }),
    ])
    const recsData = recsR.status === 'fulfilled' ? recsR.value.data : []
    recsData.sort((a, b) => (recommendationEdge(b) ?? -1) - (recommendationEdge(a) ?? -1))
    setRecs(recsData)
    setLive(liveR.status === 'fulfilled' ? liveR.value.data : [])
    setPerf(perfR.status === 'fulfilled' ? perfR.value.data.totals : EMPTY_TOTALS)
    setPlayers(plR.status === 'fulfilled' ? plR.value.data : [])
  }, [])

  useEffect(() => { loadMatches(); loadRest() }, [loadMatches, loadRest])
  useVisiblePolling(loadMatches, 30_000, [loadMatches], { skipFirstRun: true })

  const liveCount = matches?.filter(m => m.status === 'live' || m.status === 'halftime').length ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* KPIs da operação */}
      {perf === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (
        <PerformanceCards totals={perf} />
      )}

      {/* Oportunidades / entradas / jogos ao vivo */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Oportunidades hoje" value={recs?.length ?? '—'} tone="brand" icon="⚡" />
        <KpiCard label="Entradas ao vivo" value={live.length} tone="violet" icon="📡" />
        <KpiCard label="Jogos ao vivo" value={liveCount} tone="accent" icon="🔴" />
      </div>

      {/* Melhores oportunidades do dia */}
      <SectionCard title="Melhores oportunidades do dia" icon="⚡"
        action={<Link to="/recomendacoes" className="text-[11px] font-bold uppercase tracking-wider text-brand-300 hover:text-brand-200">Ver todas →</Link>}>
        {recs === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : recs.length === 0 ? (
          <SectionEmpty icon="⚡" text="Nenhuma recomendação ativa. Gere recomendações na aba Recomendações." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recs.slice(0, 6).map(r => <RecommendationCard key={r.id} rec={r} />)}
          </div>
        )}
      </SectionCard>

      {/* Jogos de hoje */}
      <SectionCard title="Jogos de hoje" icon="📅"
        action={<Link to="/jogos" className="text-[11px] font-bold uppercase tracking-wider text-brand-300 hover:text-brand-200">Ver todos →</Link>}>
        <MatchList matches={matches} emptyText="Nenhum jogo programado para hoje." />
      </SectionCard>

      {/* Jogadores em destaque */}
      <SectionCard title="Jogadores em destaque" icon="🌟"
        action={<Link to="/jogadores" className="text-[11px] font-bold uppercase tracking-wider text-brand-300 hover:text-brand-200">Ver jogadores →</Link>}>
        {players.length === 0 ? (
          <SectionEmpty icon="🌟" text="Sem dados de jogadores ainda." />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {players.map(p => <PlayerStatsCard key={p.id} player={p} />)}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
