// ─── AdminUsersPage (admin, jun/2026) ────────────────────────────────────────
// Gestão de usuários: lista, busca, e edição inline de plano / ativo / admin.
// Admin-only (guard de role no App + 403 server-side). Dados de /admin/users.
//
// Hoje os planos ainda não diferenciam o que a pessoa vê — a coluna existe
// pra já organizar e evoluir aos poucos. role=admin libera esta área.

import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../auth/AuthContext'
import { ROLES, ROLE_LABELS } from '../auth/permissions'
import { toDisplayName } from '../lib/format'
import { SectionEmpty } from '../components/dashboard/parts'
import type { AdminUser, AdminUserUpdate } from '../types'

// Planos disponíveis (starter — dá pra ampliar). 'free' é o default.
const PLAN_OPTIONS = ['free', 'basic', 'pro', 'premium'] as const

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Busca com debounce (refaz a chamada 350ms após parar de digitar).
  useEffect(() => {
    let cancelled = false
    const t = setTimeout(() => {
      setLoading(true)
      setError(false)
      api.getAdminUsers(search.trim() || undefined)
        .then(r => { if (!cancelled) setUsers(r.data) })
        .catch(() => { if (!cancelled) setError(true) })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 350)
    return () => { cancelled = true; clearTimeout(t) }
  }, [search])

  async function patch(u: AdminUser, body: AdminUserUpdate) {
    setSavingId(u.id)
    setNotice(null)
    try {
      const r = await api.updateAdminUser(u.id, body)
      setUsers(prev => prev.map(x => (x.id === u.id ? r.data : x)))
    } catch (e: unknown) {
      const detail =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setNotice(detail || 'Não foi possível salvar a alteração.')
    } finally {
      setSavingId(null)
    }
  }

  const adminCount = useMemo(() => users.filter(u => u.role === 'admin').length, [users])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Usuários
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {users.length} usuário{users.length === 1 ? '' : 's'} · {adminCount} admin
            {adminCount === 1 ? '' : 's'}. Edite plano, acesso e status.
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por email ou nome…"
          className="w-full sm:w-72 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/25 text-zinc-100 text-sm px-3 py-2 placeholder:text-zinc-600"
        />
      </header>

      {notice && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="card-premium p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <SectionEmpty icon="⚠️" text="Não foi possível carregar os usuários. Tente atualizar." />
      ) : users.length === 0 ? (
        <SectionEmpty icon="👤" text="Nenhum usuário encontrado para esta busca." />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 border-b border-white/[0.06]">
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3 text-center">Perfil</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Desde</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isSelf = me?.id === u.id
                  const saving = savingId === u.id
                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-white/[0.04] last:border-b-0 ${saving ? 'opacity-60' : ''}`}
                    >
                      {/* Usuário */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="grid place-items-center w-8 h-8 rounded-full bg-brand-500/15 text-brand-300 text-[12px] font-bold shrink-0">
                            {(u.name || u.email).slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-zinc-100 truncate flex items-center gap-1.5">
                              {toDisplayName(u.name || u.email.split('@')[0])}
                              {isSelf && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/15 rounded px-1 py-0.5">
                                  você
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Plano */}
                      <td className="px-4 py-3">
                        <select
                          value={u.plan}
                          disabled={saving}
                          onChange={e => patch(u, { plan: e.target.value })}
                          style={{ colorScheme: 'dark' }}
                          className="rounded-md bg-white/[0.04] border border-white/[0.08] text-[12px] text-zinc-200 px-2 py-1 focus:outline-none focus:border-brand-500/50 capitalize"
                        >
                          {/* Inclui o plano atual mesmo se for um valor fora da lista. */}
                          {Array.from(new Set([u.plan, ...PLAN_OPTIONS])).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </td>

                      {/* Perfil (role): user / analista / admin. Analista vê
                          só Performance; admin vê tudo. Não dá pra alterar o
                          próprio (backend também bloqueia auto-rebaixar). */}
                      <td className="px-4 py-3 text-center">
                        <select
                          value={u.role}
                          disabled={saving || isSelf}
                          title={isSelf ? 'Você não pode alterar seu próprio perfil' : undefined}
                          onChange={e => patch(u, { role: e.target.value })}
                          // colorScheme dark: faz a LISTA de opções do select nativo
                          // renderizar em modo escuro (senão abre com fundo branco).
                          style={{ colorScheme: 'dark' }}
                          className="rounded-md bg-white/[0.04] border border-white/[0.08] text-[12px] text-zinc-200 px-2 py-1 focus:outline-none focus:border-brand-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {/* Inclui o role atual mesmo se for um valor fora da lista. */}
                          {Array.from(new Set([u.role, ...ROLES])).map(r => (
                            <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                          ))}
                        </select>
                      </td>

                      {/* Ativo toggle */}
                      <td className="px-4 py-3 text-center">
                        <Toggle
                          on={u.is_active}
                          variant="success"
                          disabled={saving || isSelf}
                          title={isSelf ? 'Você não pode desativar a si mesmo' : undefined}
                          onChange={on => patch(u, { is_active: on })}
                        />
                      </td>

                      {/* Desde */}
                      <td className="px-4 py-3 text-[12px] text-zinc-500 whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Toggle pill compacto (on/off). variant 'brand' (admin) | 'success' (ativo).
function Toggle({
  on, onChange, disabled, title, variant = 'brand',
}: {
  on: boolean
  onChange: (on: boolean) => void
  disabled?: boolean
  title?: string
  variant?: 'brand' | 'success'
}) {
  const onColor = variant === 'success'
    ? 'bg-emerald-500/80'
    : 'bg-brand-500/80'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      title={title}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        on ? onColor : 'bg-white/[0.10]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
