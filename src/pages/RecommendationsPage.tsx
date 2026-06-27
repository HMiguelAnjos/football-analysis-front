// ─── RecommendationsPage — recomendações geradas pelo modelo ──────────────────
// Lista pública (somente leitura) das entradas geradas pelo modelo, com
// filtros por liga e mercado e alternância entre cartões e tabela.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { AnalysisRecommendation, FootballLeague, FootballRecommendation } from '../types'
import RecommendationCard from '../components/RecommendationCard'
import RecommendationTable from '../components/RecommendationTable'
import AnalysisCard from '../components/AnalysisCard'
import MatchHeader from '../components/MatchHeader'
import PageHeader from '../components/PageHeader'
import LeagueFilter from '../components/LeagueFilter'
import MarketFilter from '../components/MarketFilter'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { InlineError } from '../components/States'
import { useCompetition } from '../hooks/useCompetition'
import PropsPage from './PropsPage'

type View = 'cards' | 'table'
type Tab = 'mercados' | 'jogadores' | 'analise'

// Agrupa recomendações por jogo, ordenado por kickoff. Aceita qualquer item com
// match/match_id/kickoff/group (mercados ou análise).
interface Groupable {
  match_id?: number | string | null
  match?: string | null
  kickoff?: string | null
  group?: string | null
}
interface RecGroup<T> {
  match: string
  kickoff?: string | null
  group?: string | null
  recs: T[]
}
function groupByMatch<T extends Groupable>(items: T[]): RecGroup<T>[] {
  const byMatch = new Map<string, RecGroup<T>>()
  for (const r of items) {
    const key = String(r.match_id ?? r.match)
    let g = byMatch.get(key)
    if (!g) {
      g = { match: r.match ?? '—', kickoff: r.kickoff, group: r.group, recs: [] }
      byMatch.set(key, g)
    }
    g.recs.push(r)
  }
  return Array.from(byMatch.values()).sort((a, b) => {
    const ta = a.kickoff ? new Date(a.kickoff).getTime() : Infinity
    const tb = b.kickoff ? new Date(b.kickoff).getTime() : Infinity
    return ta - tb
  })
}

export default function RecommendationsPage() {
  const { isWorldCup } = useCompetition()
  const [tab, setTab] = useState<Tab>('mercados')
  const [recs, setRecs] = useState<FootballRecommendation[] | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisRecommendation[] | null>(null)
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
      // Oportunidades de VALOR ao vivo (modelo × odd real), ordenadas por edge.
      const r = await api.getOpportunities({ limit: 60 })
      const data = market ? r.data.filter(x => x.market === market) : r.data
      setRecs(data)
      setError(false)
    } catch {
      setError(true)
      setRecs([])
    }
  }, [market])

  const loadAnalysis = useCallback(async () => {
    try {
      const r = await api.getAnalysis({ limit: 60 })
      setAnalysis(r.data)
      setError(false)
    } catch {
      setError(true)
      setAnalysis([])
    }
  }, [])

  useEffect(() => {
    if (tab === 'analise') {
      setAnalysis(null)
      loadAnalysis()
    } else if (tab === 'mercados') {
      setRecs(null)
      load()
    }
  }, [tab, load, loadAnalysis])

  const groups = useMemo(() => groupByMatch(recs ?? []), [recs])
  const analysisGroups = useMemo(() => groupByMatch(analysis ?? []), [analysis])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <PageHeader title="Pré-Jogo" subtitle="Entradas do modelo antes da bola rolar — mercados, jogadores e análise por scores." />
      {/* Toggle principal: mercados (seleção) ↔ jogadores (props) */}
      <div className="flex gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] w-fit">
        {([['mercados', 'Mercados'], ['jogadores', 'Jogadores'], ['analise', 'Análise']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`text-[12px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-md transition-all ${
              tab === id
                ? 'bg-gradient-to-b from-brand-500/25 to-brand-500/10 text-brand-200 ring-1 ring-inset ring-brand-500/30 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'jogadores' ? (
        <PropsPage embedded />
      ) : tab === 'analise' ? (
        <>
          <div className="flex items-center gap-2">
            <p className="text-[13px] text-zinc-500">
              Análise por scores (0–100) com grade e explicação. Expanda cada card para ver os scores.
            </p>
            <button
              onClick={loadAnalysis}
              className="ml-auto text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
            >
              ↻
            </button>
          </div>
          {error && (
            <InlineError
              title="Falha ao carregar a análise"
              description="Verifique a conexão com o backend e tente novamente."
              onRetry={loadAnalysis}
            />
          )}
          {analysis === null ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : analysis.length === 0 ? (
            <SectionEmpty icon="📊" text="Nenhuma recomendação de análise com grade suficiente. Quando houver dados (jogos disputados, xG), os grades sobem." />
          ) : (
            <div className="space-y-7">
              {analysisGroups.map((g, gi) => (
                <section key={`${g.match}-${gi}`} className="space-y-3">
                  <MatchHeader match={g.match} kickoff={g.kickoff} group={g.group}
                               count={g.recs.length} countLabel="análises" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {g.recs.map((r, i) => (
                      <AnalysisCard key={`${r.match_id}-${r.market}-${r.selection}-${i}`} rec={r} hideMatch />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
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
        <div className="space-y-7">
          {groups.map((g, gi) => (
            <section key={`${g.match}-${gi}`} className="space-y-3">
              <MatchHeader match={g.match} kickoff={g.kickoff} group={g.group}
                           count={g.recs.length} countLabel="entradas" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.recs.map((r, i) => <RecommendationCard key={`${r.match_id}-${r.market}-${r.selection}-${i}`} rec={r} hideMatch />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <RecommendationTable recs={recs} />
      )}
        </>
      )}
    </div>
  )
}
