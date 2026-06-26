// ─── LiveResultsAdminPage — liquidar recomendações ao vivo (analista) ────────
// Lista as recomendações ao vivo pendentes e permite marcar o resultado
// (green/red/void) em 1 clique. Settlement de over escanteios é automático;
// esta tela cobre os tipos que precisam de conferência manual.

import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import type { LiveReco } from '../types'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { InlineError } from '../components/States'

const TYPE_LABEL: Record<string, string> = {
  corners_over: 'Over escanteios',
  team_corners_over: 'Escanteios do time',
  next_corner: 'Próximo escanteio',
  shots_on_target: 'Chutes no gol',
  goal_pressure: 'Pressão de gol',
}

export default function LiveResultsAdminPage() {
  const [recs, setRecs] = useState<LiveReco[] | null>(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const r = await api.getLiveRecs()
      setRecs(r.data)
      setError(false)
    } catch {
      setError(true)
      setRecs([])
    }
  }, [])

  useEffect(() => { load() }, [load])

  const mark = async (id: number, result: 'green' | 'red' | 'void') => {
    setBusy(id)
    try {
      await api.setLiveRecResult(id, result)
      setRecs(prev => (prev ?? []).filter(r => r.id !== id))   // sai dos pendentes
    } catch {
      /* mantém na lista se falhar */
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[20px] font-extrabold text-white">Resultados ao Vivo</h1>
          <p className="text-[13px] text-zinc-500">
            Liquide as recomendações pendentes. Over escanteios fecha sozinho ao
            fim do jogo; os demais tipos você marca aqui.
          </p>
        </div>
        <button
          onClick={load}
          className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
        >
          ↻
        </button>
      </div>

      {error && (
        <InlineError title="Falha ao carregar" description="Tente novamente." onRetry={load} />
      )}

      {recs === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : recs.length === 0 ? (
        <SectionEmpty icon="✅" text="Nenhuma recomendação pendente." />
      ) : (
        <div className="space-y-2.5">
          {recs.map(r => (
            <div key={r.id} className="card-premium p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-white truncate">
                  {r.home_team} x {r.away_team}
                  {r.minute != null && <span className="text-zinc-500 font-normal"> · {r.minute}'</span>}
                </div>
                <div className="text-[12px] text-zinc-400 truncate">
                  <span className="text-brand-300 font-semibold">{TYPE_LABEL[r.type] ?? r.type}</span>
                  {' · '}{r.market} · conf {r.confidence.toFixed(1)}/10
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {(['green', 'red', 'void'] as const).map(res => (
                  <button
                    key={res}
                    disabled={busy === r.id}
                    onClick={() => mark(r.id, res)}
                    className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border transition-colors disabled:opacity-40 ${
                      res === 'green' ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15'
                      : res === 'red' ? 'border-red-500/30 text-red-300 hover:bg-red-500/15'
                      : 'border-white/10 text-zinc-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
