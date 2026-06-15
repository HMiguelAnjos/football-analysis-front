// ─── Contexto de competição (Futebol geral / Copa do Mundo) ──────────────────
// Store mínimo fora do React: o api client lê o contexto atual em tempo de
// chamada (pra escolher /football vs /football/world-cup) e os componentes
// sincronizam via useSyncExternalStore (hook useCompetition). Persistido em
// localStorage pra sobreviver a refresh.

export type CompetitionKey = 'general' | 'world_cup'

const STORAGE_KEY = 'football_competition_context'

function _read(): CompetitionKey {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'world_cup' ? 'world_cup' : 'general'
  } catch {
    return 'general'
  }
}

let _current: CompetitionKey = _read()
const _listeners = new Set<() => void>()

export function getContext(): CompetitionKey {
  return _current
}

export function setContext(next: CompetitionKey): void {
  if (next === _current) return
  _current = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* modo privado — segue só em memória */
  }
  _listeners.forEach(l => l())
}

export function subscribe(listener: () => void): () => void {
  _listeners.add(listener)
  return () => _listeners.delete(listener)
}

export const isWorldCup = (): boolean => _current === 'world_cup'

/** Metadados de exibição por contexto (rótulo + ícone). */
export const COMPETITION_META: Record<CompetitionKey, { label: string; short: string; icon: string }> = {
  general: { label: 'Futebol', short: 'Futebol', icon: '⚽' },
  world_cup: { label: 'Copa do Mundo', short: 'Copa', icon: '🏆' },
}
