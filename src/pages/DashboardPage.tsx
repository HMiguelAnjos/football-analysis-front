// ─── DashboardPage — visão geral da operação ─────────────────────────────────
// Jogos de hoje, melhores recomendações, KPIs de performance e ligas em
// destaque. Cada bloco busca de forma independente e degrada com elegância
// quando o endpoint ainda não responde.

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type {
  FootballLeague,
  FootballMatch,
  FootballRecommendation,
  FootballPerformanceSummary,
} from '../types'
import MatchList from '../components/MatchList'
import RecommendationCard from '../components/RecommendationCard'
import PerformanceCards from '../components/PerformanceCards'
import { SectionCard, SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { useVisiblePolling } from '../hooks/useVisiblePolling'
import { useCompetition } from '../hooks/useCompetition'

const EMPTY_TOTALS: FootballPerformanceSummary['totals'] = {
  total: 0, won: 0, lost: 0, push: 0, pending: 0, hit_rate: null, roi: null, profit: null,
}

export default function DashboardPage() {
  const { isWorldCup } = useCompetition()
  const [matches, setMatches] = useState<FootballMatch[] | null>(null)
  const [recs, setRecs] = useState<FootballRecommendation[] | null>(null)
  const [perf, setPerf] = useState<FootballPerformanceSummary['totals'] | null>(null)
  const [leagues, setLeagues] = useState<FootballLeague[]>([])

  const loadMatches = useCallback(async () => {
    try {
      const r = await api.getMatchesToday()
      setMatches(r.data.matches ?? [])
    } catch {
      setMatches([])
    }
  }, [])

  const loadRest = useCallback(async () => {
    const [recsR, perfR, leaguesR] = await Promise.allSettled([
      api.getRecommendations({ status: 'pending' }),
      api.getPerformance(),
      api.getLeagues(),
    ])
    setRecs(recsR.status === 'fulfilled' ? recsR.value.data.slice(0, 6) : [])
    setPerf(perfR.status === 'fulfilled' ? perfR.value.data.totals : EMPTY_TOTALS)
    setLeagues(leaguesR.status === 'fulfilled' ? leaguesR.value.data : [])
  }, [])

  useEffect(() => {
    loadMatches()
    loadRest()
  }, [loadMatches, loadRest])

  // Jogos atualizam com mais frequência (placar ao vivo).
  useVisiblePolling(loadMatches, 30_000, [loadMatches], { skipFirstRun: true })

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

      {/* Jogos de hoje */}
      <SectionCard
        title="Jogos de hoje"
        icon="📅"
        action={
          <Link to="/jogos" className="text-[11px] font-bold uppercase tracking-wider text-brand-300 hover:text-brand-200">
            Ver todos →
          </Link>
        }
      >
        <MatchList matches={matches} emptyText="Nenhum jogo programado para hoje." />
      </SectionCard>

      {/* Melhores recomendações */}
      <SectionCard
        title="Melhores recomendações do dia"
        icon="⚡"
        action={
          <Link to="/recomendacoes" className="text-[11px] font-bold uppercase tracking-wider text-brand-300 hover:text-brand-200">
            Ver todas →
          </Link>
        }
      >
        {recs === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : recs.length === 0 ? (
          <SectionEmpty icon="⚡" text="Nenhuma recomendação ativa no momento." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map(r => <RecommendationCard key={r.id} rec={r} />)}
          </div>
        )}
      </SectionCard>

      {/* Copa: atalhos do torneio · Futebol: ligas em destaque */}
      {isWorldCup ? (
        <SectionCard title="Copa do Mundo" icon="🏆">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <Link to="/grupos" className="surface-interactive rounded-xl px-4 py-4 flex flex-col gap-1">
              <span className="text-2xl" aria-hidden>🗂️</span>
              <span className="text-[14px] font-bold text-white">Grupos</span>
              <span className="text-[11px] text-zinc-500">Classificação por grupo</span>
            </Link>
            <Link to="/mata-mata" className="surface-interactive rounded-xl px-4 py-4 flex flex-col gap-1">
              <span className="text-2xl" aria-hidden>🏟️</span>
              <span className="text-[14px] font-bold text-white">Mata-mata</span>
              <span className="text-[11px] text-zinc-500">Chaveamento</span>
            </Link>
            <Link to="/times" className="surface-interactive rounded-xl px-4 py-4 flex flex-col gap-1">
              <span className="text-2xl" aria-hidden>🌎</span>
              <span className="text-[14px] font-bold text-white">Seleções</span>
              <span className="text-[11px] text-zinc-500">Forma e estatísticas</span>
            </Link>
            <Link to="/recomendacoes" className="surface-interactive rounded-xl px-4 py-4 flex flex-col gap-1">
              <span className="text-2xl" aria-hidden>⚡</span>
              <span className="text-[14px] font-bold text-white">Recomendações</span>
              <span className="text-[11px] text-zinc-500">Valor do modelo</span>
            </Link>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title="Ligas em destaque"
          icon="🏆"
          action={
            <Link to="/ligas" className="text-[11px] font-bold uppercase tracking-wider text-brand-300 hover:text-brand-200">
              Ver ligas →
            </Link>
          }
        >
          {leagues.length === 0 ? (
            <SectionEmpty icon="🏆" text="Nenhuma liga configurada ainda." />
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {leagues.slice(0, 8).map(l => (
                <Link
                  key={l.id}
                  to="/ligas"
                  className="surface-interactive rounded-xl px-4 py-3 flex flex-col gap-1"
                >
                  <span className="text-[14px] font-bold text-white truncate">{l.name}</span>
                  <span className="text-[11px] text-zinc-500 truncate">{l.country}</span>
                  {l.matches_today != null && (
                    <span className="text-[11px] text-brand-300 font-semibold">{l.matches_today} jogo(s) hoje</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  )
}
