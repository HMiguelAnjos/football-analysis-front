// ─── LivePicksPage — entradas ao vivo dos analistas (pública) ─────────────────
// Usuários visualizam as entradas publicadas pelos analistas em tempo real.
// Somente leitura. Polling leve de 30s + refresh manual.

import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import type { FootballLivePick } from '../types'
import LivePickCard from '../components/LivePickCard'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { InlineError } from '../components/States'
import { useVisiblePolling } from '../hooks/useVisiblePolling'

export default function LivePicksPage() {
  const [picks, setPicks] = useState<FootballLivePick[] | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await api.getLivePicks()
      setPicks(r.data)
      setError(false)
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useVisiblePolling(load, 30_000, [load], { skipFirstRun: true })

  // Ativas primeiro.
  const sorted = picks
    ? [...picks].sort((a, b) => (a.status === 'active' ? -1 : 1) - (b.status === 'active' ? -1 : 1))
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Entradas ao vivo
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Entradas publicadas pelos nossos analistas em tempo real. Atualiza sozinho a cada 30s.
          </p>
        </div>
        <button
          onClick={load}
          className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
        >
          ↻ Atualizar
        </button>
      </header>

      {error && (
        <InlineError
          title="Falha ao carregar as entradas"
          description="Tentando novamente automaticamente."
          onRetry={load}
        />
      )}

      {sorted === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : sorted.length === 0 ? (
        <SectionEmpty icon="📣" text="Nenhuma entrada ativa no momento. Quando um analista publicar, ela aparece aqui." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map(p => <LivePickCard key={p.id} pick={p} />)}
        </div>
      )}
    </div>
  )
}
