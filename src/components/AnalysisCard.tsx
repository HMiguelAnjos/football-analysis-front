// ─── AnalysisCard — recomendação da engine de scores (expansível) ────────────
// Mostra grade, confiança, risco, motivos e (ao expandir) as barras de score +
// warnings. Usado nos modos "Análise" do Pré-Jogo e do Ao Vivo.

import { useState } from 'react'
import type { AnalysisRecommendation } from '../types'
import { marketLabel } from '../lib/markets'

const GRADE_CLS: Record<string, string> = {
  'A+': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  A: 'bg-green-500/20 text-green-300 border-green-500/40',
  B: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  C: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  AVOID: 'bg-red-500/15 text-red-300 border-red-500/30',
}

// Ordem + rótulo dos scores exibidos (só aparecem os não-nulos).
const SCORES: [string, string][] = [
  ['offensiveThreat', 'Ataque'],
  ['creation', 'Criação'],
  ['defensiveFragility', 'Defesa vulnerável'],
  ['matchup', 'Matchup'],
  ['momentum', 'Momento'],
  ['pressure', 'Pressão'],
  ['cornersPressure', 'Escanteios'],
  ['cardsTension', 'Cartões'],
  ['efficiency', 'Eficiência'],
  ['liveGameState', 'Estado do jogo'],
  ['risk', 'Risco'],
]

function barColor(key: string): string {
  if (key === 'risk') return 'bg-red-400'
  if (key === 'defensiveFragility') return 'bg-orange-400'
  return 'bg-brand-400'
}

function ScoreBar({ label, value, k }: { label: string; value: number; k: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-zinc-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full ${barColor(k)}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
      <span className="text-[11px] font-bold text-zinc-300 w-7 text-right">{Math.round(value)}</span>
    </div>
  )
}

export default function AnalysisCard({ rec, hideMatch = false }: {
  rec: AnalysisRecommendation
  hideMatch?: boolean
}) {
  const [open, setOpen] = useState(false)
  const gradeCls = GRADE_CLS[rec.grade] ?? GRADE_CLS.AVOID
  const lineTxt = rec.line != null ? ` ${rec.line % 1 === 0 ? rec.line : rec.line.toFixed(1)}` : ''
  const bars = SCORES
    .map(([k, label]) => ({ k, label, value: rec.raw_scores?.[k] }))
    .filter(b => b.value != null) as { k: string; label: string; value: number }[]

  return (
    <article className="card-premium p-4 flex flex-col gap-2.5">
      {/* Topo: grade + mercado/seleção | confiança */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-extrabold border ${gradeCls}`}>
              {rec.grade}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              {marketLabel(rec.market)}
            </span>
          </div>
          <h3 className="text-[14px] font-extrabold text-white mt-1 truncate">
            {rec.selection}{lineTxt}
          </h3>
          {!hideMatch && (
            <p className="text-[12px] text-zinc-500 truncate">{rec.match ?? '—'}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[18px] font-extrabold text-brand-300 leading-none">{Math.round(rec.confidence)}</div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">confiança</div>
        </div>
      </div>

      {/* Edge × Risco */}
      <div className="flex items-center gap-3 text-[11px]">
        <span className="text-zinc-400">Edge <b className="text-zinc-200">{Math.round(rec.edge_score)}</b></span>
        <span className="text-zinc-400">Risco <b className={rec.risk_score >= 55 ? 'text-red-300' : 'text-zinc-200'}>{Math.round(rec.risk_score)}</b></span>
        {rec.odd != null && <span className="text-zinc-400">Odd <b className="text-zinc-200">{rec.odd.toFixed(2)}</b></span>}
      </div>

      {/* Motivos (sempre 1-2) */}
      {rec.reasons.length > 0 && (
        <ul className="space-y-0.5">
          {rec.reasons.slice(0, open ? rec.reasons.length : 2).map((r, i) => (
            <li key={i} className="text-[12px] text-zinc-300 flex gap-1.5">
              <span className="text-brand-400 shrink-0">›</span>{r}
            </li>
          ))}
        </ul>
      )}

      {/* Expandido: barras de score + warnings */}
      {open && (
        <div className="space-y-1.5 pt-1.5 border-t border-white/[0.06]">
          {bars.map(b => <ScoreBar key={b.k} label={b.label} value={b.value} k={b.k} />)}
          {rec.warnings.length > 0 && (
            <ul className="space-y-0.5 pt-1.5">
              {rec.warnings.map((w, i) => (
                <li key={i} className="text-[11px] text-amber-300/80 flex gap-1.5">
                  <span className="shrink-0">⚠</span>{w}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="self-start text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-brand-300 transition-colors"
      >
        {open ? '− Recolher' : '+ Ver análise'}
      </button>
    </article>
  )
}
