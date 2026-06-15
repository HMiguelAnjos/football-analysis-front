// ─── useVisiblePolling ──────────────────────────────────────────────────────
// Hook pra polling que respeita a visibilidade da aba do browser.
//
// Problema (mai/2026): polling de 5-15s nas telas Ao Vivo / Hot Picks /
// Rotações mantinha tráfego mesmo quando o usuário estava com a aba em
// background — sem ganho real pro usuário e custando egress no backend.
//
// Solução: usa `document.visibilityState`:
//   - Quando a aba fica visível, faz fetch imediato (catch up) + agenda
//     o próximo após `intervalMs`.
//   - Quando a aba fica oculta, cancela o setInterval.
//   - Reage a `visibilitychange` pra retomar/pausar sem perder estado.
//
// Comportamento de saída idêntico a um setInterval normal quando a aba
// fica visível o tempo todo — não muda nada pro usuário ativo.

import { useEffect, useRef } from 'react'

interface Options {
  /** Pula o fetch imediato ao montar / ao voltar a ficar visível.
   *  Útil quando o caller já fez o primeiro fetch sozinho. Default false. */
  skipFirstRun?: boolean
}

export function useVisiblePolling(
  fn: () => void | Promise<void>,
  intervalMs: number,
  deps: ReadonlyArray<unknown> = [],
  options: Options = {},
): void {
  const fnRef = useRef(fn)
  fnRef.current = fn
  const skipFirstRun = options.skipFirstRun === true

  useEffect(() => {
    let intervalId: number | undefined
    let firstRun = skipFirstRun

    const isVisible = () =>
      typeof document === 'undefined' || document.visibilityState !== 'hidden'

    const tick = () => {
      try {
        const r = fnRef.current()
        if (r && typeof (r as Promise<void>).catch === 'function') {
          ;(r as Promise<void>).catch(() => { /* caller deve tratar */ })
        }
      } catch {
        /* caller deve tratar */
      }
    }

    const start = () => {
      if (intervalId !== undefined) return  // já rodando
      if (!firstRun) tick()                 // catch up imediato
      firstRun = false
      intervalId = window.setInterval(tick, intervalMs)
    }

    const stop = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
        intervalId = undefined
      }
    }

    if (isVisible()) start()

    const onVisChange = () => {
      if (isVisible()) start()
      else stop()
    }
    document.addEventListener('visibilitychange', onVisChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisChange)
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps])
}
