// ─── LiveShotsPage — especialista em CHUTES A GOL ao vivo ────────────────────
// Foco do produto: durante os jogos, mostra os jogadores mais prováveis de
// (continuar a) chutar no gol — taxa da temporada + ritmo no jogo + pressão do
// time. Atualiza sozinho.

import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import type { FootballRecommendation } from '../types'
import RecommendationCard from '../components/RecommendationCard'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { InlineError } from '../components/States'

const REFRESH_MS = 30_000

export default function LiveShotsPage() {
  const [recs, setRecs] = useState<FootballRecommendation[] | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await api.getLiveShots({ limit: 50 })
      setRecs(r.data)
      setError(false)
    } catch {
      setError(true)
      setRecs([])
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[20px] font-extrabold text-white flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Chutes a Gol — Ao Vivo
          </h1>
          <p className="text-[13px] text-zinc-500">
            Jogadores mais prováveis de chutar no gol agora — taxa do jogador +
            ritmo no jogo + pressão do time. Atualiza a cada 30s.
          </p>
        </div>
        <button
          onClick={load}
          className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
        >
          ↻ Atualizar
        </button>
      </div>

      {error && (
        <InlineError
          title="Falha ao carregar os chutes ao vivo"
          description="Verifique a conexão com o backend e tente novamente."
          onRetry={load}
        />
      )}

      {recs === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : recs.length === 0 ? (
        <SectionEmpty icon="🎯" text="Nenhum jogo ao vivo agora. Quando uma partida começar, os jogadores chutando no gol aparecem aqui em tempo real." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recs.map((r, i) => <RecommendationCard key={`${r.match_id}-${r.selection}-${i}`} rec={r} />)}
        </div>
      )}
    </div>
  )
}
