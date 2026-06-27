// ─── PlayerLiveCard — card rico de prop AO VIVO (chutes / gols) ───────────────
// Cabeçalho com jogo + AO VIVO + placar + grade, círculo com o número, BANDEIRA
// do time (país na Copa), linha grande, % com medidor, motivo e tiles de stats
// reais. Só usa dado que o backend manda em rec.stats_used.

import { useState } from 'react'
import type { FootballRecommendation } from '../types'
import { flagUrl } from '../lib/flags'

function grade(conf?: string | null) {
  const c = String(conf ?? '').toLowerCase()
  if (c === 'high' || c === 'alta')
    return { label: 'ALTA', text: 'text-emerald-300', bar: '#34d399',
             badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
  if (c === 'medium' || c === 'média' || c === 'media')
    return { label: 'MÉDIA', text: 'text-amber-300', bar: '#fbbf24',
             badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' }
  return { label: 'BAIXA', text: 'text-zinc-300', bar: '#a1a1aa',
           badge: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' }
}

function Gauge({ pct, color }: { pct: number; color: string }) {
  const len = Math.PI * 26
  const off = len * (1 - Math.max(0, Math.min(100, pct)) / 100)
  return (
    <svg width="58" height="32" viewBox="0 0 60 34" aria-hidden>
      <path d="M4 30 A26 26 0 0 1 56 30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
      <path d="M4 30 A26 26 0 0 1 56 30" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={len} strokeDashoffset={off} />
    </svg>
  )
}

function Flag({ name, size = 18 }: { name?: string | null; size?: number }) {
  const [err, setErr] = useState(false)
  const url = name ? flagUrl(name, 40) : null
  if (!url || err) return null
  return <img src={url} alt="" width={size} className="rounded-[2px] object-cover shrink-0"
              style={{ height: size * 0.7 }} loading="lazy" onError={() => setErr(true)} />
}

const TI: Record<string, React.ReactNode> = {
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
  trend: <><path d="M3 17l6-6 4 4 7-7" /><path d="M17 8h4v4" /></>,
  flag: <><path d="M4 22V4h13l-2 4 2 4H4" /></>,
  box: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 12h16" /></>,
  gauge: <><path d="M12 13l4-4" /><path d="M5 19a8 8 0 1 1 14 0" /></>,
  gem: <><path d="M6 3h12l3 6-9 12L3 9z" /></>,
}
function TileIcon({ k }: { k: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {TI[k]}
    </svg>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-300 text-[13px] leading-none">
      {'★'.repeat(Math.max(0, Math.min(5, n)))}
      <span className="text-zinc-700">{'★'.repeat(Math.max(0, 5 - n))}</span>
    </span>
  )
}

export default function PlayerLiveCard({ rec }: { rec: FootballRecommendation }) {
  const g = grade(rec.confidence as string)
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
  ].filter(Boolean) as { k: string; label: string; value?: string; sub?: string; badge?: string; stars?: number }[]

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
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border ${g.badge}`}>{g.label}</span>
        </div>
      </div>

      {/* Jogador: número + bandeira/time + seleção | linha grande */}
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="relative shrink-0">
          <span className="grid place-items-center w-11 h-11 rounded-full border border-white/[0.12] text-zinc-200 text-[15px] font-extrabold">
            {rec.player_number ?? '—'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[15px] font-extrabold text-white truncate">{name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Flag name={rec.team} size={16} />
            <span className="truncate">{rec.team ?? ''}</span>
          </div>
          <p className={`text-[12px] font-semibold mt-0.5 ${g.text}`}>{selText}</p>
        </div>
        {rec.line != null && (
          <div className="shrink-0 text-right">
            <div className="text-[26px] font-extrabold text-white leading-none">{rec.line % 1 === 0 ? rec.line : rec.line.toFixed(1)}</div>
            <div className="text-[9px] text-zinc-500 leading-tight">Chutes ao gol<br />(jogador)</div>
          </div>
        )}
      </div>

      {/* Chance + medidor + motivo */}
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Chance de acontecer</div>
          <div className={`text-[26px] font-extrabold leading-none ${g.text}`}>{pct}%</div>
        </div>
        <Gauge pct={pct} color={g.bar} />
        {rec.reason && <p className="text-[11px] text-zinc-400 flex-1">{rec.reason}</p>}
      </div>

      {/* Tiles de stats (dado real ao vivo) */}
      {tiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {tiles.map(t => (
            <div key={t.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                <span className="text-zinc-400"><TileIcon k={t.k} /></span>
                <span className="truncate">{t.label}</span>
              </div>
              {t.stars != null ? (
                <div className="mt-1"><Stars n={t.stars} /></div>
              ) : (
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[15px] font-extrabold text-white">{t.value}</span>
                  {t.badge && <span className="text-[10px] font-bold text-emerald-300">{t.badge}</span>}
                  {t.sub && <span className="text-[10px] text-zinc-500">{t.sub}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>Modelo em tempo real</span>
        <span className="inline-flex items-center gap-1">agora <span className="w-1.5 h-1.5 rounded-full bg-accent-500/70" /></span>
      </div>
    </article>
  )
}
