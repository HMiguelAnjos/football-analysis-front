// ─── TeamsPage — busca e estatísticas de times ───────────────────────────────
// Busca por nome (debounce) + filtro de liga. Cards de estatística por time.

import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { FootballLeague, FootballTeam } from '../types'
import TeamStatsCard from '../components/TeamStatsCard'
import LeagueFilter from '../components/LeagueFilter'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { selectCls } from '../components/filterStyles'

export default function TeamsPage() {
  const [teams, setTeams] = useState<FootballTeam[] | null>(null)
  const [leagues, setLeagues] = useState<FootballLeague[]>([])
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [leagueId, setLeagueId] = useState('')

  useEffect(() => {
    api.getLeagues().then(r => setLeagues(r.data)).catch(() => setLeagues([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setTeams(null)
    setError(false)
    const t = setTimeout(() => {
      api.getTeams({ search: search.trim() || undefined, league_id: leagueId || undefined })
        .then(r => { if (!cancelled) setTeams(r.data) })
        .catch(() => { if (!cancelled) { setError(true); setTeams([]) } })
    }, 350)
    return () => { cancelled = true; clearTimeout(t) }
  }, [search, leagueId])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar time…"
          className={`${selectCls} w-full sm:w-64`}
        />
        <LeagueFilter leagues={leagues} value={leagueId} onChange={setLeagueId} />
      </div>

      {error && <ErrorState title="Não foi possível carregar os times" onRetry={() => setSearch(s => s + ' ')} />}

      {teams === null ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : teams.length === 0 ? (
        <SectionEmpty icon="🛡" text="Nenhum time encontrado para os filtros." />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map(t => <TeamStatsCard key={t.id} team={t} />)}
        </div>
      )}
    </div>
  )
}
