import type { FootballPlayer } from '../types'
import { Pill, type Tone } from './dashboard/parts'

// ─── Card de estatísticas de um jogador ──────────────────────────────────────
// Nome, time, posição, status provável + grade de stats (gols, assist., xG, xA,
// chutes, chutes no alvo, minutos, cartões).

const STATUS_META: Record<string, { label: string; tone: Tone }> = {
  available: { label: 'Provável', tone: 'accent' },
  doubtful: { label: 'Dúvida', tone: 'brand' },
  out: { label: 'Desfalque', tone: 'red' },
  suspended: { label: 'Suspenso', tone: 'red' },
}

function num(v?: number | null, digits = 0): string {
  return v == null ? '—' : v.toFixed(digits)
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2 py-1.5 text-center">
      <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">{label}</div>
      <div className="text-[14px] font-extrabold tabular text-zinc-100">{value}</div>
    </div>
  )
}

export default function PlayerStatsCard({ player }: { player: FootballPlayer }) {
  const status = player.status ? STATUS_META[player.status] : null
  const cards = (player.yellow_cards ?? 0) + (player.red_cards ?? 0)

  return (
    <article className="card-premium p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold text-white truncate">{player.name}</h3>
          <p className="text-[12px] text-zinc-500 truncate">
            {[player.team, player.position].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
        {player.rating != null ? (
          <span className="shrink-0 grid place-items-center min-w-[2.4rem] h-7 px-1.5 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-200 text-[13px] font-extrabold tabular">
            {player.rating.toFixed(1)}
          </span>
        ) : status ? <Pill tone={status.tone}>{status.label}</Pill> : null}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <Stat label="Gols" value={num(player.goals)} />
        <Stat label="Assist." value={num(player.assists)} />
        <Stat label="Chutes" value={num(player.shots)} />
        <Stat label="No gol" value={num(player.shots_on_target)} />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <Stat label="Dribles" value={num(player.dribbles)} />
        <Stat label="Desarmes" value={num(player.tackles)} />
        <Stat label="Duelos" value={num(player.duels_won)} />
        <Stat label="F. sofr." value={num(player.fouls_drawn)} />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <Stat label="Passes-ch." value={num(player.key_passes)} />
        <Stat label="Jogos" value={num(player.appearances)} />
        <Stat label="Min." value={num(player.minutes)} />
        <Stat label="Cartões" value={num(cards)} />
      </div>

      {player.iip != null && (
        <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-white/[0.06]">
          <Idx label="IPO" value={player.ipo} />
          <Idx label="ICJ" value={player.icj} />
          <Idx label="ID" value={player.idef} />
          <Idx label="IIP" value={player.iip} />
        </div>
      )}
    </article>
  )
}

function Idx({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="rounded-lg bg-brand-500/[0.07] border border-brand-500/20 px-2 py-1.5 text-center">
      <div className="text-[9px] font-bold uppercase tracking-wider text-brand-300/70">{label}</div>
      <div className="text-[14px] font-extrabold tabular text-brand-100">{value == null ? '—' : value.toFixed(0)}</div>
    </div>
  )
}
