// ─── ResetPasswordPage ──────────────────────────────────────────────────────
// Etapa 2 da recuperação: usuário chega pelo link do email
//   /reset-password?token=xxx
// Digita nova senha, backend troca, devolve access token, loga direto.

import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, setToken } from '../services/api'
import { useAuth } from '../auth/AuthContext'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { refresh } = useAuth()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sem token, link inválido — manda pro login.
  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não batem.')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.resetPassword(token, password)
      // Backend devolve access_token + user — loga direto.
      setToken(res.data.access_token)
      await refresh()
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        setError('Link expirado ou inválido. Pede um novo na tela de "esqueci minha senha".')
      } else {
        setError(detail || 'Não foi possível redefinir a senha. Tenta de novo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <img
            src="/clutchpro-symbol.png"
            alt=""
            className="h-14 w-auto object-contain"
          />
          <div
            className="text-[22px] font-extrabold tracking-[-0.02em] leading-none"
            style={{ fontFamily: 'var(--font-display, inherit)' }}
          >
            <span className="text-white">Clutch</span>
            <span className="text-brand-500">Pro</span>
          </div>
        </div>

        <div className="card-premium p-6">
          <h1 className="text-white font-bold text-lg tracking-tight">
            Nova senha
          </h1>
          <p className="text-zinc-500 text-[13px] mt-1 mb-5">
            Define sua nova senha. Você fica logado em seguida.
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Nova senha
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-ink-850 border border-white/[0.06] text-white text-[13px] focus:outline-none focus:border-brand-500/60 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-ink-850 border border-white/[0.06] text-white text-[13px] focus:outline-none focus:border-brand-500/60 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-400 leading-snug">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !password || !confirm}
              className="w-full h-10 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-ink-900 font-bold text-[13px] transition-colors"
            >
              {submitting ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>

          <div className="mt-4 text-center text-[12px] text-zinc-500">
            <button
              onClick={() => navigate('/login')}
              className="text-brand-300 font-semibold hover:text-brand-200"
            >
              Voltar pro login
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-4">
          ClutchPro · análise não é recomendação de aposta.
        </p>
      </div>
    </div>
  )
}
