// ─── Forma recente como chips W/D/L (ou V/E/D em PT-BR) ───────────────────────
// Recebe string tipo "WWDLW" (mais recente à esquerda) e renderiza chips
// coloridos. Aceita também caracteres PT-BR (V/E/D).

const MAP: Record<string, { label: string; cls: string }> = {
  W: { label: 'V', cls: 'bg-emerald-500/20 text-emerald-300' },
  V: { label: 'V', cls: 'bg-emerald-500/20 text-emerald-300' },
  D: { label: 'E', cls: 'bg-amber-500/20 text-amber-300' }, // draw
  E: { label: 'E', cls: 'bg-amber-500/20 text-amber-300' },
  L: { label: 'D', cls: 'bg-red-500/20 text-red-300' }, // loss
}

export default function FormString({ form }: { form?: string | null }) {
  if (!form) return <span className="text-[12px] text-zinc-600">—</span>
  const chars = form.toUpperCase().replace(/[^WDLVE]/g, '').split('')
  if (chars.length === 0) return <span className="text-[12px] text-zinc-600">—</span>
  return (
    <span className="inline-flex items-center gap-1">
      {chars.map((c, i) => {
        const meta = MAP[c] ?? { label: c, cls: 'bg-white/[0.06] text-zinc-400' }
        return (
          <span
            key={i}
            className={`grid place-items-center w-5 h-5 rounded text-[10px] font-bold ${meta.cls}`}
          >
            {meta.label}
          </span>
        )
      })}
    </span>
  )
}
