// ─── MatchAnalysisPage — a tela-mãe do produto (betting analytics) ───────────
// Blocos: resumo · probabilidades+edge · recomendação do modelo · props de
// jogadores · mercados (odd/justa/edge) · estatísticas dos times · (desfalques).

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type {
  FootballMatch, FootballRecommendation, MarketLine, MatchStatistics,
} from '../types'
import TeamStatsCard from '../components/TeamStatsCard'
import TeamBadge from '../components/TeamBadge'
import RecommendationCard from '../components/RecommendationCard'
import { Flag, Gauge, GradeBadge, gradeFromLabel } from '../components/cards/parts'
import { SectionCard, SectionEmpty, Pill } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { marketLabel } from '../lib/markets'
import { formatPct, formatOdd, formatEdge } from '../lib/odds'
import { statusMeta, scoreline, hasScore, formatKickoffTime, formatKickoffDate } from '../lib/match'

const EDGE_TONE: Record<string, string> = {
  accent: 'text-accent-400', red: 'text-red-400', neutral: 'text-zinc-500',
}
const SEL_LABEL: Record<string, string> = {
  home: 'Casa', draw: 'Empate', away: 'Fora', over: 'Over', under: 'Under',
  yes: 'Sim', no: 'Não', home_draw: '1X', home_away: '12', draw_away: 'X2',
}
const sel = (s: string) => SEL_LABEL[s] ?? s

export default function MatchAnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const [match, setMatch] = useState<FootballMatch | null>(null)
  const [stats, setStats] = useState<MatchStatistics | null>(null)
  const [markets, setMarkets] = useState<MarketLine[]>([])
  const [props, setProps] = useState<FootballRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true); setError(false)
    const run = async () => {
      try {
        const m = await api.getMatch(id)
        if (cancelled) return
        setMatch(m.data)
      } catch {
        if (!cancelled) { setError(true); setLoading(false) }
        return
      }
      const [s, mk, pr] = await Promise.allSettled([
        api.getMatchStatistics(id), api.getMatchMarkets(id), api.getMatchProps(id),
      ])
      if (cancelled) return
      setStats(s.status === 'fulfilled' ? s.value.data : null)
      setMarkets(mk.status === 'fulfilled' ? mk.value.data : [])
      setProps(pr.status === 'fulfilled' ? pr.value.data : [])
      setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [id])

  if (loading && !match) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }
  if (error || !match) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <ErrorState title="Não foi possível carregar a partida"
          description={<>O jogo pode não existir mais. <Link to="/jogos" className="text-brand-300 underline">Voltar para jogos</Link>.</>} />
      </div>
    )
  }

  const st = statusMeta(match.status, match.minute)
  const oneXtwo = markets.filter(m => m.market === '1x2')
  const goalMarkets = markets.filter(m => m.market === 'over_under')
  const otherMarkets = markets.filter(m => !['1x2', 'over_under'].includes(m.market))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1 · Resumo */}
      <div className="card-premium p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[12px] font-semibold text-zinc-500">
            {match.league_name ?? 'Liga'}
            {match.stage ? ` · ${match.stage}` : ''}
            {match.venue ? ` · ${match.venue}` : ''}
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

      {/* 2 · Probabilidades (1X2) */}
      {oneXtwo.length > 0 && (
        <SectionCard title="Probabilidades · 1X2" icon="🎯">
          <div className="grid grid-cols-3 gap-3">
            {oneXtwo.map(m => {
              const e = formatEdge(m.edge ?? null)
              return (
                <div key={m.selection} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {m.selection === 'home' ? match.home.short_name ?? 'Casa'
                      : m.selection === 'away' ? match.away.short_name ?? 'Fora' : 'Empate'}
                  </div>
                  <div className="text-2xl font-extrabold text-white tabular leading-tight my-1">{formatPct(m.model_prob)}</div>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                    <span>odd <b className="text-zinc-300">{formatOdd(m.odd)}</b></span>
                    <span>justa <b className="text-zinc-300">{formatOdd(m.fair_odd)}</b></span>
                  </div>
                  {m.edge != null && <div className={`mt-1 text-[12px] font-bold ${EDGE_TONE[e.tone]}`}>{e.text}</div>}
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      {/* 3 · Recomendação do modelo */}
      {stats?.recommendation && (
        <SectionCard title="Recomendação do modelo" icon="⚡">
          <RecommendationCard rec={stats.recommendation} />
          {stats.model_note && <p className="mt-3 text-[13px] text-zinc-400 leading-relaxed">{stats.model_note}</p>}
        </SectionCard>
      )}

      {/* 4 · Props de jogadores */}
      <SectionCard title="Props de jogadores" icon="🎽"
        subtitle="Projeção do modelo ajustada pela força do adversário.">
        {props.length === 0 ? (
          <SectionEmpty icon="🎽" text="Sem props com confiança suficiente para este jogo." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {props.map((p, i) => <PropCard key={i} prop={p} />)}
          </div>
        )}
      </SectionCard>

      {/* 5 · Mercados */}
      {(goalMarkets.length > 0 || otherMarkets.length > 0) && (
        <SectionCard title="Mercados" icon="📈"
          subtitle="Probabilidade do modelo × odd da casa = edge.">
          <MarketTable rows={[...goalMarkets, ...otherMarkets]} />
        </SectionCard>
      )}

      {/* 6 · Estatísticas dos times */}
      <SectionCard title="Forma e estatísticas" icon="📊">
        {stats ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TeamStatsCard stats={stats.home} />
            <TeamStatsCard stats={stats.away} />
          </div>
        ) : (
          <SectionEmpty icon="📊" text="Estatísticas indisponíveis para esta partida." />
        )}
      </SectionCard>
    </div>
  )
}

function PropCard({ prop }: { prop: FootballRecommendation }) {
  const meta = gradeFromLabel(prop.confidence as string | null | undefined)
  const [name, ...rest] = (prop.selection || '').split('—')
  const bet = rest.join('—').trim()
  const pct = Math.round((prop.model_prob ?? 0) * 100)
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-extrabold text-white truncate">
            {prop.player_number != null && <span className="text-zinc-500 mr-1">#{prop.player_number}</span>}
            {name.trim()}
          </div>
          {prop.team && (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 min-w-0">
              <Flag name={prop.team} /><span className="truncate">{prop.team}</span>
            </div>
          )}
        </div>
        <GradeBadge meta={meta} />
      </div>
      {bet && <div className="text-[12px] font-semibold text-brand-200">{bet}</div>}
      <div className="flex items-center gap-2">
        <div className="shrink-0">
          <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">Chance</div>
          <div className={`text-[18px] font-extrabold tabular leading-none ${meta.text}`}>{pct}%</div>
        </div>
        <Gauge pct={pct} color={meta.bar} />
        <div className="ml-auto text-[10px] text-zinc-500">justa <b className="text-zinc-300 tabular">{formatOdd(prop.fair_odd)}</b></div>
      </div>
      {prop.reason && <p className="text-[11px] text-zinc-500 leading-relaxed">{prop.reason}</p>}
    </div>
  )
}

function MarketTable({ rows }: { rows: MarketLine[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-zinc-500 text-[10px] uppercase tracking-wider">
            <th className="text-left font-semibold py-2">Mercado</th>
            <th className="text-left font-semibold py-2">Seleção</th>
            <th className="text-center font-semibold py-2">Modelo</th>
            <th className="text-center font-semibold py-2">Odd</th>
            <th className="text-center font-semibold py-2">Justa</th>
            <th className="text-right font-semibold py-2 pr-1">Edge</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m, i) => {
            const e = formatEdge(m.edge ?? null)
            return (
              <tr key={i} className="border-t border-white/[0.04]">
                <td className="py-2 text-zinc-400">{marketLabel(m.market)}</td>
                <td className="py-2 text-zinc-200 font-semibold">
                  {sel(m.selection)}{m.line != null ? ` ${m.line}` : ''}
                </td>
                <td className="py-2 text-center text-white font-bold tabular">{formatPct(m.model_prob)}</td>
                <td className="py-2 text-center text-zinc-300 tabular">{formatOdd(m.odd)}</td>
                <td className="py-2 text-center text-zinc-300 tabular">{formatOdd(m.fair_odd)}</td>
                <td className={`py-2 text-right pr-1 font-bold tabular ${EDGE_TONE[e.tone]}`}>
                  {m.edge != null ? e.text : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
