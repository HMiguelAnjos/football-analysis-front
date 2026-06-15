import { Link } from 'react-router-dom'
import type { FootballMatch } from '../types'
import TeamBadge from './TeamBadge'
import { Pill } from './dashboard/parts'
import { formatKickoffTime, hasScore, scoreline, statusMeta } from '../lib/match'
import { formatOdd } from '../lib/odds'

// ─── Card de uma partida ─────────────────────────────────────────────────────
// Liga + horário/status, mandante x visitante (escudos), placar quando rolando,
// odds 1x2 e CTA pra tela de análise. Reutilizável em Jogos e Dashboard.

function OddCell({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="flex-1 rounded-lg bg-white/[0.03] border border-white/[0.06] px-2 py-1.5 text-center">
      <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">{label}</div>
      <div className="text-[13px] font-bold tabular text-zinc-200">{formatOdd(value)}</div>
    </div>
  )
}

export default function MatchCard({ match }: { match: FootballMatch }) {
  const st = statusMeta(match.status, match.minute)
  const showScore = hasScore(match)
  const odds = match.odds

  return (
    <article className="card-premium p-4 flex flex-col gap-3">
      {/* Topo: liga · status */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-[11px] font-semibold text-zinc-500 truncate">
          {match.league_name ?? 'Liga'}
          {match.country ? ` · ${match.country}` : ''}
        </span>
        <Pill tone={st.tone}>
          {st.live && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse-subtle" />}
          {st.label}
        </Pill>
      </div>

      {/* Times + placar/horário */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 min-w-0">
            <TeamBadge team={match.home} size="sm" />
            <span className="text-[14px] font-semibold text-white truncate">{match.home.name}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <TeamBadge team={match.away} size="sm" />
            <span className="text-[14px] font-semibold text-white truncate">{match.away.name}</span>
          </div>
        </div>
        <div className="shrink-0 text-center">
          {showScore ? (
            <div className="text-2xl font-extrabold tabular text-white leading-none">
              {scoreline(match)}
            </div>
          ) : (
            <div className="text-[15px] font-bold tabular text-zinc-300 leading-none">
              {formatKickoffTime(match.kickoff)}
            </div>
          )}
        </div>
      </div>

      {/* Odds 1x2 */}
      {odds && (odds.home != null || odds.draw != null || odds.away != null) && (
        <div className="flex gap-1.5">
          <OddCell label="Casa" value={odds.home} />
          <OddCell label="Empate" value={odds.draw} />
          <OddCell label="Fora" value={odds.away} />
        </div>
      )}

      {/* CTA */}
      <Link
        to={`/jogos/${match.id}`}
        className="mt-auto text-center text-[12px] font-bold uppercase tracking-wider py-2 rounded-lg
                   border border-white/[0.08] text-zinc-300 hover:text-white hover:border-brand-500/40
                   hover:bg-brand-500/5 transition-colors"
      >
        Ver análise
      </Link>
    </article>
  )
}
