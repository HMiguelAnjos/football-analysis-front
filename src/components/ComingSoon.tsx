import type { ReactNode } from 'react'

// ─── Estado "em breve" estruturado ───────────────────────────────────────────
// Usado nas telas ainda não construídas (Performance, Ligas, Times, etc.).
// Mantém o padrão premium e comunica o que a tela vai entregar — sem parecer
// página quebrada. Substituir pelo conteúdo real quando a tela for implementada.

export default function ComingSoon({
  icon = '⚽',
  title,
  description,
  bullets,
  children,
}: {
  icon?: string
  title: string
  description?: ReactNode
  bullets?: string[]
  children?: ReactNode
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="card-premium p-8 sm:p-10 text-center flex flex-col items-center">
        <div
          className="mb-5 grid place-items-center w-16 h-16 rounded-2xl
                     bg-brand-500/10 border border-brand-500/20 text-3xl"
          aria-hidden
        >
          {icon}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed max-w-lg">
            {description}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-amber-500/10 text-amber-300 border border-amber-500/25">
          Em breve
        </span>

        {bullets && bullets.length > 0 && (
          <ul className="mt-6 grid gap-2 text-left sm:grid-cols-2 w-full max-w-xl">
            {bullets.map(b => (
              <li
                key={b}
                className="flex items-start gap-2 text-[13px] text-zinc-400 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2"
              >
                <span className="text-brand-400 mt-0.5" aria-hidden>›</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {children}
      </div>
    </div>
  )
}
