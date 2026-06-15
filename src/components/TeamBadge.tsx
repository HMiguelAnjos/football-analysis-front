import type { FootballTeamRef } from '../types'

// ─── Escudo/identidade do time ───────────────────────────────────────────────
// Mostra o logo (logo_url) quando disponível; senão cai pras iniciais num
// disco neutro. Genérico — funciona pra qualquer liga.

const SIZES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-[12px]',
  lg: 'w-11 h-11 text-[15px]',
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function TeamBadge({
  team,
  size = 'md',
}: {
  team: FootballTeamRef
  size?: keyof typeof SIZES
}) {
  if (team.logo_url) {
    return (
      <img
        src={team.logo_url}
        alt={team.name}
        className={`${SIZES[size]} object-contain shrink-0`}
        loading="lazy"
      />
    )
  }
  return (
    <span
      className={`${SIZES[size]} grid place-items-center rounded-full shrink-0
                  bg-white/[0.06] border border-white/10 text-zinc-300 font-bold`}
      title={team.name}
      aria-hidden
    >
      {initials(team.short_name || team.name)}
    </span>
  )
}
