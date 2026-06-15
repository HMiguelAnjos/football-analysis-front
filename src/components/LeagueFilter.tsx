import type { FootballLeague } from '../types'
import { selectCls } from './filterStyles'

// ─── Filtro de liga/campeonato ───────────────────────────────────────────────
// value '' = todas. Reutilizável em Jogos, Recomendações, Odds, etc.

export default function LeagueFilter({
  leagues,
  value,
  onChange,
  className = '',
}: {
  leagues: FootballLeague[]
  value: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ colorScheme: 'dark' }}
      className={`${selectCls} ${className}`}
      aria-label="Filtrar por liga"
    >
      <option value="">Todas as ligas</option>
      {leagues.map(l => (
        <option key={l.id} value={String(l.id)}>
          {l.name}
          {l.country ? ` · ${l.country}` : ''}
        </option>
      ))}
    </select>
  )
}
