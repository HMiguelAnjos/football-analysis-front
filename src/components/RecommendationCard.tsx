import type { FootballRecommendation } from '../types'
import { marketLabel } from '../lib/markets'
import {
  confidenceMeta,
  formatEdge,
  formatOdd,
  formatPct,
  impliedProb,
  recommendationEdge,
  timeAgo,
} from '../lib/odds'

// ─── Card de recomendação do modelo (somente leitura) ────────────────────────
// Mostra jogo, mercado, seleção, linha, odd, odd justa, probabilidades, edge,
// confiança e motivo. Reutilizado em Recomendações e na tela de análise.

const EDGE_TONE: Record<'accent' | 'red' | 'neutral', string> = {
  accent: 'text-accent-400',
  red: 'text-red-400',
  neutral: 'text-zinc-400',
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5">
      <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">{label}</div>
      <div className={`text-[13px] font-bold tabular ${tone ?? 'text-zinc-200'}`}>{value}</div>
    </div>
  )
}

export default function RecommendationCard({ rec }: { rec: FootballRecommendation }) {
  const conf = confidenceMeta(rec.confidence as string | null | undefined)
  const hasOdds = rec.odd != null
  const edge = recommendationEdge(rec)
  const edgeFmt = formatEdge(edge)
  const implied = rec.implied_prob ?? impliedProb(rec.odd)

  return (
    <article className="card-premium p-5 flex flex-col gap-3">
      {/* Topo: jogo + liga | confiança */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold text-white truncate">{rec.match}</h3>
          <p className="text-[12px] text-zinc-500">{rec.league ?? '—'}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          {rec.tag && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-violet-500/15 text-violet-200 border-violet-500/30">
              {rec.tag}
            </span>
          )}
          {conf && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${conf.cls}`}>
              {conf.label}
            </span>
          )}
        </div>
      </div>

      {/* Seleção + mercado */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-baseline gap-1.5 rounded-xl px-3 py-2 leading-none border bg-brand-500/10 border-brand-500/30 text-brand-200">
          <span className="text-[13px] font-extrabold">{rec.selection}</span>
          {rec.line != null && <span className="text-[18px] font-extrabold tabular">{rec.line}</span>}
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-zinc-200">{marketLabel(rec.market)}</div>
          {hasOdds && (
            <div className="text-[11px] text-zinc-500">
              odd <span className="text-zinc-300 font-bold tabular">{formatOdd(rec.odd)}</span>
              {rec.bookmaker ? ` · ${rec.bookmaker}` : ''}
            </div>
          )}
        </div>
      </div>

      {hasOdds ? (
        /* Modo VALOR (com odds): probabilidades + edge */
        <div className="grid grid-cols-4 gap-1.5">
          <Stat label="Prob. modelo" value={formatPct(rec.model_prob)} />
          <Stat label="Prob. impl." value={formatPct(implied)} />
          <Stat label="Odd justa" value={formatOdd(rec.fair_odd)} />
          <Stat label="Edge" value={edgeFmt.text} tone={EDGE_TONE[edgeFmt.tone]} />
        </div>
      ) : (
        /* Modo PREVISÃO (sem odds): chance de acontecer em destaque */
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Chance de acontecer</div>
          <div className="text-[22px] font-extrabold tabular text-accent-400 leading-none mt-0.5">
            {formatPct(rec.model_prob)}
          </div>
        </div>
      )}

      {/* Motivo */}
      {rec.reason && (
        <p className="text-[13px] text-zinc-400 leading-relaxed border-l-2 border-brand-500/40 pl-3">
          {rec.reason}
        </p>
      )}

      {/* Rodapé */}
      <div className="mt-auto pt-1 flex items-center justify-between text-[11px] text-zinc-600">
        <span>
          {rec.created_by_name ? <>por <span className="text-zinc-400 font-semibold">{rec.created_by_name}</span></> : 'modelo'}
        </span>
        <span>{timeAgo(rec.created_at)}</span>
      </div>
    </article>
  )
}
