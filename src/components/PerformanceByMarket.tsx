// ─── Desempenho por mercado + calibração ─────────────────────────────────────
// "O que bate mais": taxa de acerto por mercado (só liquidados = hit+miss).
// Calibração: a taxa REAL de cada faixa de confiança vs o que ela prometia —
// se um pick de 70% acerta 55%, o modelo está superconfiante nessa faixa.

import type { PerformanceBreakdown, PerfRow } from '../types'
import { marketLabel } from '../lib/markets'

function pct(v: number): string {
  return `${Math.round(v * 100)}%`
}

// Cor da taxa: verde ≥60%, âmbar ≥45%, vermelho abaixo.
function rateColor(acc: number): string {
  if (acc >= 0.6) return 'text-emerald-300'
  if (acc >= 0.45) return 'text-amber-300'
  return 'text-red-300'
}

function Bar({ acc }: { acc: number }) {
  const c = acc >= 0.6 ? 'bg-emerald-400' : acc >= 0.45 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <div className={`h-full rounded-full ${c}`} style={{ width: `${Math.max(2, Math.min(100, acc * 100))}%` }} />
    </div>
  )
}

const CONF_ORDER = ['90-100', '80-89', '70-79', '60-69', '<60']
// Ponto médio prometido por faixa (pra medir a calibração).
const CONF_MID: Record<string, number> = {
  '90-100': 0.95, '80-89': 0.845, '70-79': 0.745, '60-69': 0.645, '<60': 0.55,
}

const ERA_LABEL: Record<string, string> = {
  legacy_com_odds: 'Antes (engine com odds)',
  atual_sem_odds: 'Agora (confidence-first)',
}

export default function PerformanceByMarket({ data }: { data: PerformanceBreakdown }) {
  const markets = Object.entries(data.by_market)
    .filter(([, b]) => b.won + b.lost > 0)
    .sort((a, b) => b[1].accuracy - a[1].accuracy)
  const conf = CONF_ORDER
    .filter(k => data.by_confidence[k] && data.by_confidence[k].won + data.by_confidence[k].lost > 0)
    .map(k => [k, data.by_confidence[k]] as [string, PerfRow])
  const eras = Object.entries(data.by_era ?? {}).filter(([, b]) => b.won + b.lost > 0)

  return (
    <div className="space-y-5">
      {eras.length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Legado (com odds) × Atual (confidence-first)
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {eras.map(([k, b]) => (
              <div key={k} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-zinc-500">{ERA_LABEL[k] ?? k}</div>
                  <div className="text-[11px] text-zinc-600 tabular">{b.won}V · {b.lost}D · {b.total} total</div>
                </div>
                <div className={`text-[20px] font-extrabold tabular ${rateColor(b.accuracy)}`}>{pct(b.accuracy)}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-zinc-600 mt-1.5">
            Picks "antes" usavam o engine de valor (odds) e incluem mercados que o sistema não gera mais
            (asian handicap, DNB) — só liquidaram agora que os workers voltaram a rodar.
          </p>
        </div>
      )}

    <div className="grid gap-5 lg:grid-cols-2">
      {/* Por mercado */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Por mercado</div>
        <div className="space-y-2">
          {markets.map(([m, b]) => (
            <div key={m} className="flex items-center gap-3">
              <div className="w-40 shrink-0 text-[12px] text-zinc-300 truncate">{marketLabel(m)}</div>
              <Bar acc={b.accuracy} />
              <div className={`w-10 shrink-0 text-right text-[12px] font-extrabold tabular ${rateColor(b.accuracy)}`}>
                {pct(b.accuracy)}
              </div>
              <div className="w-16 shrink-0 text-right text-[11px] text-zinc-500 tabular">{b.won}/{b.won + b.lost}</div>
            </div>
          ))}
          {markets.length === 0 && <p className="text-[12px] text-zinc-500">Sem picks liquidados ainda.</p>}
        </div>
      </div>

      {/* Calibração */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
          Calibração (confiança × acerto real)
        </div>
        <div className="space-y-2">
          {conf.map(([k, b]) => {
            const delta = b.accuracy - (CONF_MID[k] ?? 0.5)
            const tone = Math.abs(delta) <= 0.1 ? 'text-zinc-400' : delta < 0 ? 'text-red-300' : 'text-emerald-300'
            return (
              <div key={k} className="flex items-center gap-3">
                <div className="w-20 shrink-0 text-[12px] text-zinc-300">{k}%</div>
                <Bar acc={b.accuracy} />
                <div className={`w-10 shrink-0 text-right text-[12px] font-extrabold tabular ${rateColor(b.accuracy)}`}>
                  {pct(b.accuracy)}
                </div>
                <div className={`w-12 shrink-0 text-right text-[11px] font-bold tabular ${tone}`}>
                  {delta >= 0 ? '+' : ''}{Math.round(delta * 100)}
                </div>
              </div>
            )
          })}
          {conf.length === 0 && <p className="text-[12px] text-zinc-500">Sem dados de calibração ainda.</p>}
        </div>
        <p className="text-[10px] text-zinc-600 mt-2">
          A última coluna é o desvio (acerto real − prometido). Negativo = modelo superconfiante nessa faixa.
        </p>
      </div>
    </div>
    </div>
  )
}
