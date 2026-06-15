// ─── Helpers de odds / probabilidade / edge ──────────────────────────────────
// Funções puras de apresentação. NÃO reimplementam o modelo do backend — só
// formatam e derivam valores triviais (prob implícita, edge) quando o backend
// não os enviar prontos.

import type { Confidence, FootballRecommendation } from '../types'

/** Probabilidade implícita de uma odd decimal (0..1). null se odd inválida. */
export function impliedProb(odd?: number | null): number | null {
  if (!odd || odd <= 1) return null
  return 1 / odd
}

/** Odd justa a partir de uma probabilidade do modelo (0..1). */
export function fairOdd(prob?: number | null): number | null {
  if (!prob || prob <= 0 || prob >= 1) return null
  return 1 / prob
}

/**
 * Edge da recomendação (0..1). Usa o campo do backend quando presente; senão
 * deriva de model_prob − implied_prob (odd). null quando indeterminável.
 */
export function recommendationEdge(rec: FootballRecommendation): number | null {
  if (rec.edge != null) return rec.edge
  const model = rec.model_prob ?? null
  const implied = rec.implied_prob ?? impliedProb(rec.odd)
  if (model == null || implied == null) return null
  return model - implied
}

export function formatOdd(odd?: number | null): string {
  if (odd == null) return '—'
  return odd.toFixed(2)
}

export function formatPct(value?: number | null, digits = 0): string {
  if (value == null) return '—'
  return `${(value * 100).toFixed(digits)}%`
}

/** Edge com sinal e cor semântica (verde positivo / vermelho negativo). */
export function formatEdge(edge?: number | null): { text: string; tone: 'accent' | 'red' | 'neutral' } {
  if (edge == null) return { text: '—', tone: 'neutral' }
  const text = `${edge >= 0 ? '+' : ''}${(edge * 100).toFixed(1)}%`
  return { text, tone: edge > 0.005 ? 'accent' : edge < -0.005 ? 'red' : 'neutral' }
}

export const CONFIDENCE_META: Record<Confidence, { label: string; cls: string }> = {
  high: { label: 'Alta', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  medium: { label: 'Média', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  low: { label: 'Baixa', cls: 'bg-white/[0.06] text-zinc-400 border-white/10' },
}

export function confidenceMeta(c?: string | null) {
  if (c && (c === 'high' || c === 'medium' || c === 'low')) return CONFIDENCE_META[c]
  return null
}

/** "há 5 min" / "há 2h" / data. Usado em cards de entrada. */
export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return new Date(iso).toLocaleDateString('pt-BR')
}
