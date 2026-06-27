// ─── MatchesPage — lista de partidas com filtros ─────────────────────────────
// Filtros: data, liga e status. Polling leve quando há jogos ao vivo.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { FootballLeague, FootballMatch } from '../types'
import MatchList from '../components/MatchList'
import PageHeader from '../components/PageHeader'
import LeagueFilter from '../components/LeagueFilter'
import DateFilter from '../components/DateFilter'
import { selectCls } from '../components/filterStyles'
import { InlineError } from '../components/States'
import { useVisiblePolling } from '../hooks/useVisiblePolling'
import { useCompetition } from '../hooks/useCompetition'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'scheduled', label: 'Agendados' },
  { value: 'live', label: 'Ao vivo' },
  { value: 'finished', label: 'Encerrados' },
]

export default function MatchesPage() {
  const { isWorldCup } = useCompetition()
  const [matches, setMatches] = useState<FootballMatch[] | null>(null)
  const [leagues, setLeagues] = useState<FootballLeague[]>([])
  const [error, setError] = useState(false)

  const [date, setDate] = useState('')
  const [leagueId, setLeagueId] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    // Na Copa não há filtro de liga (competição única).
    if (isWorldCup) return
    api.getLeagues().then(r => setLeagues(r.data)).catch(() => setLeagues([]))
  }, [isWorldCup])

  const load = useCallback(async () => {
    try {
      const r = await api.getMatches({
        date: date || undefined,
        league_id: leagueId || undefined,
        status: status || undefined,
      })
      setMatches(r.data.matches ?? [])
      setError(false)
    } catch {
      setError(true)
      setMatches([])
    }
  }, [date, leagueId, status])

  useEffect(() => {
    setMatches(null)
    load()
  }, [load])

  const hasLive = useMemo(
    () => (matches ?? []).some(m => m.status === 'live' || m.status === 'halftime'),
    [matches],
  )
  useVisiblePolling(load, hasLive ? 30_000 : 120_000, [load, hasLive], { skipFirstRun: true })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <PageHeader title="Jogos" subtitle="Partidas por data, liga e status — clique em um jogo para a análise completa." />
      <div className="flex flex-wrap items-center gap-2.5">
        <DateFilter value={date} onChange={setDate} />
        {!isWorldCup && (
          <LeagueFilter leagues={leagues} value={leagueId} onChange={setLeagueId} />
        )}
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ colorScheme: 'dark' }}
          className={selectCls}
          aria-label="Filtrar por status"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={load}
          className="ml-auto text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
        >
          ↻ Atualizar
        </button>
      </div>

      {error && (
        <InlineError
          title="Falha ao carregar as partidas"
          description="Verifique a conexão com o backend e tente novamente."
          onRetry={load}
        />
      )}

      <MatchList matches={matches} />
    </div>
  )
}
