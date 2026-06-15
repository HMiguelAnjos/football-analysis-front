import type { FootballMatch } from '../types'
import MatchCard from './MatchCard'
import { SkeletonGameGrid } from './Skeleton'
import { SectionEmpty } from './dashboard/parts'
import { sortMatches } from '../lib/match'

// ─── Grade de partidas ───────────────────────────────────────────────────────
// loading null = skeleton. Ordena ao vivo → agendado → encerrado.

export default function MatchList({
  matches,
  loading = false,
  emptyText = 'Nenhuma partida encontrada para os filtros selecionados.',
}: {
  matches: FootballMatch[] | null
  loading?: boolean
  emptyText?: string
}) {
  if (loading || matches === null) return <SkeletonGameGrid count={6} />
  if (matches.length === 0) return <SectionEmpty icon="📅" text={emptyText} />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortMatches(matches).map(m => (
        <MatchCard key={m.id} match={m} />
      ))}
    </div>
  )
}
