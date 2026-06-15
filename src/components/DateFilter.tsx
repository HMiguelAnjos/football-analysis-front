import { selectCls } from './filterStyles'

// ─── Filtro de data (input nativo date) ──────────────────────────────────────
// value vazio = sem filtro de data. Formato YYYY-MM-DD (compatível com o
// parâmetro `date` da API).

export default function DateFilter({
  value,
  onChange,
  className = '',
}: {
  value: string
  onChange: (date: string) => void
  className?: string
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ colorScheme: 'dark' }}
      className={`${selectCls} ${className}`}
      aria-label="Filtrar por data"
    />
  )
}
