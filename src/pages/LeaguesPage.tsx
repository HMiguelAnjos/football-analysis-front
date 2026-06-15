// ─── LeaguesPage — ligas/campeonatos cobertos ────────────────────────────────
// Lista as ligas configuradas no backend com cards de resumo + busca.

import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { FootballLeague } from '../types'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { selectCls } from '../components/filterStyles'

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<FootballLeague[] | null>(null)
  const [error, setError] = useState(false)
  const [q, setQ] = useState('')

  const load = () => {
    setLeagues(null)
    setError(false)
    api.getLeagues()
      .then(r => setLeagues(r.data))
      .catch(() => { setError(true); setLeagues([]) })
  }
  useEffect(load, [])

  const filtered = useMemo(() => {
    if (!leagues) return null
    const t = q.trim().toLowerCase()
    if (!t) return leagues
    return leagues.filter(l =>
      l.name.toLowerCase().includes(t) || (l.country ?? '').toLowerCase().includes(t),
    )
  }, [leagues, q])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar liga ou país…"
          className={`${selectCls} w-full sm:w-72`}
        />
      </div>

      {error && <ErrorState title="Não foi possível carregar as ligas" onRetry={load} />}

      {filtered === null ? (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <SectionEmpty icon="🏆" text="Nenhuma liga encontrada." />
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map(l => (
            <div key={l.id} className="card-premium p-4 flex flex-col gap-1">
              <div className="flex items-center gap-2 min-w-0">
                {l.logo_url && <img src={l.logo_url} alt="" className="w-6 h-6 object-contain" loading="lazy" />}
                <span className="text-[14px] font-bold text-white truncate">{l.name}</span>
              </div>
              <span className="text-[11px] text-zinc-500">{l.country}</span>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-500">
                {l.matches_today != null && <span className="text-brand-300 font-semibold">{l.matches_today} hoje</span>}
                {l.teams_count != null && <span>{l.teams_count} times</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
