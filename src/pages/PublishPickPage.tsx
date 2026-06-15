// ─── PublishPickPage — publicar/gerenciar entradas ao vivo (analista/admin) ──
// Permissão publishPicks (gate de rota + 403 server-side). Cria entradas que
// aparecem na aba "Entradas ao vivo" na hora, e permite liquidar (green/red/
// anular) ou remover.

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api } from '../services/api'
import type { FootballLivePick, FootballLivePickCreate, FootballMatch } from '../types'
import { MARKETS } from '../lib/markets'
import LivePickCard from '../components/LivePickCard'
import { SectionEmpty } from '../components/dashboard/parts'
import { Skeleton } from '../components/Skeleton'
import { matchupLabel } from '../lib/match'

const MANUAL = '__manual__'

const EMPTY_FORM: FootballLivePickCreate = {
  match: '', match_id: null, league: '', market: '1x2', selection: '',
  line: null, odd: null, confidence: null, reason: '',
}

export default function PublishPickPage() {
  const [picks, setPicks] = useState<FootballLivePick[] | null>(null)
  const [form, setForm] = useState<FootballLivePickCreate>({ ...EMPTY_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null)
  const [busyId, setBusyId] = useState<number | string | null>(null)
  const [confirmingId, setConfirmingId] = useState<number | string | null>(null)
  const [matches, setMatches] = useState<FootballMatch[]>([])
  const [matchSel, setMatchSel] = useState('')

  useEffect(() => {
    api.getMatchesToday()
      .then(r => setMatches((r.data.matches ?? []).filter(m => m.status !== 'finished')))
      .catch(() => setMatches([]))
  }, [])

  const load = useCallback(async () => {
    try {
      const r = await api.getLivePicks()
      setPicks(r.data)
    } catch {
      setPicks([])
      setFeedback({ kind: 'err', msg: 'Falha ao carregar as entradas.' })
    }
  }, [])

  useEffect(() => { load() }, [load])

  function set<K extends keyof FootballLivePickCreate>(k: K, v: FootballLivePickCreate[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function pickMatch(id: string) {
    const m = matches.find(x => String(x.id) === id)
    if (!m) return
    setForm(f => ({ ...f, match: matchupLabel(m), match_id: m.id, league: m.league_name ?? '' }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.match.trim() || !form.selection.trim()) {
      setFeedback({ kind: 'err', msg: 'Preencha o jogo e a seleção.' })
      return
    }
    setSubmitting(true)
    setFeedback(null)
    try {
      await api.createLivePick({
        ...form,
        line: form.line || null,
        odd: form.odd || null,
        league: form.league?.trim() || null,
        reason: form.reason?.trim() || '',
      })
      setForm({ ...EMPTY_FORM })
      setMatchSel('')
      setFeedback({ kind: 'ok', msg: 'Entrada publicada! Já está visível pros usuários.' })
      load()
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setFeedback({
        kind: 'err',
        msg: typeof detail === 'string' ? detail : 'Não foi possível publicar. Confira os campos.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function settle(pick: FootballLivePick, status: 'won' | 'lost' | 'void') {
    setBusyId(pick.id)
    try {
      await api.updateLivePick(pick.id, { status })
      load()
    } catch {
      setFeedback({ kind: 'err', msg: 'Não foi possível atualizar o status.' })
    } finally {
      setBusyId(null)
    }
  }

  async function remove(pick: FootballLivePick) {
    if (confirmingId !== pick.id) {
      setConfirmingId(pick.id)
      return
    }
    setBusyId(pick.id)
    setConfirmingId(null)
    try {
      await api.deleteLivePick(pick.id)
      setFeedback({ kind: 'ok', msg: 'Entrada removida.' })
      load()
    } catch {
      setFeedback({ kind: 'err', msg: 'Não foi possível remover. Tente novamente.' })
    } finally {
      setBusyId(null)
    }
  }

  const active = picks?.filter(p => p.status === 'active') ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
          Publicar entrada
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Crie entradas ao vivo pros usuários. Elas aparecem na aba “Entradas ao vivo” na hora.
        </p>
      </header>

      {feedback && (
        <div className={`rounded-lg px-3 py-2 text-[13px] border ${
          feedback.kind === 'ok'
            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
            : 'border-red-500/25 bg-red-500/10 text-red-300'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={submit} className="card-premium p-5 space-y-4">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-zinc-200">➕ Nova entrada</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Jogo *">
            {matches.length > 0 ? (
              <>
                <select
                  value={matchSel}
                  style={{ colorScheme: 'dark' }}
                  className={inputCls}
                  onChange={e => {
                    const v = e.target.value
                    setMatchSel(v)
                    if (v === MANUAL || v === '') setForm(f => ({ ...f, match: '', match_id: null }))
                    else pickMatch(v)
                  }}
                >
                  <option value="">Selecione o jogo…</option>
                  {matches.map(m => (
                    <option key={m.id} value={String(m.id)}>
                      {matchupLabel(m)}{m.status === 'live' ? ' · ao vivo' : ''}
                    </option>
                  ))}
                  <option value={MANUAL}>✏️ Outro (digitar)</option>
                </select>
                {matchSel === MANUAL && (
                  <input required value={form.match} onChange={e => set('match', e.target.value)}
                    placeholder="Flamengo x Palmeiras" className={`${inputCls} mt-2`} maxLength={100} />
                )}
              </>
            ) : (
              <input required value={form.match} onChange={e => set('match', e.target.value)}
                placeholder="Flamengo x Palmeiras" className={inputCls} maxLength={100} />
            )}
          </Field>

          <Field label="Mercado *">
            <select value={form.market} onChange={e => set('market', e.target.value)}
              style={{ colorScheme: 'dark' }} className={inputCls}>
              {MARKETS.map(m => <option key={m.id} value={String(m.id)}>{m.label}</option>)}
            </select>
          </Field>

          <Field label="Seleção *">
            <input required value={form.selection} onChange={e => set('selection', e.target.value)}
              placeholder="Casa / Over / Ambas marcam…" className={inputCls} maxLength={80} />
          </Field>

          <Field label="Linha (opcional)">
            <input type="number" step="0.25" value={form.line ?? ''}
              onChange={e => set('line', e.target.value ? Number(e.target.value) : null)}
              placeholder="2.5" className={inputCls} />
          </Field>

          <Field label="Odd (opcional)">
            <input type="number" step="0.01" min="1.01" value={form.odd ?? ''}
              onChange={e => set('odd', e.target.value ? Number(e.target.value) : null)}
              placeholder="1.85" className={inputCls} />
          </Field>

          <Field label="Confiança (opcional)">
            <select value={form.confidence ?? ''} style={{ colorScheme: 'dark' }}
              onChange={e => set('confidence', (e.target.value || null) as FootballLivePickCreate['confidence'])}
              className={inputCls}>
              <option value="">—</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </Field>

          <Field label="Motivo (opcional)" className="sm:col-span-2 lg:col-span-3">
            <input value={form.reason ?? ''} onChange={e => set('reason', e.target.value)}
              placeholder="Mandante pressionando, linha de gols com valor…" className={inputCls} maxLength={280} />
          </Field>
        </div>
        <button type="submit" disabled={submitting}
          className="rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 transition-colors">
          {submitting ? 'Publicando…' : 'Publicar entrada'}
        </button>
      </form>

      {/* Ativas */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-zinc-200">
          📣 Ativas ({active.length})
        </h2>
        {picks === null ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : active.length === 0 ? (
          <SectionEmpty icon="📣" text="Nenhuma entrada ativa. Publique a primeira no formulário acima." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map(p => (
              <LivePickCard
                key={p.id}
                pick={p}
                manage
                busy={busyId === p.id}
                confirming={confirmingId === p.id}
                onSettle={status => settle(p, status)}
                onRemove={() => remove(p)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-brand-500/50 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-500/25 text-zinc-100 text-sm px-3 py-2 ' +
  'placeholder:text-zinc-600'

function Field({
  label, children, className = '',
}: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
      {children}
    </label>
  )
}
