// ─── MatchAnalysisPage — análise detalhada de uma partida ────────────────────
// Header com mandante x visitante, comparativo de estatísticas (forma, gols,
// xG/xGA), desfalques, escalação provável, recomendação do modelo e comparação
// de odds. Cada bloco degrada quando o backend não fornece o dado.

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { FootballMatch, MatchOdds, MatchStatistics } from '../types'
import TeamStatsCard from '../components/TeamStatsCard'
import TeamBadge from '../components/TeamBadge'
import RecommendationCard from '../components/RecommendationCard'
import OddsComparisonTable from '../components/OddsComparisonTable'
import { SectionCard, SectionEmpty, Pill } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { statusMeta, scoreline, hasScore, formatKickoffTime, formatKickoffDate } from '../lib/match'

export default function MatchAnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const [match, setMatch] = useState<FootballMatch | null>(null)
  const [stats, setStats] = useState<MatchStatistics | null>(null)
  const [odds, setOdds] = useState<MatchOdds | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(false)
    const run = async () => {
      try {
        const matchR = await api.getMatch(id)
        if (cancelled) return
        setMatch(matchR.data)
      } catch {
        if (!cancelled) setError(true)
        if (!cancelled) setLoading(false)
        return
      }
      const [statsR, oddsR] = await Promise.allSettled([
        api.getMatchStatistics(id),
        api.getMatchOdds(id),
      ])
      if (cancelled) return
      setStats(statsR.status === 'fulfilled' ? statsR.value.data : null)
      setOdds(oddsR.status === 'fulfilled' ? oddsR.value.data : null)
      setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [id])

  if (loading && !match) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <ErrorState
          title="Não foi possível carregar a partida"
          description={<>O jogo pode não existir mais. <Link to="/jogos" className="text-brand-300 underline">Voltar para jogos</Link>.</>}
        />
      </div>
    )
  }

  const st = statusMeta(match.status, match.minute)
  const recommendation = stats?.recommendation ?? null
  const injuries = stats?.injuries ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="card-premium p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[12px] font-semibold text-zinc-500">
            {match.league_name ?? 'Liga'}{match.country ? ` · ${match.country}` : ''}
          </span>
          <Pill tone={st.tone}>
            {st.live && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse-subtle" />}
            {st.label}
          </Pill>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col items-center gap-2 text-center min-w-0">
            <TeamBadge team={match.home} size="lg" />
            <span className="text-[14px] font-bold text-white truncate w-full">{match.home.name}</span>
          </div>
          <div className="shrink-0 text-center">
            {hasScore(match) ? (
              <div className="text-3xl font-extrabold tabular text-white leading-none">{scoreline(match)}</div>
            ) : (
              <>
                <div className="text-2xl font-extrabold tabular text-white leading-none">{formatKickoffTime(match.kickoff)}</div>
                <div className="text-[11px] text-zinc-500 mt-1">{formatKickoffDate(match.kickoff)}</div>
              </>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-2 text-center min-w-0">
            <TeamBadge team={match.away} size="lg" />
            <span className="text-[14px] font-bold text-white truncate w-full">{match.away.name}</span>
          </div>
        </div>
      </div>

      {/* Comparativo de estatísticas */}
      <SectionCard title="Forma e estatísticas" icon="📊">
        {stats ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TeamStatsCard stats={stats.home} />
            <TeamStatsCard stats={stats.away} />
          </div>
        ) : (
          <SectionEmpty icon="📊" text="Estatísticas detalhadas indisponíveis para esta partida." />
        )}
      </SectionCard>

      {/* Recomendação do modelo */}
      {recommendation && (
        <SectionCard title="Recomendação do modelo" icon="⚡">
          <RecommendationCard rec={recommendation} />
          {stats?.model_note && (
            <p className="mt-3 text-[13px] text-zinc-400 leading-relaxed">{stats.model_note}</p>
          )}
        </SectionCard>
      )}

      {/* Desfalques + escalação provável */}
      {(injuries.length > 0 || stats?.probable_lineup_home?.length || stats?.probable_lineup_away?.length) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Desfalques" icon="🚑">
            {injuries.length === 0 ? (
              <SectionEmpty icon="✅" text="Nenhum desfalque reportado." />
            ) : (
              <ul className="space-y-2">
                {injuries.map((inj, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="text-zinc-200 font-semibold truncate">
                      {inj.player_name}
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        {inj.team_side === 'home' ? match.home.short_name ?? 'Casa' : match.away.short_name ?? 'Fora'}
                      </span>
                    </span>
                    <span className="text-zinc-500 text-[12px] truncate">{inj.reason ?? inj.status ?? '—'}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Escalação provável" icon="📋">
            <div className="grid grid-cols-2 gap-4">
              <LineupColumn title={match.home.short_name ?? 'Mandante'} slots={stats?.probable_lineup_home} />
              <LineupColumn title={match.away.short_name ?? 'Visitante'} slots={stats?.probable_lineup_away} />
            </div>
          </SectionCard>
        </div>
      )}

      {/* Odds */}
      <SectionCard title="Odds" icon="💱">
        {odds && odds.entries.length > 0 ? (
          <OddsComparisonTable entries={odds.entries} />
        ) : (
          <SectionEmpty icon="💱" text="Odds indisponíveis para esta partida." />
        )}
      </SectionCard>
    </div>
  )
}

function LineupColumn({ title, slots }: { title: string; slots?: { player_name: string; number?: number | null }[] }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2">{title}</div>
      {!slots || slots.length === 0 ? (
        <div className="text-[12px] text-zinc-600">—</div>
      ) : (
        <ul className="space-y-1">
          {slots.map((s, i) => (
            <li key={i} className="text-[12px] text-zinc-300 truncate">
              {s.number != null && <span className="text-zinc-600 tabular mr-1.5">{s.number}</span>}
              {s.player_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
