// ─── Kit visual compartilhado dos cards de recomendação ──────────────────────
// Gauge, bandeira, estrelas, tiles de stat e helpers de grade/cor. Usado por
// PlayerLiveCard, LiveRecoCard, RecommendationCard, AnalysisCard e props pra
// manter o MESMO visual em todas as abas.

import { useState } from 'react'
import { flagUrl } from '../../lib/flags'

export interface GradeMeta { label: string; text: string; bar: string; badge: string }

const EMERALD: GradeMeta = { label: 'ALTA', text: 'text-emerald-300', bar: '#34d399',
  badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
const AMBER: GradeMeta = { label: 'MÉDIA', text: 'text-amber-300', bar: '#fbbf24',
  badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' }
const ZINC: GradeMeta = { label: 'BAIXA', text: 'text-zinc-300', bar: '#a1a1aa',
  badge: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' }

const withLabel = (m: GradeMeta, label: string): GradeMeta => ({ ...m, label })

/** Grade por % (0–100): chance/probabilidade. */
export function gradeFromPct(pct: number): GradeMeta {
  if (pct >= 70) return EMERALD
  if (pct >= 50) return AMBER
  return ZINC
}

/** Grade por rótulo do backend (high/medium/low | alta/média/baixa). */
export function gradeFromLabel(label?: string | null): GradeMeta {
  const c = String(label ?? '').toLowerCase()
  if (c === 'high' || c === 'alta') return EMERALD
  if (c === 'medium' || c === 'média' || c === 'media') return AMBER
  return ZINC
}

/** Grade da engine de análise (A+/A/B/C/AVOID) — mantém a letra como label. */
export function gradeFromLetter(letter: string): GradeMeta {
  if (letter === 'A+' || letter === 'A') return withLabel(EMERALD, letter)
  if (letter === 'B' || letter === 'C') return withLabel(AMBER, letter)
  return withLabel(ZINC, letter === 'AVOID' ? 'AVOID' : letter)
}

export function GradeBadge({ meta }: { meta: GradeMeta }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${meta.badge}`}>
      {meta.label}
    </span>
  )
}

export function Gauge({ pct, color }: { pct: number; color: string }) {
  const len = Math.PI * 26
  const off = len * (1 - Math.max(0, Math.min(100, pct)) / 100)
  return (
    <svg width="58" height="32" viewBox="0 0 60 34" aria-hidden className="shrink-0">
      <path d="M4 30 A26 26 0 0 1 56 30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
      <path d="M4 30 A26 26 0 0 1 56 30" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={len} strokeDashoffset={off} />
    </svg>
  )
}

export function Flag({ name, size = 16 }: { name?: string | null; size?: number }) {
  const [err, setErr] = useState(false)
  const url = name ? flagUrl(name, 40) : null
  if (!url || err) return null
  return <img src={url} alt="" width={size} className="rounded-[2px] object-cover shrink-0"
              style={{ height: size * 0.7 }} loading="lazy" onError={() => setErr(true)} />
}

/** Bandeiras + nomes a partir de "Casa x Fora". */
export function TeamFlags({ match, className = '' }: { match?: string | null; className?: string }) {
  if (!match) return null
  const parts = match.split(' x ')
  const home = parts[0]
  const away = parts.slice(1).join(' x ')
  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      <Flag name={home} />
      <span className="truncate">{home}</span>
      <span className="text-zinc-600">x</span>
      <span className="truncate">{away}</span>
      <Flag name={away} />
    </span>
  )
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-300 text-[13px] leading-none">
      {'★'.repeat(Math.max(0, Math.min(5, n)))}
      <span className="text-zinc-700">{'★'.repeat(Math.max(0, 5 - n))}</span>
    </span>
  )
}

const ICONS: Record<string, React.ReactNode> = {
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
  trend: <><path d="M3 17l6-6 4 4 7-7" /><path d="M17 8h4v4" /></>,
  flag: <><path d="M4 22V4h13l-2 4 2 4H4" /></>,
  box: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 12h16" /></>,
  gauge: <><path d="M12 13l4-4" /><path d="M5 19a8 8 0 1 1 14 0" /></>,
  gem: <><path d="M6 3h12l3 6-9 12L3 9z" /></>,
  dot: <circle cx="12" cy="12" r="4" />,
}
export function TileIcon({ k }: { k: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[k] ?? ICONS.dot}
    </svg>
  )
}

export interface Tile { k?: string; label: string; value?: string; sub?: string; badge?: string; stars?: number }

export function StatTile({ t }: { t: Tile }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
        <span className="text-zinc-400"><TileIcon k={t.k ?? 'dot'} /></span>
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
  )
}

/** Bloco "Chance de acontecer" + medidor + (opcional) motivo. */
export function Chance({ pct, meta, reason, label = 'Chance de acontecer' }: {
  pct: number; meta: GradeMeta; reason?: string | null; label?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="shrink-0">
        <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{label}</div>
        <div className={`text-[24px] font-extrabold leading-none ${meta.text}`}>{Math.round(pct)}%</div>
      </div>
      <Gauge pct={pct} color={meta.bar} />
      {reason && <p className="text-[11px] text-zinc-400 flex-1">{reason}</p>}
    </div>
  )
}
