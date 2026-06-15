import { useEffect, useState } from 'react'
import type { FootballTeamRef } from '../types'
import { flagUrl } from '../lib/flags'

// ─── Escudo/identidade do time ───────────────────────────────────────────────
// Ordem: BANDEIRA da seleção (flagcdn) → logo_url do clube → iniciais. Se a
// imagem falhar (CDN fora do ar, URL inválida), cai GRACIOSAMENTE pras iniciais
// num disco neutro — nunca o ícone de imagem quebrada.

const SIZES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-[12px]',
  lg: 'w-11 h-11 text-[15px]',
}

const FLAG_WIDTH = { sm: 40, md: 80, lg: 80 } as const

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
  const [failed, setFailed] = useState(false)
  // Bandeira da seleção quando existir; senão o logo do clube.
  const src = flagUrl(team.name, FLAG_WIDTH[size]) || team.logo_url
  // Reseta o estado de erro se a imagem mudar (ex.: troca de contexto).
  useEffect(() => setFailed(false), [src])

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={team.name}
        className={`${SIZES[size]} object-contain shrink-0`}
        loading="lazy"
        onError={() => setFailed(true)}
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
