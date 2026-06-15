// ─── Toggle Futebol / Copa do Mundo ──────────────────────────────────────────
// Segmented control que troca o contexto de competição. Ao alternar, leva o
// usuário pro Dashboard (evita ficar numa rota que não existe no outro modo).

import { useNavigate } from 'react-router-dom'
import { useCompetition } from '../hooks/useCompetition'
import { COMPETITION_META, type CompetitionKey } from '../config/competition'

const OPTIONS: CompetitionKey[] = ['general', 'world_cup']

export default function CompetitionToggle() {
  const { context, setContext } = useCompetition()
  const navigate = useNavigate()

  const pick = (k: CompetitionKey) => {
    if (k === context) return
    setContext(k)
    navigate('/')
  }

  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      {OPTIONS.map(k => {
        const meta = COMPETITION_META[k]
        const active = k === context
        return (
          <button
            key={k}
            onClick={() => pick(k)}
            aria-pressed={active}
            className={[
              'flex items-center justify-center gap-1.5 h-8 rounded-lg',
              'text-[11px] font-bold tracking-tight transition-all duration-200',
              active
                ? 'bg-brand-500/15 text-brand-200 border border-brand-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                : 'text-zinc-500 border border-transparent hover:text-zinc-200 hover:bg-white/[0.04]',
            ].join(' ')}
            title={meta.label}
          >
            <span aria-hidden>{meta.icon}</span>
            <span className="truncate">{meta.short}</span>
          </button>
        )
      })}
    </div>
  )
}
