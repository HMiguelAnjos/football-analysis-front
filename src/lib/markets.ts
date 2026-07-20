// ─── Mercados de futebol — labels PT-BR + agrupamento ────────────────────────
// Code names em inglês (espelham o backend); labels PT-BR pra UI. Mantém
// fallback pra strings livres que o backend possa enviar fora da lista.

import type { FootballMarket } from '../types'

export interface MarketDef {
  id: FootballMarket
  label: string
  /** Dica curta do que o mercado representa. */
  hint?: string
}

// Ordem = ordem de exibição em filtros/selects.
export const MARKETS: MarketDef[] = [
  { id: '1x2', label: '1X2', hint: 'Resultado final (casa/empate/fora)' },
  { id: 'double_chance', label: 'Dupla chance' },
  { id: 'dnb', label: 'Empate anula (DNB)' },
  { id: 'over_under', label: 'Over/Under gols' },
  { id: 'btts', label: 'Ambas marcam' },
  { id: 'handicap', label: 'Handicap' },
  { id: 'corners', label: 'Escanteios' },
  { id: 'cards', label: 'Cartões' },
  { id: 'player_goal', label: 'Jogador p/ marcar' },
  { id: 'player_shots', label: 'Finalizações (jogador)' },
  { id: 'player_shots_on_target', label: 'Chutes ao gol (jogador)' },
  { id: 'player_assists', label: 'Assistências (jogador)' },
]

const MARKET_LABELS: Record<string, string> = {
  ...Object.fromEntries(MARKETS.map(m => [m.id, m.label])),
  // Mercados extra do feed de "coisas que podem acontecer".
  team_total: 'Gols do time',
  first_half_goal: 'Gol no 1º tempo',
  first_30_goal: 'Gol até 30 min',
  anytime_scorer: 'Marcar a qualquer momento',
  player_tackles: 'Desarmes',
}

export function marketLabel(market: string): string {
  return MARKET_LABELS[market] ?? market
}

// ─── Linha localizada de mercados de CONTAGEM (cartões, escanteios) ──────────
// Cartão/escanteio é inteiro: a linha "4.5" é técnica (over 4.5 = 5+ = mais de
// 4). Em PT mostramos o inteiro amigável ("Mais de 4 cartões"); em outros
// idiomas mantemos a notação de linha padrão ("Over 4.5 cards"). O idioma vem
// do navegador (navigator.language).
const COUNT_MARKET_NOUNS: Record<string, { pt: string; en: string }> = {
  cards: { pt: 'cartões', en: 'cards' },
  corners: { pt: 'escanteios', en: 'corners' },
}

export function browserIsPt(): boolean {
  if (typeof navigator === 'undefined') return true // SSR / default: app é PT
  return (navigator.language || 'pt').toLowerCase().startsWith('pt')
}

/**
 * Rótulo localizado da linha de um mercado de contagem, ou null quando o
 * mercado não é de contagem (aí o caller mantém selection + line como está).
 */
export function countLineLabel(
  market: string,
  line: number | null | undefined,
): string | null {
  if (line == null) return null
  const noun = COUNT_MARKET_NOUNS[market]
  if (!noun) return null
  if (browserIsPt()) return `Mais de ${Math.floor(line)} ${noun.pt}`
  return `Over ${line} ${noun.en}`
}
