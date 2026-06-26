import type { LiveReco } from '../types'
import { Pill } from './dashboard/parts'

// ─── Card de recomendação AO VIVO (foco escanteios) ──────────────────────────
// Destaca tipo de entrada, mercado, confiança (0-10), minuto, motivo e o
// resultado depois (green/red/void/pending).

const TYPE_LABEL: Record<string, string> = {
  corners_over: 'Over escanteios',
  team_corners_over: 'Escanteios do time',
  next_corner: 'Próximo escanteio',
  shots_on_target: 'Chutes no gol',
  goal_pressure: 'Pressão de gol',
  avoid_entry: 'Evitar entrada',
}

const RESULT_META: Record<string, { label: string; cls: string }> = {
  green: { label: 'GREEN', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  red: { label: 'RED', cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
  void: { label: 'VOID', cls: 'bg-white/[0.06] text-zinc-400 border-white/10' },
  pending: { label: 'PENDENTE', cls: 'bg-amber-500/12 text-amber-300 border-amber-500/30' },
}

function confTone(c: number): 'accent' | 'brand' | 'neutral' {
  if (c >= 8) return 'accent'
  if (c >= 6) return 'brand'
  return 'neutral'
}

export default function LiveRecoCard({ rec }: { rec: LiveReco }) {
  const res = RESULT_META[rec.result] ?? RESULT_META.pending
  const stats = rec.stats_used ?? {}

  return (
    <article className="card-premium p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold text-white truncate">
            {rec.home_team} x {rec.away_team}
          </h3>
          <p className="text-[12px] text-zinc-500">
            {rec.minute != null && (
              <span className="text-red-400 font-bold">{rec.minute}' </span>
            )}
            {rec.home_score != null && `· ${rec.home_score}-${rec.away_score} `}
            {rec.league ? `· ${rec.league}` : ''}
          </p>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${res.cls}`}>
          {res.label}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Pill tone="brand">{TYPE_LABEL[rec.type] ?? rec.type}</Pill>
        <span className="text-[14px] font-extrabold text-zinc-100">{rec.market}</span>
        {rec.odd != null && <span className="text-[12px] text-zinc-500">odd {rec.odd.toFixed(2)}</span>}
      </div>

      {/* Confiança 0-10 */}
      <div className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
        <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Confiança</div>
        <Pill tone={confTone(rec.confidence)}>{rec.confidence.toFixed(1)} / 10</Pill>
      </div>

      {rec.reason && (
        <p className="text-[13px] text-zinc-400 leading-relaxed border-l-2 border-brand-500/40 pl-3">
          {rec.reason}
        </p>
      )}

      {/* Estatísticas usadas (transparência) */}
      {Object.keys(stats).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(stats).slice(0, 6).map(([k, v]) => (
            <span key={k} className="text-[10px] text-zinc-500 bg-white/[0.03] border border-white/[0.06] rounded px-1.5 py-0.5">
              {k.replace(/_/g, ' ')}: <span className="text-zinc-300 font-semibold">{String(v)}</span>
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
