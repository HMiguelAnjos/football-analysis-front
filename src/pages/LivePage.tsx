// ─── LivePage — recomendações AO VIVO ────────────────────────────────────────
// Foco em ESCANTEIOS (corner-first), + chutes a gol e mercados in-play.
// Atualiza sozinho a cada 30s.

import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import type { FootballRecommendation, LiveReco } from '../types'
import RecommendationCard from '../components/RecommendationCard'
import LiveRecoCard from '../components/LiveRecoCard'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { InlineError } from '../components/States'

const REFRESH_MS = 30_000

type Tab = 'escanteios' | 'gols' | 'chutes' | 'mercados'

const DESC: Record<Tab, string> = {
  escanteios: 'Entradas de escanteios pela pressão ofensiva, ataques na área e ritmo do jogo. Atualiza a cada 30s.',
  gols: 'Jogadores que ainda podem marcar agora — taxa de gol + pressão do time + batedor de pênalti. Atualiza a cada 30s.',
  chutes: 'Jogadores mais prováveis de chutar no gol agora — taxa + ritmo + pressão. Atualiza a cada 30s.',
  mercados: 'Valor recalculado pelo placar e minuto de cada jogo. Atualiza a cada 30s.',
}

export default function LivePage() {
  const [tab, setTab] = useState<Tab>('escanteios')
  const [corners, setCorners] = useState<LiveReco[] | null>(null)
  const [recs, setRecs] = useState<FootballRecommendation[] | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      if (tab === 'escanteios') {
        const r = await api.getLiveRecs()
        setCorners(r.data)
      } else if (tab === 'gols') {
        const r = await api.getLiveGoals({ limit: 50 })
        setRecs(r.data)
      } else if (tab === 'chutes') {
        const r = await api.getLiveShots({ limit: 50 })
        setRecs(r.data)
      } else {
        const r = await api.getLiveOpportunities({ limit: 40 })
        setRecs(r.data)
      }
      setError(false)
    } catch {
      setError(true)
      setCorners([])
      setRecs([])
    }
  }, [tab])

  useEffect(() => {
    setCorners(null)
    setRecs(null)
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  const loading = tab === 'escanteios' ? corners === null : recs === null
  const empty = tab === 'escanteios' ? corners?.length === 0 : recs?.length === 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[20px] font-extrabold text-white flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Ao Vivo
          </h1>
          <p className="text-[13px] text-zinc-500">{DESC[tab]}</p>
        </div>
        <button
          onClick={load}
          className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] transition-colors"
        >
          ↻ Atualizar
        </button>
      </div>

      <div className="flex gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] w-fit">
        {([['escanteios', 'Escanteios'], ['gols', 'Gols'], ['chutes', 'Chutes a Gol'], ['mercados', 'Mercados']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`text-[12px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-md transition-colors ${
              tab === id ? 'bg-brand-500/20 text-brand-300' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <InlineError
          title="Falha ao carregar as entradas ao vivo"
          description="Verifique a conexão com o backend e tente novamente."
          onRetry={load}
        />
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : empty ? (
        <SectionEmpty
          icon="📡"
          text={tab === 'escanteios'
            ? 'Nenhuma entrada de escanteios no momento. Quando um jogo ganhar pressão, as entradas aparecem aqui.'
            : 'Nenhuma entrada ao vivo no momento. Quando uma partida começar, aparece aqui.'}
        />
      ) : tab === 'escanteios' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {corners!.map(r => <LiveRecoCard key={r.id} rec={r} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recs!.map((r, i) => <RecommendationCard key={`${r.match_id}-${r.market}-${r.selection}-${i}`} rec={r} />)}
        </div>
      )}
    </div>
  )
}
