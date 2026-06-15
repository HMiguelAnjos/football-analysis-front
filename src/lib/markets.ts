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

const MARKET_LABELS: Record<string, string> = Object.fromEntries(
  MARKETS.map(m => [m.id, m.label]),
)

export function marketLabel(market: string): string {
  return MARKET_LABELS[market] ?? market
}
