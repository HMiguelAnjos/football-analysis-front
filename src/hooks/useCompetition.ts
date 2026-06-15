// Hook React do contexto de competição — sincroniza com o store em
// config/competition.ts. Toda tela que precisa reagir ao toggle usa este hook.

import { useSyncExternalStore } from 'react'
import {
  getContext,
  setContext,
  subscribe,
  type CompetitionKey,
} from '../config/competition'

export function useCompetition() {
  const context = useSyncExternalStore(subscribe, getContext, getContext)
  return {
    context,
    isWorldCup: context === 'world_cup',
    setContext: (c: CompetitionKey) => setContext(c),
  }
}
