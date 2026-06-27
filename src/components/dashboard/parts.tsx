// ─── components/dashboard/parts.tsx ──────────────────────────────────────────
// Primitivas visuais compartilhadas pela Central do Dia. Só apresentação —
// nenhuma regra de negócio. Mantém o padrão premium dark do ClutchPro
// (laranja destaque, verde positivo, vermelho alerta, zinc neutro).

import type { ReactNode } from 'react'

export type Tone = 'brand' | 'accent' | 'red' | 'violet' | 'neutral'

export const TONE_TEXT: Record<Tone, string> = {
  brand: 'text-brand-400',
  accent: 'text-accent-400',
  red: 'text-red-400',
  violet: 'text-violet-300',
  neutral: 'text-zinc-400',
}

const TONE_PILL: Record<Tone, string> = {
  brand: 'bg-brand-500/12 text-brand-300 border-brand-500/30',
  accent: 'bg-accent-500/12 text-accent-300 border-accent-500/30',
  red: 'bg-red-500/12 text-red-300 border-red-500/30',
  violet: 'bg-violet-500/15 text-violet-200 border-violet-500/30',
  neutral: 'bg-white/[0.05] text-zinc-300 border-white/10',
}

export function Pill({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${TONE_PILL[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  icon?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card-premium p-5 sm:p-6 ${className}`}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.16em] text-zinc-200">
            <span aria-hidden className="w-1 h-3.5 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 shrink-0" />
            {icon && <span aria-hidden>{icon}</span>}
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  )
}

/** Confiança 0..1 → 4 pontinhos. */
export function ConfidenceBadge({ value }: { value?: number }) {
  if (value == null) return null
  const dots = Math.max(1, Math.min(4, Math.round(value * 4)))
  return (
    <span
      className="inline-flex items-center gap-0.5"
      title={`Confiança ${(value * 100).toFixed(0)}%`}
    >
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < dots ? 'bg-brand-500' : 'bg-white/15'
          }`}
        />
      ))}
    </span>
  )
}

export function RiskBadge({
  level,
}: {
  level: 'low' | 'medium' | 'high' | 'final'
}) {
  const map = {
    high: { t: 'red' as Tone, l: 'Alto' },
    medium: { t: 'brand' as Tone, l: 'Médio' },
    low: { t: 'neutral' as Tone, l: 'Baixo' },
    final: { t: 'neutral' as Tone, l: 'Final' },
  }[level]
  return <Pill tone={map.t}>Risco {map.l}</Pill>
}

/** Estado vazio compacto dentro de uma seção (nunca deixa área "morta"). */
export function SectionEmpty({
  icon = '—',
  text,
}: {
  icon?: string
  text: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] px-4 py-5 text-[13px] text-zinc-500">
      <span className="text-lg opacity-70" aria-hidden>
        {icon}
      </span>
      <span>{text}</span>
    </div>
  )
}

export function KpiCard({
  label,
  value,
  hint,
  tone = 'neutral',
  icon,
}: {
  label: string
  value: ReactNode
  hint?: string
  tone?: Tone
  icon?: string
}) {
  return (
    <div className="card-premium p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {icon && <span aria-hidden>{icon}</span>}
        {label}
      </div>
      <div className={`text-2xl font-extrabold tabular leading-none ${TONE_TEXT[tone]}`}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-zinc-500 truncate">{hint}</div>}
    </div>
  )
}
