// ─── GroupsPage — fase de grupos da Copa do Mundo ────────────────────────────
// Mostra cada grupo com sua classificação. Só faz sentido no contexto Copa.

import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { WorldCupGroup } from '../types'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import { SectionEmpty } from '../components/dashboard/parts'

function FormDots({ form }: { form?: string | null }) {
  if (!form) return null
  const color = (r: string) =>
    r === 'W' ? 'bg-emerald-500/80' : r === 'D' ? 'bg-zinc-500/70' : 'bg-red-500/70'
  return (
    <span className="inline-flex gap-0.5">
      {form.slice(0, 5).split('').map((r, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${color(r.toUpperCase())}`} title={r} />
      ))}
    </span>
  )
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<WorldCupGroup[] | null>(null)
  const [error, setError] = useState(false)

  const load = () => {
    setGroups(null)
    setError(false)
    api.getGroups()
      .then(r => setGroups(r.data))
      .catch(() => { setError(true); setGroups([]) })
  }
  useEffect(load, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {error && <ErrorState title="Não foi possível carregar os grupos" onRetry={load} />}

      {groups === null ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : groups.length === 0 ? (
        <SectionEmpty icon="🏆" text="Grupos ainda não disponíveis para esta competição." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map(g => (
            <div key={g.name} className="card-premium overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand-500/15 text-brand-300 text-[12px] font-extrabold">
                  {g.name.replace(/group/i, '').trim() || g.name.slice(0, 1)}
                </span>
                <span className="text-[14px] font-bold text-white">{g.name}</span>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-zinc-500 text-[10px] uppercase tracking-wider">
                    <th className="text-left font-semibold pl-4 py-2 w-6">#</th>
                    <th className="text-left font-semibold py-2">Seleção</th>
                    <th className="text-center font-semibold py-2 w-8">P</th>
                    <th className="text-center font-semibold py-2 w-8">J</th>
                    <th className="text-center font-semibold py-2 w-8">SG</th>
                    <th className="text-right font-semibold pr-4 py-2">Forma</th>
                  </tr>
                </thead>
                <tbody>
                  {g.standings.map((s, idx) => (
                    <tr
                      key={s.team.id}
                      className={`border-t border-white/[0.04] ${idx < 2 ? 'bg-emerald-500/[0.04]' : ''}`}
                    >
                      <td className="pl-4 py-2 text-zinc-500 font-semibold">{s.rank}</td>
                      <td className="py-2">
                        <span className="flex items-center gap-2 min-w-0">
                          {s.team.logo_url && <img src={s.team.logo_url} alt="" className="w-4 h-4 object-contain" loading="lazy" />}
                          <span className="text-zinc-100 font-semibold truncate">{s.team.name}</span>
                        </span>
                      </td>
                      <td className="text-center py-2 text-white font-bold">{s.points}</td>
                      <td className="text-center py-2 text-zinc-400">{s.played}</td>
                      <td className="text-center py-2 text-zinc-400">{s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}</td>
                      <td className="pr-4 py-2 text-right"><FormDots form={s.form} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 border-t border-white/[0.04] text-[10px] text-zinc-600">
                <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500/40 mr-1.5 align-middle" />
                2 primeiros avançam ao mata-mata
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
