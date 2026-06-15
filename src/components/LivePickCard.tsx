import type { FootballLivePick } from '../types'
import { marketLabel } from '../lib/markets'
import { confidenceMeta, formatOdd, timeAgo } from '../lib/odds'
import { Pill, type Tone } from './dashboard/parts'

// ─── Card de entrada ao vivo (publicada por analista) ────────────────────────
// Somente leitura por padrão. Quando `manage` é true, mostra ações de gestão
// (atualizar status / remover) — usado pela tela Publicar Entrada.

const STATUS_META: Record<string, { label: string; tone: Tone }> = {
  active: { label: 'Ativa', tone: 'accent' },
  won: { label: 'Green', tone: 'accent' },
  lost: { label: 'Red', tone: 'red' },
  void: { label: 'Anulada', tone: 'neutral' },
  cancelled: { label: 'Removida', tone: 'neutral' },
}

export default function LivePickCard({
  pick,
  manage = false,
  busy = false,
  confirming = false,
  onSettle,
  onRemove,
}: {
  pick: FootballLivePick
  manage?: boolean
  busy?: boolean
  confirming?: boolean
  onSettle?: (status: 'won' | 'lost' | 'void') => void
  onRemove?: () => void
}) {
  const conf = confidenceMeta(pick.confidence as string | null | undefined)
  const st = STATUS_META[pick.status] ?? { label: pick.status, tone: 'neutral' as Tone }

  return (
    <article className="card-premium p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold text-white truncate">{pick.match}</h3>
          <p className="text-[12px] text-zinc-500">{pick.league ?? '—'}</p>
        </div>
        <Pill tone={st.tone}>{st.label}</Pill>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-baseline gap-1.5 rounded-xl px-3 py-2 leading-none border bg-brand-500/10 border-brand-500/30 text-brand-200">
          <span className="text-[13px] font-extrabold">{pick.selection}</span>
          {pick.line != null && <span className="text-[18px] font-extrabold tabular">{pick.line}</span>}
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-zinc-200">{marketLabel(pick.market)}</div>
          <div className="text-[11px] text-zinc-500">
            odd <span className="text-zinc-300 font-bold tabular">{formatOdd(pick.odd)}</span>
            {conf ? ` · confiança ${conf.label.toLowerCase()}` : ''}
          </div>
        </div>
      </div>

      {pick.reason && (
        <p className="text-[13px] text-zinc-400 leading-relaxed border-l-2 border-brand-500/40 pl-3">
          {pick.reason}
        </p>
      )}

      <div className="mt-auto pt-1 flex items-center justify-between text-[11px] text-zinc-600">
        <span>
          {pick.analyst_name ? <>por <span className="text-zinc-400 font-semibold">{pick.analyst_name}</span></> : 'analista'}
        </span>
        <span>{timeAgo(pick.created_at)}</span>
      </div>

      {manage && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
          {pick.status === 'active' && onSettle && (
            <>
              <SmallBtn label="Green" onClick={() => onSettle('won')} disabled={busy} tone="accent" />
              <SmallBtn label="Red" onClick={() => onSettle('lost')} disabled={busy} tone="red" />
              <SmallBtn label="Anular" onClick={() => onSettle('void')} disabled={busy} tone="neutral" />
            </>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              disabled={busy}
              className={`ml-auto text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                confirming
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'text-zinc-500 hover:text-red-300 border-white/[0.08] hover:border-red-500/30'
              }`}
            >
              {busy ? 'Removendo…' : confirming ? 'Confirmar?' : 'Remover'}
            </button>
          )}
        </div>
      )}
    </article>
  )
}

function SmallBtn({
  label, onClick, disabled, tone,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  tone: 'accent' | 'red' | 'neutral'
}) {
  const cls = {
    accent: 'text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10',
    red: 'text-red-300 border-red-500/30 hover:bg-red-500/10',
    neutral: 'text-zinc-400 border-white/[0.08] hover:bg-white/[0.04]',
  }[tone]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${cls}`}
    >
      {label}
    </button>
  )
}
