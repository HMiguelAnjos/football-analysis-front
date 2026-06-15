// ─── InfoPopover ─────────────────────────────────────────────────────────
// Wrapper pra badges com explicação. No desktop, hover nativo (title attr)
// funciona — mas em mobile não tem hover, então o usuário precisa CLICAR.
//
// Comportamento:
//   - Click/tap: abre popover ancorado no badge
//   - Click fora: fecha
//   - Esc: fecha (acessibilidade)
//   - stopPropagation: não dispara click do card pai
//
// Uso:
//   <InfoPopover content={<>...</>}>
//     <span>🔥</span>
//   </InfoPopover>

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface InfoPopoverProps {
  /** Conteúdo do popover (texto, JSX). */
  content: ReactNode
  /** Trigger visível (emoji, ícone, etc.). */
  children: ReactNode
  /** Posição do popover relativa ao trigger. Default: bottom. */
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const POSITION_CLASSES = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-1',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
  left:   'right-full top-1/2 -translate-y-1/2 mr-1',
  right:  'left-full top-1/2 -translate-y-1/2 ml-1',
} as const

export function InfoPopover({
  content, children, position = 'bottom', className = '',
}: InfoPopoverProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: Event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  return (
    <span ref={wrapperRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        className="cursor-pointer inline-flex items-center align-baseline focus:outline-none focus:ring-1 focus:ring-slate-500 rounded"
        aria-expanded={open}
      >
        {children}
      </button>
      {open && (
        <div
          role="tooltip"
          className={[
            'absolute z-50 min-w-[180px] max-w-[280px]',
            'bg-slate-800 border border-slate-700 rounded-lg shadow-xl',
            'px-3 py-2 text-xs text-slate-200 leading-relaxed',
            'whitespace-pre-line', // respeita \n no content
            POSITION_CLASSES[position],
          ].join(' ')}
        >
          {content}
        </div>
      )}
    </span>
  )
}
