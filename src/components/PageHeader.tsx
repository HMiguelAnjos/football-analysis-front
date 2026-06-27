// ─── PageHeader — cabeçalho premium de página ────────────────────────────────
// Título com acento da marca (ou ponto "ao vivo"), subtítulo e ação opcional à
// direita. Dá identidade e hierarquia consistentes a todas as telas.

export default function PageHeader({
  title, subtitle, live = false, action,
}: {
  title: string
  subtitle?: string
  live?: boolean
  action?: React.ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-tight text-white flex items-center gap-2.5 leading-none">
          {live ? (
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          ) : (
            <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 shrink-0" />
          )}
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-zinc-500 mt-1.5 ml-[14px] max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
