import { useState } from 'react'
import { flagUrl } from '../lib/flags'
import { Pill } from './dashboard/parts'

// ─── Cabeçalho de um jogo (agrupamento de recomendações) ─────────────────────
// Mostra bandeiras + nomes + horário + contagem. Reutilizado no Pré-Jogo
// (Mercados e Jogadores) pra agrupar as entradas por partida.

function Flag({ name }: { name: string }) {
  const [err, setErr] = useState(false)
  const url = flagUrl(name, 40)
  if (!url || err) return null
  return (
    <img
      src={url} alt=""
      className="w-5 h-[14px] object-cover rounded-[2px] shrink-0"
      loading="lazy" onError={() => setErr(true)}
    />
  )
}

function kickoffLabel(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function MatchHeader({
  match, kickoff, group, count, countLabel = 'entradas',
}: {
  match: string
  kickoff?: string | null
  group?: string | null
  count?: number
  countLabel?: string
}) {
  const parts = match.split(' x ')
  const home = parts[0]
  const away = parts.slice(1).join(' x ')
  const label = count === 1 ? countLabel.replace(/s$/, '') : countLabel

  return (
    <div className="flex items-center gap-2 flex-wrap border-b border-white/[0.06] pb-2">
      <Flag name={home} />
      <h2 className="text-[16px] font-extrabold text-white">{home}</h2>
      <span className="text-zinc-600 text-[13px]">x</span>
      <h2 className="text-[16px] font-extrabold text-white">{away}</h2>
      <Flag name={away} />
      {kickoffLabel(kickoff) && (
        <span className="text-[12px] text-zinc-500 ml-1">{kickoffLabel(kickoff)}</span>
      )}
      {group && group.length <= 2 && <Pill tone="neutral">Grupo {group}</Pill>}
      {count != null && (
        <span className="ml-auto text-[11px] font-bold uppercase tracking-wider text-zinc-600">
          {count} {label}
        </span>
      )}
    </div>
  )
}
