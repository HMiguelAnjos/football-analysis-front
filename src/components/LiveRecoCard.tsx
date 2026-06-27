// ─── Card de recomendação AO VIVO (foco escanteios) — visual unificado ────────
// Cabeçalho (jogo + bandeiras + AO VIVO + placar + resultado), entrada em
// destaque, confiança (0-10) com medidor, motivo e tiles das stats usadas.

import type { LiveReco } from '../types'
import { Gauge, GradeBadge, StatTile, TeamFlags, gradeFromPct, type Tile } from './cards/parts'

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

export default function LiveRecoCard({ rec }: { rec: LiveReco }) {
  const res = RESULT_META[rec.result] ?? RESULT_META.pending
  const meta = gradeFromPct((rec.confidence ?? 0) * 10)
  const tiles: Tile[] = Object.entries(rec.stats_used ?? {})
    .slice(0, 6)
    .map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: String(v) }))

  return (
    <article className="card-premium p-4 flex flex-col gap-3">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <TeamFlags match={`${rec.home_team} x ${rec.away_team}`} className="text-[14px] font-extrabold text-white" />
          <p className="text-[11px] text-zinc-500">{rec.league ?? '—'}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {rec.minute != null ? `AO VIVO · ${rec.minute}'` : 'AO VIVO'}
          </span>
          {rec.home_score != null && (
            <span className="px-1.5 py-0.5 rounded-md text-[11px] font-extrabold text-white bg-white/[0.06] border border-white/[0.08]">
              {rec.home_score}-{rec.away_score}
            </span>
          )}
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${res.cls}`}>
            {res.label}
          </span>
        </div>
      </div>

      {/* Entrada em destaque */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border bg-brand-500/15 text-brand-300 border-brand-500/30">
            {TYPE_LABEL[rec.type] ?? rec.type}
          </span>
          <GradeBadge meta={meta} />
          {rec.odd != null && <span className="ml-auto text-[11px] text-zinc-500">odd <b className="text-zinc-300">{rec.odd.toFixed(2)}</b></span>}
        </div>
        <p className="text-[15px] font-extrabold text-white mt-1.5">{rec.recommendation}</p>
      </div>

      {/* Confiança 0-10 + medidor + motivo */}
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Confiança</div>
          <div className={`text-[24px] font-extrabold leading-none ${meta.text}`}>
            {rec.confidence.toFixed(1)}<span className="text-[12px] text-zinc-500">/10</span>
          </div>
        </div>
        <Gauge pct={(rec.confidence ?? 0) * 10} color={meta.bar} />
        {rec.reason && <p className="text-[11px] text-zinc-400 flex-1">{rec.reason}</p>}
      </div>

      {tiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {tiles.map((t, i) => <StatTile key={i} t={t} />)}
        </div>
      )}
    </article>
  )
}
