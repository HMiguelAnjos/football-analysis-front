// ─── PlayerLiveCard — card rico de prop AO VIVO (chutes / gols) ───────────────
// Cabeçalho (jogo + AO VIVO + placar + grade), círculo com o número, BANDEIRA do
// time (país na Copa), linha grande, % com medidor, motivo e tiles de stats.

import type { FootballRecommendation } from '../types'
import { Chance, Flag, GradeBadge, StatTile, gradeFromLabel, type Tile } from './cards/parts'

export default function PlayerLiveCard({ rec }: { rec: FootballRecommendation }) {
  const meta = gradeFromLabel(rec.confidence as string)
  const s = rec.stats_used ?? {}
  const isGoals = rec.market === 'anytime_scorer'
  const [name, ...rest] = (rec.selection || '').split(' — ')
  const selText = rest.join(' — ') || rec.selection
  const pct = Math.round((rec.model_prob ?? 0) * 100)
  const minute = s.minute != null ? `${s.minute}'` : null
  const score = (s.score as string) ?? null

  const num = (k: string) => (s[k] != null ? Number(s[k]) : null)
  const tiles = [
    num('pressure') != null && { k: 'target', label: 'Pressão ofensiva', value: `${num('pressure')}`, sub: s.pressure_label as string },
    num('projection') != null && { k: 'trend', label: isGoals ? 'Projeção' : 'Projeção (chutes)', value: `${num('projection')}`, badge: s.projection_delta != null ? `+${s.projection_delta}` : undefined },
    num('team_shots') != null && { k: 'flag', label: 'Finalizações do time', value: `${num('team_shots')}` },
    num('box_shots') != null && { k: 'box', label: 'Finalizações na área', value: `${num('box_shots')}` },
    num('pace') != null && { k: 'gauge', label: 'Ritmo do jogo', value: `${num('pace')}`, sub: s.pace_label as string },
    num('value_stars') != null && { k: 'gem', label: 'Valor da entrada', stars: num('value_stars') as number },
  ].filter(Boolean) as Tile[]

  return (
    <article className="card-premium p-4 flex flex-col gap-3">
      {/* Cabeçalho: jogo + AO VIVO + placar + grade */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[14px] font-extrabold text-white truncate">{rec.match}</h3>
          <p className="text-[11px] text-zinc-500">{rec.league ?? '—'}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {minute ? `AO VIVO · ${minute}` : 'AO VIVO'}
          </span>
          {score && (
            <span className="px-1.5 py-0.5 rounded-md text-[11px] font-extrabold text-white bg-white/[0.06] border border-white/[0.08]">
              {score}
            </span>
          )}
          <GradeBadge meta={meta} />
        </div>
      </div>

      {/* Jogador: número + bandeira/time + seleção | linha grande */}
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <span className="grid place-items-center w-11 h-11 rounded-full border border-white/[0.12] text-zinc-200 text-[15px] font-extrabold shrink-0">
          {rec.player_number ?? '—'}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[15px] font-extrabold text-white truncate block">{name}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Flag name={rec.team} />
            <span className="truncate">{rec.team ?? ''}</span>
          </div>
          <p className={`text-[12px] font-semibold mt-0.5 ${meta.text}`}>{selText}</p>
        </div>
        {rec.line != null && (
          <div className="shrink-0 text-right">
            {/* Mercado de contagem é inteiro: "N+" (a meia-linha é só interna). */}
            <div className="text-[26px] font-extrabold text-white leading-none">{Math.round(rec.line + 0.5)}+</div>
            <div className="text-[9px] text-zinc-500 leading-tight">chutes<br />no gol</div>
          </div>
        )}
      </div>

      <Chance pct={pct} meta={meta} reason={rec.reason} />

      {tiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {tiles.map(t => <StatTile key={t.k} t={t} />)}
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>Modelo em tempo real</span>
        <span className="inline-flex items-center gap-1">agora <span className="w-1.5 h-1.5 rounded-full bg-accent-500/70" /></span>
      </div>
    </article>
  )
}
