// ─── PropsPage — feed de player props do modelo, AGRUPADO POR JOGO ───────────
// Recomendações por JOGADOR (artilheiro, chutes no gol, assistências) dos jogos
// próximos, projetadas pela taxa do jogador × força do adversário. Organizado
// por jogo (cada jogo = uma seção) pra entender em qual partida entrar. Filtra
// por mercado e por jogo, sem nunca esconder recomendações.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { FootballRecommendation } from '../types'
import { SectionEmpty } from '../components/dashboard/parts'
import { Pill } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { InlineError } from '../components/States'
import { confidenceMeta, formatPct } from '../lib/odds'

// Rótulos PT-BR dos mercados de jogador (o backend manda o code name).
const MARKET_LABEL: Record<string, string> = {
  player_shots_on_target: 'Chutes no gol',
  player_shots: 'Finalizações',
  anytime_scorer: 'Marcar a qualquer momento',
  player_assists: 'Assistências',
}
const marketLabel = (m: string) => MARKET_LABEL[m] ?? m

// Filtros de mercado disponíveis na barra.
const MARKET_FILTERS = [
  { id: '', label: 'Todos' },
  { id: 'anytime_scorer', label: 'Marcar' },
  { id: 'player_shots_on_target', label: 'Chutes no gol' },
  { id: 'player_shots', label: 'Finalizações' },
  { id: 'player_assists', label: 'Assistências' },
]

// Data/hora do kickoff no formato "qua, 16:00" (ou vazio se inválido).
function kickoffLabel(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// Enquadramento da jogada pela probabilidade do modelo — SEM odds de casa.
function strength(prob?: number | null): { label: string; tone: 'accent' | 'brand' | 'neutral' } {
  const p = prob ?? 0
  if (p >= 0.7) return { label: 'Aposta forte', tone: 'accent' }
  if (p >= 0.55) return { label: 'Provável', tone: 'brand' }
  return { label: 'Especulativa', tone: 'neutral' }
}

function PropCard({ rec }: { rec: FootballRecommendation }) {
  const conf = confidenceMeta(rec.confidence as string | null | undefined)
  // A seleção vem como "Jogador — Mais de 0.5 chutes no gol"; separa nome do resto.
  const [player, ...rest] = rec.selection.split('—')
  const bet = rest.join('—').trim()
  const st = strength(rec.model_prob)

  return (
    <article className="card-premium p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[14px] font-extrabold text-white truncate">
            {rec.player_number != null && (
              <span className="text-zinc-500 font-bold mr-1.5">#{rec.player_number}</span>
            )}
            {player.trim()}
          </h3>
          {rec.team && <p className="text-[11.5px] text-zinc-500 truncate">{rec.team}</p>}
        </div>
        {conf && (
          <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${conf.cls}`}>
            {conf.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Pill tone="brand">{marketLabel(rec.market)}</Pill>
        {bet && <span className="text-[12.5px] font-semibold text-zinc-200">{bet}</span>}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Chance de acontecer</div>
          <div className="text-[19px] font-extrabold tabular text-accent-400 leading-none mt-0.5">
            {formatPct(rec.model_prob)}
          </div>
        </div>
        <Pill tone={st.tone}>{st.label}</Pill>
      </div>

      {rec.reason && (
        <p className="text-[12.5px] text-zinc-400 leading-relaxed border-l-2 border-brand-500/40 pl-3">
          {rec.reason}
        </p>
      )}
    </article>
  )
}

// Um jogo + suas props.
interface MatchGroup {
  matchId: string
  match: string
  kickoff?: string | null
  group?: string | null
  picks: FootballRecommendation[]
}

export default function PropsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const [props, setProps] = useState<FootballRecommendation[] | null>(null)
  const [error, setError] = useState(false)
  const [market, setMarket] = useState('')
  const [matchFilter, setMatchFilter] = useState('')

  const load = useCallback(async () => {
    setProps(null)
    setError(false)
    try {
      const r = await api.getProps({ limit: 80 })
      setProps(r.data)
    } catch {
      setError(true)
      setProps([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Agrupa por jogo, ordena os jogos pelo kickoff (próximos primeiro). As props
  // dentro do jogo mantêm a ordem do backend (maior probabilidade primeiro).
  const groups = useMemo<MatchGroup[]>(() => {
    const rows = (props ?? []).filter(p => !market || p.market === market)
    const byMatch = new Map<string, MatchGroup>()
    for (const p of rows) {
      const key = String(p.match_id ?? p.match)
      let g = byMatch.get(key)
      if (!g) {
        g = { matchId: key, match: p.match, kickoff: p.kickoff, group: p.group, picks: [] }
        byMatch.set(key, g)
      }
      g.picks.push(p)
    }
    const all = Array.from(byMatch.values())
    all.sort((a, b) => {
      const ta = a.kickoff ? new Date(a.kickoff).getTime() : Infinity
      const tb = b.kickoff ? new Date(b.kickoff).getTime() : Infinity
      return ta - tb
    })
    return matchFilter ? all.filter(g => g.matchId === matchFilter) : all
  }, [props, market, matchFilter])

  // Lista de jogos pro dropdown (todos, independente do filtro de jogo atual).
  const allMatches = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of props ?? []) seen.set(String(p.match_id ?? p.match), p.match)
    return Array.from(seen.entries())
  }, [props])

  return (
    <div className={embedded ? 'space-y-5' : 'max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5'}>
      {!embedded && (
        <div>
          <h1 className="text-[20px] font-extrabold text-white">Player Props</h1>
          <p className="text-[13px] text-zinc-500">
            Recomendações por jogador (artilheiro, chutes no gol) organizadas por jogo —
            taxa do jogador na temporada × força do adversário.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
          {MARKET_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setMarket(f.id)}
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${
                market === f.id ? 'bg-brand-500/20 text-brand-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {allMatches.length > 1 && (
          <select
            value={matchFilter}
            onChange={e => setMatchFilter(e.target.value)}
            className="text-[12px] font-semibold px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 focus:outline-none focus:border-white/[0.16]"
          >
            <option value="">Todos os jogos</option>
            {allMatches.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        )}

        <button
          onClick={load}
          className="ml-auto text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
        >
          ↻
        </button>
      </div>

      {error && (
        <InlineError
          title="Falha ao carregar as props"
          description="Verifique a conexão com o backend e tente novamente."
          onRetry={load}
        />
      )}

      {props === null ? (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-56 rounded-lg" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-48 rounded-2xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <SectionEmpty icon="🎯" text="Nenhuma player prop para os filtros selecionados." />
      ) : (
        <div className="space-y-7">
          {groups.map(g => (
            <section key={g.matchId} className="space-y-3">
              {/* Cabeçalho do jogo */}
              <div className="flex items-center gap-3 flex-wrap border-b border-white/[0.06] pb-2">
                <h2 className="text-[16px] font-extrabold text-white">{g.match}</h2>
                {kickoffLabel(g.kickoff) && (
                  <span className="text-[12px] text-zinc-500">{kickoffLabel(g.kickoff)}</span>
                )}
                {g.group && g.group.length <= 2 && <Pill tone="neutral">Grupo {g.group}</Pill>}
                <span className="ml-auto text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                  {g.picks.length} {g.picks.length === 1 ? 'dica' : 'dicas'}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.picks.map((r, i) => (
                  <PropCard key={`${g.matchId}-${r.selection}-${i}`} rec={r} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
