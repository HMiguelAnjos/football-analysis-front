import { MARKETS } from '../lib/markets'
import { selectCls } from './filterStyles'

// ─── Filtro de mercado ───────────────────────────────────────────────────────
// value '' = todos. Lista vem de lib/markets.ts (labels PT-BR).

export default function MarketFilter({
  value,
  onChange,
  className = '',
}: {
  value: string
  onChange: (market: string) => void
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ colorScheme: 'dark' }}
      className={`${selectCls} ${className}`}
      aria-label="Filtrar por mercado"
    >
      <option value="">Todos os mercados</option>
      {MARKETS.map(m => (
        <option key={m.id} value={String(m.id)}>
          {m.label}
        </option>
      ))}
    </select>
  )
}
