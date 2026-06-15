// ─── Helpers de partida — status, horário, placar ────────────────────────────
// Funções puras de apresentação para jogos de futebol.

import type { FootballMatch, MatchStatus, MatchSummary } from '../types'

export interface StatusMeta {
  label: string
  /** Tom para Pill/badges. */
  tone: 'accent' | 'brand' | 'red' | 'neutral'
  live: boolean
}

export function statusMeta(status: MatchStatus, minute?: number | null): StatusMeta {
  switch (status) {
    case 'live':
      return { label: minute ? `${minute}'` : 'Ao vivo', tone: 'red', live: true }
    case 'halftime':
      return { label: 'Intervalo', tone: 'brand', live: true }
    case 'finished':
      return { label: 'Encerrado', tone: 'neutral', live: false }
    case 'postponed':
      return { label: 'Adiado', tone: 'neutral', live: false }
    case 'canceled':
      return { label: 'Cancelado', tone: 'neutral', live: false }
    case 'scheduled':
    default:
      return { label: 'Agendado', tone: 'accent', live: false }
  }
}

/** Horário do jogo no timezone local do usuário (HH:MM). */
export function formatKickoffTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

/** Data curta local (DD/MM). */
export function formatKickoffDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return '—'
  }
}

/** True quando o jogo já começou (placar relevante). */
export function hasScore(m: { status: MatchStatus }): boolean {
  return m.status === 'live' || m.status === 'halftime' || m.status === 'finished'
}

/** Placar "2 x 1" ou "—" quando não iniciado. */
export function scoreline(m: {
  status: MatchStatus
  home_score?: number | null
  away_score?: number | null
}): string {
  if (!hasScore(m) || m.home_score == null || m.away_score == null) return '—'
  return `${m.home_score} x ${m.away_score}`
}

/** Rótulo "Casa x Visitante". */
export function matchupLabel(m: Pick<FootballMatch | MatchSummary, 'home' | 'away'>): string {
  return `${m.home.name} x ${m.away.name}`
}

/** Ordena: ao vivo primeiro, depois por horário. */
export function sortMatches<T extends FootballMatch>(matches: T[]): T[] {
  const order: Record<string, number> = { live: 0, halftime: 0, scheduled: 1, finished: 2 }
  return [...matches].sort((a, b) => {
    const oa = order[a.status] ?? 1
    const ob = order[b.status] ?? 1
    if (oa !== ob) return oa - ob
    return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  })
}
