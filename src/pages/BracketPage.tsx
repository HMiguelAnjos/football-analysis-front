// ─── BracketPage — chaveamento do mata-mata da Copa ──────────────────────────

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { WorldCupBracketStage, WorldCupBracketTie } from '../types'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { SectionEmpty } from '../components/dashboard/parts'

function TeamRow({ tie, side }: { tie: WorldCupBracketTie; side: 'home' | 'away' }) {
  const team = side === 'home' ? tie.home : tie.away
  const score = side === 'home' ? tie.home_score : tie.away_score
  const pen = side === 'home' ? tie.penalty_home : tie.penalty_away
  const isWinner = tie.winner === side
  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${isWinner ? 'text-white font-bold' : 'text-zinc-400'}`}>
      {team.logo_url && <img src={team.logo_url} alt="" className="w-4 h-4 object-contain" loading="lazy" />}
      <span className="text-[13px] truncate flex-1">{team.name || '—'}</span>
      {pen != null && <span className="text-[10px] text-zinc-500">pen {pen}</span>}
      <span className={`text-[13px] tabular-nums w-5 text-right ${isWinner ? 'text-brand-300' : ''}`}>
        {score ?? '–'}
      </span>
    </div>
  )
}

function TieCard({ tie }: { tie: WorldCupBracketTie }) {
  const decided = tie.status === 'finished'
  return (
    <Link
      to={`/jogos/${tie.match_id}`}
      className="card-premium block hover:border-white/[0.14] transition-colors divide-y divide-white/[0.05]"
    >
      <TeamRow tie={tie} side="home" />
      <TeamRow tie={tie} side="away" />
      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
        {decided ? 'Encerrado' : tie.status === 'live' ? 'Ao vivo' : 'A definir'}
      </div>
    </Link>
  )
}

export default function BracketPage() {
  const [stages, setStages] = useState<WorldCupBracketStage[] | null>(null)
  const [error, setError] = useState(false)

  const load = () => {
    setStages(null)
    setError(false)
    api.getBracket()
      .then(r => setStages(r.data))
      .catch(() => { setError(true); setStages([]) })
  }
  useEffect(load, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {error && <ErrorState title="Não foi possível carregar o chaveamento" onRetry={load} />}

      {stages === null ? (
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 w-64 shrink-0 rounded-2xl" />)}
        </div>
      ) : stages.length === 0 ? (
        <SectionEmpty icon="🏆" text="O mata-mata ainda não começou." />
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-4">
          {stages.map(st => (
            <div key={st.stage} className="shrink-0 w-64 space-y-3">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-brand-300 px-1">
                {st.label}
              </h3>
              <div className="space-y-3">
                {st.ties.map(t => <TieCard key={t.match_id} tie={t} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
